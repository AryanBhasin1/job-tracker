const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const userRoutes = require("./users");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// User auth routes
app.use("/auth", userRoutes);

// Middleware to protect job routes
const auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// In-memory jobs database
let jobs = [];

// GET all jobs (protected)
app.get("/jobs", auth, (req, res) => {
  res.json(jobs);
});

// POST a new job (protected)
app.post("/jobs", auth, (req, res) => {
  const { company, title, status, date, notes } = req.body;
  const newJob = { id: uuidv4(), company, title, status, date, notes };
  jobs.push(newJob);
  res.status(201).json(newJob);
});

// PUT (update) a job by id (protected)
app.put("/jobs/:id", auth, (req, res) => {
  const { id } = req.params;
  const { company, title, status, date, notes } = req.body;
  const jobIndex = jobs.findIndex(job => job.id === id);

  if (jobIndex === -1) return res.status(404).json({ message: "Job not found" });

  jobs[jobIndex] = { id, company, title, status, date, notes };
  res.json(jobs[jobIndex]);
});

// DELETE a job by id (protected)
app.delete("/jobs/:id", auth, (req, res) => {
  jobs = jobs.filter(job => job.id !== req.params.id);
  res.json({ message: "Job deleted" });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
