require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const crypto = require("crypto");
const { kmeans1D } = require("./kmeans");

const app = express();
app.use(cors());
app.use(express.json());

// First defined env var wins, so common alternative names also work
const env = (...names) => {
  const found = names.find((n) => process.env[n] !== undefined && process.env[n] !== "");
  return found ? process.env[found] : undefined;
};

const pool = mysql.createPool({
  host: env("DB_HOST", "MYSQL_HOST", "MYSQLHOST", "DATABASE_HOST", "HOST") || "localhost",
  port: Number(env("DB_PORT", "MYSQL_PORT", "MYSQLPORT", "DATABASE_PORT")) || 3306,
  user: env("DB_USER", "DB_USERNAME", "MYSQL_USER", "MYSQLUSER", "DATABASE_USER", "USER_DB"),
  password: env("DB_PASSWORD", "DB_PASS", "MYSQL_PASSWORD", "MYSQLPASSWORD", "DATABASE_PASSWORD"),
  database: env("DB_NAME", "DB_DATABASE", "MYSQL_DATABASE", "MYSQLDATABASE", "DATABASE_NAME", "DATABASE"),
  waitForConnections: true,
  connectionLimit: 10,
});

// Column names in the DB table (override in .env if the table uses a prefix, e.g. NinSom_name)
const COL = {
  id: process.env.COL_ID || "id",
  name: process.env.COL_NAME || "name",
  position: process.env.COL_POSITION || "position",
  status: process.env.COL_STATUS || "status",
  salary: process.env.COL_SALARY || "salary",
};
const TABLE = mysql.escapeId(env("DB_TABLE", "TABLE_NAME", "MYSQL_TABLE") || "employees");
const USERS_TABLE = mysql.escapeId(env("USERS_TABLE") || "Pasu_userexam");
const SELECT_SQL = `SELECT ?? AS id, ?? AS name, ?? AS position, ?? AS status, ?? AS salary FROM ${TABLE}`;
const SELECT_PARAMS = [COL.id, COL.name, COL.position, COL.status, COL.salary];

const toEmployee = (row) => ({
  id: String(row.id),
  name: row.name,
  position: row.position,
  status: row.status,
  salary: Number(row.salary),
});

// Password hashing with built-in scrypt (stored as salt:hash, hex)
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString("hex")}`;
};
const verifyPassword = (password, stored) => {
  const [salt, hash] = String(stored).split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = crypto.scryptSync(password, salt, expected.length);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
};

// Returns { error } or { name, position, salary } for employee input
const validateEmployee = ({ name, position, salary } = {}) => {
  if (typeof name !== "string" || name.trim() === "") return { error: "Name is required" };
  if (typeof position !== "string" || position.trim() === "") return { error: "Position is required" };
  const usable = typeof salary === "number" || (typeof salary === "string" && salary.trim() !== "");
  const salaryNum = usable ? Number(salary) : NaN;
  if (!Number.isFinite(salaryNum) || salaryNum <= 0) return { error: "Salary must be a number greater than 0" };
  return { name: name.trim(), position: position.trim(), salary: salaryNum };
};

const parseId = (raw) => (/^[1-9]\d*$/.test(raw) ? Number(raw) : null);
const serverError = (res, err) => {
  if (err) console.error("Request error:", err.code || "", err.sqlMessage || err.message);
  return res.status(500).json({ success: false, message: "Internal server error" });
};

async function findEmployee(id) {
  const [rows] = await pool.query(`${SELECT_SQL} WHERE ?? = ?`, [...SELECT_PARAMS, COL.id, id]);
  return rows.length ? toEmployee(rows[0]) : null;
}

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    const invalid = () =>
      res.status(401).json({ success: false, message: "Invalid username or password" });
    if (typeof username !== "string" || typeof password !== "string") return invalid();

    if (username === "admin" && password === "password123") {
      return res.status(200).json({ success: true, token: "mock-jwt-token" });
    }
    const [rows] = await pool.query(`SELECT password FROM ${USERS_TABLE} WHERE username = ?`, [username.trim()]);
    if (rows.length && verifyPassword(password, rows[0].password)) {
      return res.status(200).json({ success: true, token: "mock-jwt-token" });
    }
    invalid();
  } catch (err) {
    serverError(res, err);
  }
});

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (typeof username !== "string" || !/^[A-Za-z0-9_]{3,30}$/.test(username.trim())) {
      return res.status(400).json({
        success: false,
        message: "Username must be 3-30 characters (letters, numbers, underscore)",
      });
    }
    if (typeof password !== "string" || password.length < 6 || password.length > 100) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }
    const name = username.trim();
    if (name.toLowerCase() === "admin") {
      return res.status(409).json({ success: false, message: "Username already taken" });
    }
    try {
      await pool.query(`INSERT INTO ${USERS_TABLE} (username, password) VALUES (?, ?)`, [name, hashPassword(password)]);
    } catch (e) {
      if (e && e.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ success: false, message: "Username already taken" });
      }
      throw e;
    }
    res.status(201).json({ success: true, message: "Registered successfully" });
  } catch (err) {
    serverError(res, err);
  }
});

// Must be registered before any /:id route
router.get("/employees/salary-clusters", async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT ?? AS salary FROM ${TABLE}`, [COL.salary]);
    const clusters = kmeans1D(rows.map((r) => Number(r.salary)), 3);
    res.status(200).json({ success: true, clusters });
  } catch (err) {
    serverError(res, err);
  }
});

