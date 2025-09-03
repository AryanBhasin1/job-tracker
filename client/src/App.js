import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

axios.defaults.baseURL = "http://localhost:5000";

// Automatically attach token if stored
axios.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState('');

  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ company: '', title: '', status: '', date: '', notes: '' });
  const [filter, setFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Try auto-login if token exists
  useEffect(() => {
    if (localStorage.getItem("token")) {
      setUser({ username: "demo" }); // minimal (backend doesn’t return user profile)
      fetchJobs();
    }
  }, []);

  // Auth handlers
  const handleAuthChange = e => setAuthForm({ ...authForm, [e.target.name]: e.target.value });

  const handleAuthSubmit = async e => {
    e.preventDefault();
    setAuthError('');
    try {
      const url = isLogin ? '/auth/login' : '/auth/register';
      const res = await axios.post(url, authForm);

      if (isLogin) {
        localStorage.setItem("token", res.data.token);
        setUser({ username: authForm.username });
        fetchJobs();
      } else {
        alert("Registration successful, please log in.");
        setIsLogin(true);
      }

      setAuthForm({ username: '', password: '' });
    } catch (err) {
      setAuthError(err.response?.data?.message || "Authentication failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setJobs([]);
  };

  // Jobs handlers
  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get("/jobs");
      setJobs(res.data);
    } catch {
      setError("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await axios.put(`/jobs/${editingId}`, form);
        setEditingId(null);
      } else {
        await axios.post("/jobs", form);
      }
      setForm({ company: '', title: '', status: '', date: '', notes: '' });
      fetchJobs();
    } catch {
      setError("Failed to save job");
    }
  };

  const handleEdit = job => {
    setForm(job);
    setEditingId(job.id);
  };

  const handleDelete = async id => {
    setError('');
    try {
      await axios.delete(`/jobs/${id}`);
      fetchJobs();
    } catch {
      setError("Failed to delete job");
    }
  };

  // Filter + sort
  const filteredJobs = filter ? jobs.filter(job => job.status === filter) : jobs;
  const sortedJobs = filteredJobs.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="container">
      <h1>Job Tracker</h1>

      {!user ? (
        // ===== AUTH FORM =====
        <div>
          <h2>{isLogin ? "Login" : "Register"}</h2>
          {authError && <p className="error">{authError}</p>}
          <form onSubmit={handleAuthSubmit}>
            <input
              name="username"
              placeholder="Username"
              value={authForm.username}
              onChange={handleAuthChange}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={handleAuthChange}
              required
            />
            <button type="submit">{isLogin ? "Login" : "Register"}</button>
          </form>
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Need an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      ) : (
        // ===== JOB TRACKER =====
        <div>
          <p>Welcome, {user.username}! <button onClick={handleLogout}>Logout</button></p>

          {loading && <p>Loading jobs...</p>}
          {error && <p className="error">{error}</p>}

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

          <div className="filter">
            <label>Filter by Status: </label>
            <select value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="">All</option>
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Rejected">Rejected</option>
              <option value="Offer">Offer</option>
            </select>
          </div>

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
      )}
    </div>
  );
}

export default App;
