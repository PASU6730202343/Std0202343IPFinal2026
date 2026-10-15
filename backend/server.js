require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const { kmeans1D } = require("./kmeans");

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

const toEmployee = (row) => ({
  id: String(row.id),
  name: row.name,
  position: row.position,
  status: row.status,
  salary: Number(row.salary),
});

const parseId = (raw) => (/^[1-9]\d*$/.test(raw) ? Number(raw) : null);
const serverError = (res) =>
  res.status(500).json({ success: false, message: "Internal server error" });

async function findEmployee(id) {
  const [rows] = await pool.query("SELECT * FROM employees WHERE id = ?", [id]);
  return rows.length ? toEmployee(rows[0]) : null;
}

const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username === "string" && typeof password === "string" &&
      username === "admin" && password === "password123") {
    return res.status(200).json({ success: true, token: "mock-jwt-token" });
  }
  res.status(401).json({ success: false, message: "Invalid username or password" });
});

// Must be registered before any /:id route
router.get("/employees/salary-clusters", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT salary FROM employees");
    const clusters = kmeans1D(rows.map((r) => Number(r.salary)), 3);
    res.status(200).json({ success: true, clusters });
  } catch (err) {
    serverError(res);
  }
});

router.get("/employees", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM employees ORDER BY id");
    res.status(200).json(rows.map(toEmployee));
  } catch (err) {
    serverError(res);
  }
});

router.post("/employees", async (req, res) => {
  try {
    const { name, position, salary } = req.body || {};
    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (typeof position !== "string" || position.trim() === "") {
      return res.status(400).json({ success: false, message: "Position is required" });
    }
    const usable = typeof salary === "number" || (typeof salary === "string" && salary.trim() !== "");
    const salaryNum = usable ? Number(salary) : NaN;
    if (!Number.isFinite(salaryNum) || salaryNum <= 0) {
      return res.status(400).json({ success: false, message: "Salary must be a number greater than 0" });
    }
    const [result] = await pool.query(
      "INSERT INTO employees (name, position, status, salary) VALUES (?, ?, 'Active', ?)",
      [name.trim(), position.trim(), salaryNum]
    );
    res.status(201).json(await findEmployee(result.insertId));
  } catch (err) {
    serverError(res);
  }
});

router.put("/employees/:id/status", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(404).json({ success: false, message: "Employee not found" });
    const [result] = await pool.query(
      "UPDATE employees SET status = CASE WHEN status = 'Active' THEN 'On Leave' ELSE 'Active' END WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    res.status(200).json(await findEmployee(id));
  } catch (err) {
    serverError(res);
  }
});

router.delete("/employees/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(404).json({ success: false, message: "Employee not found" });
    const [result] = await pool.query("DELETE FROM employees WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    serverError(res);
  }
});

app.use("/api", router);

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && (err.type === "entity.parse.failed" || err instanceof SyntaxError)) {
    return res.status(400).json({ success: false, message: "Malformed JSON body" });
  }
  serverError(res);
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
