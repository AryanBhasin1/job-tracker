import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/jobs';

function App() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ company: '', title: '', status: '', date: '', notes: '' });
  const [filter, setFilter] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Load jobs from backend
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const res = await axios.get(API_URL);
    setJobs(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`${API_URL}/${editingId}`, form);
      setEditingId(null);
    } else {
      await axios.post(API_URL, form);
    }
    setForm({ company: '', title: '', status: '', date: '', notes: '' });
    fetchJobs();
  };

  const handleEdit = (job) => {
    setForm(job);
    setEditingId(job.id);
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchJobs();
  };

  const filteredJobs = filter ? jobs.filter(job => job.status === filter) : jobs;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Job Tracker</h1>

      {/* Job Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
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
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="">All Statuses</option>
        <option value="Applied">Applied</option>
        <option value="Interviewing">Interviewing</option>
        <option value="Rejected">Rejected</option>
        <option value="Offer">Offer</option>
      </select>

      {/* Job List */}
      <ul>
        {filteredJobs.map(job => (
          <li key={job.id} style={{ margin: '10px 0' }}>
            <strong>{job.company}</strong> - {job.title} ({job.status}) <br />
            {job.date} | {job.notes} <br />
            <button onClick={() => handleEdit(job)}>Edit</button>
            <button onClick={() => handleDelete(job.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
