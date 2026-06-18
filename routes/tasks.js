// ─── routes/tasks.js ──────────────────────────────────────────────
const express = require('express');
const router  = express.Router();
const Task    = require('../models/Task');
const User    = require('../models/User');
const { validateCreateTask, validateUpdateTask } = require('../validate');

// GET /api/tasks — list with optional filters
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/tasks/:id — single task
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name email role');
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, error: 'Invalid task ID format' });
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tasks — create
router.post('/', validateCreateTask, async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    if (assignedTo) {
      const user = await User.findById(assignedTo);
      if (!user) return res.status(400).json({ success: false, error: 'Assigned user not found' });
    }

    const task = await Task.create({ title, description, status, priority, assignedTo, dueDate });
    res.status(201).json({ success: true, message: 'Task created', data: task });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, error: 'Validation failed', details: messages });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/tasks/:id — update
router.put('/:id', validateUpdateTask, async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate } = req.body;
    const updates = {};
    if (title       !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status      !== undefined) updates.status = status;
    if (priority    !== undefined) updates.priority = priority;
    if (assignedTo  !== undefined) updates.assignedTo = assignedTo;
    if (dueDate     !== undefined) updates.dueDate = dueDate;

    if (updates.assignedTo) {
      const user = await User.findById(updates.assignedTo);
      if (!user) return res.status(400).json({ success: false, error: 'Assigned user not found' });
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    res.status(200).json({ success: true, message: 'Task updated', data: task });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, error: 'Validation failed', details: messages });
    }
    if (err.name === 'CastError') return res.status(400).json({ success: false, error: 'Invalid task ID format' });
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/tasks/:id — delete
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    res.status(204).send();
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ success: false, error: 'Invalid task ID format' });
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;