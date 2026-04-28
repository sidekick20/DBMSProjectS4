import express from "express";
import mysql from "mysql2";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) console.log(err);
  else console.log("MySQL Connected");
});

app.get("/applications", (req, res) => {
  const { search, status, sort } = req.query;

  let sql = `
    SELECT id, company_name, role, status, salary, contact_name, contact_number, applied_date 
    FROM applications 
    WHERE 1=1
  `;
  const params = [];

 
  if (search) {
    sql += " AND (company_name LIKE ? OR role LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

 
  if (status && status !== "All") {
    sql += " AND status = ?";
    params.push(status);
  }

  
  if (sort === "old") {
    sql += " ORDER BY applied_date ASC, id ASC";
  } else {
    sql += " ORDER BY applied_date DESC, id DESC";
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.post("/applications", (req, res) => {
  const { 
    company_name, 
    role, 
    status, 
    salary, 
    contact_name, 
    contact_number 
  } = req.body;

  const sql = `
    INSERT INTO applications 
    (company_name, role, status, salary, contact_name, contact_number, applied_date)
    VALUES (?, ?, ?, ?, ?, ?, CURDATE())
  `;

  db.query(
    sql,
    [company_name, role, status, salary, contact_name, contact_number],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Application Added" });
    }
  );
});

app.delete("/applications/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM applications WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted" });
  });
});

app.put("/applications/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.query(
    "UPDATE applications SET status = ? WHERE id = ?",
    [status, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Updated" });
    }
  );
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});