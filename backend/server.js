const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:27017/taskdb';

const Task = mongoose.model(
  'Task',
  new mongoose.Schema(
    {
      title: { type: String, required: true, trim: true },
      done: { type: Boolean, default: false },
    },
    { timestamps: true }
  )
);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'connecting' });
});

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a task
app.post('/api/tasks', async (req, res) => {
  try {
    const title = (req.body.title || '').trim();
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const task = await Task.create({ title });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark done / not done
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { done: !!req.body.done },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Keep trying to reach the database until it is ready
function connectWithRetry() {
  mongoose
    .connect(MONGO_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => {
      console.log('MongoDB not ready, retrying in 3 seconds...', err.message);
      setTimeout(connectWithRetry, 3000);
    });
}
connectWithRetry();

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
