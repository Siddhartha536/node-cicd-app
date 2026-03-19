const express = require('express');
const app = express();
app.use(express.json());

// Health check endpoint — Jenkins & monitoring tools use this
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// GET all users
app.get('/api/users', (req, res) => {
  res.status(200).json([
    { id: 1, name: 'Alice', role: 'admin' },
    { id: 2, name: 'Bob',   role: 'developer' }
  ]);
});

// POST create a user
app.post('/api/users', (req, res) => {
  const { name, role } = req.body;
  if (!name || !role) {
    return res.status(400).json({ error: 'name and role are required' });
  }
  res.status(201).json({ id: 3, name, role, createdAt: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;

// Only start the server if this file is run directly (not imported by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app; // export for testing