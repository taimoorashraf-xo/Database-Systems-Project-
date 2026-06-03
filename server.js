const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Kiyotaka@111",
  multipleStatements: true,
});
const setup = `
CREATE DATABASE IF NOT EXISTS internkaro;
USE internkaro;

CREATE TABLE IF NOT EXISTS companies (
  company_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  industry VARCHAR(100),
  city VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  university VARCHAR(150),
  degree VARCHAR(100),
  semester INT,
  skills TEXT,
  cgpa DECIMAL(3,2),
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS internships (
  internship_id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  requirements TEXT,
  location VARCHAR(100),
  stipend INT DEFAULT 0,
  duration_months INT,
  type ENUM('remote','onsite','hybrid') DEFAULT 'onsite',
  status ENUM('open','closed') DEFAULT 'open',
  deadline DATE,
  posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS applications (
  application_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  internship_id INT NOT NULL,
  status ENUM('pending','reviewed','accepted','rejected') DEFAULT 'pending',
  cover_letter TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (internship_id) REFERENCES internships(internship_id) ON DELETE CASCADE,
  UNIQUE KEY unique_app (student_id, internship_id)
);

INSERT IGNORE INTO companies (company_id, name, industry, city, description) VALUES
(1,'Systems Limited','Software','Lahore','Leading IT company in Pakistan'),
(2,'Netsol Technologies','FinTech','Lahore','Global FinTech leader'),
(3,'Careem','Ride-hailing','Karachi','Super app for the region'),
(4,'Daraz','E-Commerce','Karachi','Pakistan biggest ecommerce platform');

INSERT IGNORE INTO students (student_id, full_name, email, university, degree, semester, skills, cgpa, city) VALUES
(1,'Ali Raza','ali@uol.edu.pk','University of Lahore','BS Computer Science',6,'Python, SQL, React',3.40,'Lahore'),
(2,'Sara Khan','sara@lums.edu.pk','LUMS','BS Business Administration',4,'Marketing, Excel, Canva',3.70,'Lahore'),
(3,'Usman Malik','usman@nust.edu.pk','NUST','BS Software Engineering',7,'Java, C++, MySQL',3.20,'Islamabad'),
(4,'Fatima Javed','fatima@pu.edu.pk','Punjab University','BS IT',5,'HTML, CSS, JavaScript',3.50,'Lahore');

INSERT IGNORE INTO internships (internship_id, company_id, title, requirements, location, stipend, duration_months, type, deadline) VALUES
(1,1,'Software Engineering Intern','Python or Java, OOP','Lahore',25000,3,'onsite','2026-06-30'),
(2,1,'Database Intern','MySQL, basic SQL','Lahore',20000,2,'hybrid','2026-06-15'),
(3,2,'FinTech Developer Intern','JavaScript, REST APIs','Lahore',30000,3,'onsite','2026-07-01'),
(4,3,'Marketing Intern','Social media, Excel','Remote',15000,2,'remote','2026-06-20'),
(5,4,'Data Analyst Intern','Python, Excel, SQL','Karachi',20000,3,'hybrid','2026-07-15');

INSERT IGNORE INTO applications (application_id, student_id, internship_id, status, cover_letter) VALUES
(1,1,1,'pending','I am a CS student passionate about software development'),
(2,1,2,'reviewed','I have hands-on experience with MySQL'),
(3,2,4,'accepted','I have run social media campaigns for my university society'),
(4,3,3,'pending','I have built REST APIs in my web engineering course'),
(5,4,1,'rejected','I am eager to learn enterprise development');
`;

db.connect((err) => {
  if (err) { console.error("MySQL connection failed:", err.message); process.exit(1); }
  console.log("Connected to MySQL");
  db.query(setup, (err) => {
    if (err) { console.error("Setup failed:", err.message); process.exit(1); }
    db.changeUser({ database: "internkaro" }, (err) => {
      if (err) { console.error("DB switch failed:", err.message); process.exit(1); }
      console.log("Database ready at http://localhost:3000");
    });
  });
});

