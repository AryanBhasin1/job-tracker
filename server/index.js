// server/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

let jobs = []; // in-memory database (reset on server restart)

// GET all jobs
app.get('/jobs', (req, res) => {
    res.json(jobs);
});

// POST a new job
app.post('/jobs', (req, res) => {
    const { company, title, status, date, notes } = req.body;
    const newJob = { id: uuidv4(), company, title, status, date, notes };
    jobs.push(newJob);
    res.status(201).json(newJob);
});

// PUT (update) a job by id
app.put('/jobs/:id', (req, res) => {
    const { id } = req.params;
    const { company, title, status, date, notes } = req.body;
    const jobIndex = jobs.findIndex(job => job.id === id);

    if (jobIndex === -1) return res.status(404).json({ message: 'Job not found' });

    jobs[jobIndex] = { id, company, title, status, date, notes };
    res.json(jobs[jobIndex]);
});

// DELETE a job by id
app.delete('/jobs/:id', (req, res) => {
    const { id } = req.params;
    jobs = jobs.filter(job => job.id !== id);
    res.json({ message: 'Job deleted' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
