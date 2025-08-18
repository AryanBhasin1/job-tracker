import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/jobs';

function App() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ company: '', title: '', status: '', date: '', notes: '' });
  const [filter, setFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch jobs
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(API_URL);
      setJobs(res.data);
    } catch (err) {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form);
        setEditingId(null);
      } else {
        await axios.post(API_URL, form);
      }
      setForm({ company: '', title: '', status: '', date: '', notes: '' });
      fetchJobs();
    } catch (err) {
      setError('Failed to save job');
    }
  };

  const handleEdit = (job) => {
    setForm(job);
    setEditingId(job.id);
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchJobs();
    } catch {
      setError('Failed to delete job');
    }
  };

  // Filter jobs
  const filteredJobs = filter ? jobs.filter(job => job.status === filter) : jobs;

  // Sort jobs by date
  const sortedJobs = filteredJobs.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="container">
      <h1>Job Tracker</h1>

      {/* Error & Loading */}
      {loading && <p>Loading jobs...</p>}
      {error && <p className="error">{error}</p>}

      {/* Job Form */}
      <form onSubmit={handleSubmit} className="job-form">
        <input name="company" placeholder="Company" value={form.company} onChange={handleChange} required />
        <input name="title" placeholder="Job Title" value={form.title} onChange={handleChange} required />
        <select name="status" value={form.status} onChange={handleChange} required>
          <option value="">Select Status</option>
          <option value="Applied">Applied</option>
          <option value="Interviewing">Interviewing</option>
          <option value="Rejected">Rejected</option>
          <option value="Offer">Offer</option>
        </select>
        <input type="date" name="date" value={form.date} onChange={handleChange} required />
        <input name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} />
        <button type="submit">{editingId ? 'Update Job' : 'Add Job'}</button>
      </form>

      {/* Filter */}
      <div className="filter">
        <label>Filter by Status: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="Applied">Applied</option>
          <option value="Interviewing">Interviewing</option>
          <option value="Rejected">Rejected</option>
          <option value="Offer">Offer</option>
        </select>
      </div>

      {/* Job List */}
      <ul className="job-list">
        {sortedJobs.map(job => (
          <li key={job.id} className="job-item">
            <strong>{job.company}</strong> - {job.title} ({job.status}) <br />
            {new Date(job.date).toLocaleDateString()} | {job.notes} <br />
            <button onClick={() => handleEdit(job)}>Edit</button>
            <button onClick={() => handleDelete(job.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
