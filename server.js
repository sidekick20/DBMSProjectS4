import express from "express";
import mysql from "mysql2";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
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


app.post("/applications", (req, res) => {
  const { role, status } = req.body;

  const sql = "INSERT INTO applications (role, status) VALUES (?, ?)";
  db.query(sql, [role, status], (err) => {
    if (err) return res.json(err);
    res.json("Added");
  });
});


app.get("/applications", (req, res) => {
  db.query("SELECT * FROM applications", (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});