router.get("/employees", async (req, res) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    let sql = SELECT_SQL;
    let params = [...SELECT_PARAMS];
    if (search) {
      const escaped = search.replace(/[\\%_]/g, (ch) => "\\" + ch); // treat % and _ literally
      const like = "%" + escaped + "%";
      sql += " WHERE (?? LIKE ? OR ?? LIKE ?)";
      params.push(COL.name, like, COL.position, like);
    }
    const [rows] = await pool.query(sql + " ORDER BY ??", [...params, COL.id]);
    res.status(200).json(rows.map(toEmployee));
  } catch (err) {
    serverError(res, err);
  }
});

router.post("/employees", async (req, res) => {
  try {
    const v = validateEmployee(req.body || {});
    if (v.error) return res.status(400).json({ success: false, message: v.error });
    const [result] = await pool.query(
      `INSERT INTO ${TABLE} (??, ??, ??, ??) VALUES (?, ?, 'Active', ?)`,
      [COL.name, COL.position, COL.status, COL.salary, v.name, v.position, v.salary]
    );
    res.status(201).json(await findEmployee(result.insertId));
  } catch (err) {
    serverError(res, err);
  }
});

// Edit name / position / salary (status has its own toggle route)
router.put("/employees/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (id === null || !(await findEmployee(id))) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    const v = validateEmployee(req.body || {});
    if (v.error) return res.status(400).json({ success: false, message: v.error });
    await pool.query(`UPDATE ${TABLE} SET ?? = ?, ?? = ?, ?? = ? WHERE ?? = ?`, [
      COL.name, v.name, COL.position, v.position, COL.salary, v.salary, COL.id, id,
    ]);
    res.status(200).json(await findEmployee(id));
  } catch (err) {
    serverError(res, err);
  }
});

router.put("/employees/:id/status", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(404).json({ success: false, message: "Employee not found" });
    const [result] = await pool.query(
      `UPDATE ${TABLE} SET ?? = CASE WHEN ?? = 'Active' THEN 'On Leave' ELSE 'Active' END WHERE ?? = ?`,
      [COL.status, COL.status, COL.id, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    res.status(200).json(await findEmployee(id));
  } catch (err) {
    serverError(res, err);
  }
});

router.delete("/employees/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(404).json({ success: false, message: "Employee not found" });
    const [result] = await pool.query(`DELETE FROM ${TABLE} WHERE ?? = ?`, [COL.id, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    serverError(res, err);
  }
});

app.use("/api", router);

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && (err.type === "entity.parse.failed" || err instanceof SyntaxError)) {
    return res.status(400).json({ success: false, message: "Malformed JSON body" });
  }
  serverError(res, err);
});

process.on("uncaughtException", (e) => console.error("uncaughtException:", e.message));
process.on("unhandledRejection", (e) => console.error("unhandledRejection:", e && e.message));

const PORT = process.env.PORT || 3034;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`HR backend listening on 0.0.0.0:${PORT}`);
  pool
    .query("SELECT 1")
    .then(() => console.log("Database connection: OK"))
    .catch(() => console.error("Database connection: FAILED"));
});
