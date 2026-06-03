# InternKaro

A web-based internship marketplace connecting Pakistani university students with startups and mid-sized companies through skill-based discovery — not connections.

Built as a Database Systems course project at the University of Lahore.

---

## The Problem

Students at non-elite Pakistani universities have the skills but not the network. Most internship pipelines run on referrals. InternKaro removes that luck factor.

---

## Features

- Browse open internships with filters for city and work type (remote / onsite / hybrid)
- Student and company profile management
- Application tracking with status updates (pending → reviewed → accepted / rejected)
- Admin dashboard with live stats
- Seed data included for Systems Limited, Netsol, Careem, and Daraz

---

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Backend  | Node.js + Express       |
| Database | MySQL                   |
| Frontend | Vanilla HTML / CSS / JS |

---

## Getting Started

### Prerequisites

- Node.js v18+
- MySQL running locally

### Setup

```bash
git clone https://github.com/taimoorashraf-xo/Database-Systems-Project.git
cd Database-Systems-Project
npm install
```

Create a `.env` file in the root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
```

Then start the server:

```bash
npm start
```

Open `http://localhost:3000` in your browser. The database and tables are created automatically on first run.

---

## Project Structure

```
internkaro/
├── server.js       # Express server + all API routes
├── index.html      # Single-page frontend
├── package.json
└── .env            # Your local DB credentials (not committed)
```

---

## API Routes

| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /api/stats                  | Dashboard counts         |
| GET    | /api/companies              | List all companies       |
| POST   | /api/companies              | Add a company            |
| DELETE | /api/companies/:id          | Remove a company         |
| GET    | /api/students               | List / search students   |
| POST   | /api/students               | Register a student       |
| DELETE | /api/students/:id           | Remove a student         |
| GET    | /api/internships            | List open internships    |
| POST   | /api/internships            | Post an internship       |
| PATCH  | /api/internships/:id/close  | Close an internship      |
| GET    | /api/applications           | List applications        |
| POST   | /api/applications           | Submit an application    |
| PATCH  | /api/applications/:id       | Update status            |
| DELETE | /api/applications/:id       | Withdraw application     |

---

## Author

Taimoor Ashraf — BS Computer Science, University of Lahore (SAP ID: 70173199)