// ── COMPANIES ─────────────────────────────────────────────────
app.get("/api/companies", (req, res) => {
  db.query("SELECT * FROM companies ORDER BY created_at DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/companies", (req, res) => {
  const { name, industry, city, description } = req.body;
  db.query("INSERT INTO companies (name, industry, city, description) VALUES (?, ?, ?, ?)",
    [name, industry, city, description], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ company_id: result.insertId, name, industry, city, description });
    });
});

app.delete("/api/companies/:id", (req, res) => {
  db.query("DELETE FROM companies WHERE company_id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ── STUDENTS ──────────────────────────────────────────────────
app.get("/api/students", (req, res) => {
  const search = req.query.search ? `%${req.query.search}%` : "%";
  db.query("SELECT * FROM students WHERE full_name LIKE ? OR university LIKE ? ORDER BY created_at DESC",
    [search, search], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
});

app.post("/api/students", (req, res) => {
  const { full_name, email, university, degree, semester, skills, cgpa, city } = req.body;
  db.query("INSERT INTO students (full_name, email, university, degree, semester, skills, cgpa, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [full_name, email, university, degree, semester, skills, cgpa, city], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ student_id: result.insertId, full_name, email, university, degree, semester, skills, cgpa, city });
    });
});

app.delete("/api/students/:id", (req, res) => {
  db.query("DELETE FROM students WHERE student_id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ── INTERNSHIPS ───────────────────────────────────────────────
app.get("/api/internships", (req, res) => {
  const { city, type } = req.query;
  let q = `SELECT i.*, c.name as company_name FROM internships i JOIN companies c ON i.company_id = c.company_id WHERE i.status = 'open'`;
  const params = [];
  if (city && city !== "all") { q += " AND i.location = ?"; params.push(city); }
  if (type && type !== "all") { q += " AND i.type = ?"; params.push(type); }
  q += " ORDER BY i.posted_at DESC";
  db.query(q, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/internships", (req, res) => {
  const { company_id, title, requirements, location, stipend, duration_months, type, deadline } = req.body;
  db.query("INSERT INTO internships (company_id, title, requirements, location, stipend, duration_months, type, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [company_id, title, requirements, location, stipend, duration_months, type, deadline], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ internship_id: result.insertId, ...req.body });
    });
});

app.patch("/api/internships/:id/close", (req, res) => {
  db.query("UPDATE internships SET status = 'closed' WHERE internship_id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ── APPLICATIONS ──────────────────────────────────────────────
app.get("/api/applications", (req, res) => {
  const { status } = req.query;
  let q = `SELECT a.*, s.full_name, s.university, s.cgpa, i.title, c.name as company_name
           FROM applications a
           JOIN students s ON a.student_id = s.student_id
           JOIN internships i ON a.internship_id = i.internship_id
           JOIN companies c ON i.company_id = c.company_id`;
  const params = [];
  if (status && status !== "all") { q += " WHERE a.status = ?"; params.push(status); }
  q += " ORDER BY a.applied_at DESC";
  db.query(q, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/applications", (req, res) => {
  const { student_id, internship_id, cover_letter } = req.body;
  db.query("INSERT INTO applications (student_id, internship_id, cover_letter) VALUES (?, ?, ?)",
    [student_id, internship_id, cover_letter], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ error: "Already applied to this internship" });
        return res.status(500).json({ error: err.message });
      }
      res.json({ application_id: result.insertId, student_id, internship_id, cover_letter, status: "pending" });
    });
});

app.patch("/api/applications/:id", (req, res) => {
  const { status } = req.body;
  db.query("UPDATE applications SET status = ? WHERE application_id = ?", [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.delete("/api/applications/:id", (req, res) => {
  db.query("DELETE FROM applications WHERE application_id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ── STATS ─────────────────────────────────────────────────────
app.get("/api/stats", (req, res) => {
  const q = `SELECT
    (SELECT COUNT(*) FROM students) as students,
    (SELECT COUNT(*) FROM companies) as companies,
    (SELECT COUNT(*) FROM internships WHERE status='open') as open_internships,
    (SELECT COUNT(*) FROM applications) as applications,
    (SELECT COUNT(*) FROM applications WHERE status='accepted') as accepted,
    (SELECT COUNT(*) FROM applications WHERE status='pending') as pending`;
  db.query(q, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows[0]);
  });
});

app.listen(3000, () => console.log("InternKaro running at http://localhost:3000"));
