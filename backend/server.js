const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ---- In-memory data ----
let employees = [
  { id: "1", name: "Somchai Prasert", position: "Junior Developer", status: "Active", salary: 18000 },
  { id: "2", name: "Malee Suksan", position: "Office Assistant", status: "Active", salary: 19500 },
  { id: "3", name: "Anan Boonmee", position: "Accountant", status: "On Leave", salary: 42000 },
  { id: "4", name: "Preeya Chaiyo", position: "Project Manager", status: "Active", salary: 47000 },
  { id: "5", name: "Krit Wongsa", position: "Senior Engineer", status: "Active", salary: 85000 },
  { id: "6", name: "Naree Thongdee", position: "Director", status: "Active", salary: 120000 },
];
let nextId = employees.length + 1; // separate counter, never array.length + 1 afterwards

const router = express.Router();

// ---- Auth ----
router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username === "string" && typeof password === "string" &&
      username === "admin" && password === "password123") {
    return res.status(200).json({ success: true, token: "mock-jwt-token" });
  }
  res.status(401).json({ success: false, message: "Invalid username or password" });
});

// ---- K-Means (1D) ----
function kmeans1D(values, kInput) {
  const sorted = [...values].sort((a, b) => a - b);
  const distinct = new Set(sorted).size;
  let k = kInput;
  if (sorted.length < 3 || distinct < 3) k = Math.max(1, distinct);

  let centroids;
  if (k === 3) {
    centroids = [sorted[0], sorted[Math.floor((sorted.length - 1) / 2)], sorted[sorted.length - 1]];
  } else {
    // k < 3: use distinct values as centroids
    centroids = [...new Set(sorted)].slice(0, k);
  }

  let assignment = new Array(values.length).fill(-1);
  for (let iter = 0; iter < 100; iter++) {
    let changed = false;
    const next = values.map((v) => {
      let best = 0;
      let bestDist = Infinity;
      centroids.forEach((c, i) => {
        const d = Math.abs(v - c);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    });
    for (let i = 0; i < next.length; i++) {
      if (next[i] !== assignment[i]) { changed = true; break; }
    }
    assignment = next;
    if (!changed) break;

    centroids = centroids.map((prev, i) => {
      let sum = 0, count = 0;
      assignment.forEach((a, idx) => { if (a === i) { sum += values[idx]; count++; } });
      return count === 0 ? prev : sum / count;
    });
  }

  const clusters = centroids.map((c, i) => ({
    centroid: c,
    count: assignment.filter((a) => a === i).length,
  }));
  return clusters;
}

// ---- Employees ----
// NOTE: salary-clusters is registered before any /:id route
router.get("/employees/salary-clusters", (req, res) => {
  try {
    const salaries = employees.map((e) => e.salary);
    if (salaries.length === 0) return res.status(200).json({ success: true, clusters: [] });
    const clusters = kmeans1D(salaries, 3)
      .sort((a, b) => a.centroid - b.centroid)
      .map((c, i) => ({ group: `Tier ${i + 1}`, centroid: Math.round(c.centroid), count: c.count }));
    res.status(200).json({ success: true, clusters });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to compute salary clusters" });
  }
});

router.get("/employees", (req, res) => res.status(200).json(employees));

router.post("/employees", (req, res) => {
  const { name, position, salary } = req.body || {};
  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ success: false, message: "Name is required" });
  }
  if (typeof position !== "string" || position.trim() === "") {
    return res.status(400).json({ success: false, message: "Position is required" });
  }
  const isBlankString = typeof salary === "string" && salary.trim() === "";
  const isNumberLike = typeof salary === "number" || typeof salary === "string";
  const salaryNum = isNumberLike && !isBlankString ? Number(salary) : NaN;
  if (!Number.isFinite(salaryNum) || salaryNum <= 0) {
    return res.status(400).json({ success: false, message: "Salary must be a number greater than 0" });
  }
  const employee = {
    id: String(nextId++),
    name: name.trim(),
    position: position.trim(),
    status: "Active",
    salary: salaryNum,
  };
  employees.push(employee);
  res.status(201).json(employee);
});

router.put("/employees/:id/status", (req, res) => {
  const emp = employees.find((e) => e.id === req.params.id);
  if (!emp) return res.status(404).json({ success: false, message: "Employee not found" });
  emp.status = emp.status === "Active" ? "On Leave" : "Active";
  res.status(200).json(emp);
});

router.delete("/employees/:id", (req, res) => {
  const idx = employees.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Employee not found" });
  employees.splice(idx, 1);
  res.status(200).json({ success: true });
});

app.use("/api", router);

// ---- 404 + error handlers ----
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && (err.type === "entity.parse.failed" || err instanceof SyntaxError)) {
    return res.status(400).json({ success: false, message: "Malformed JSON body" });
  }
  res.status(err && err.status ? err.status : 500).json({ success: false, message: "Internal server error" });
});

process.on("uncaughtException", (e) => console.error("uncaughtException:", e));
process.on("unhandledRejection", (e) => console.error("unhandledRejection:", e));

const PORT = process.env.PORT || 3034;
app.listen(PORT, "0.0.0.0", () => console.log(`HR backend listening on 0.0.0.0:${PORT}`));
