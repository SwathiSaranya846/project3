// ─── routes/users.js ──────────────────────────────────────────────
const express  = require('express');
const router   = express.Router();
const User     = require('../models/User');
const Task     = require('../models/Task');
const { validateCreateUser, validateUpdateUser } = require('../validate');

// ── GET /api/users ─────────────────────────────────────────────────
router.get('/', async (req, res) => {
	try {
		const filter = {};
		if (req.query.role) filter.role = req.query.role;
		if (req.query.isActive !== undefined) {
			filter.isActive = req.query.isActive === 'true';
		}

		const users = await User.find(filter).sort({ createdAt: -1 });

		res.status(200).json({ success: true, count: users.length, data: users });
	} catch (err) {
		res.status(500).json({ success: false, error: err.message });
	}
});

// ── GET /api/users/:id ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ success: false, error: `User with id ${req.params.id} not found` });
		res.status(200).json({ success: true, data: user });
	} catch (err) {
		if (err.name === 'CastError') return res.status(400).json({ success: false, error: 'Invalid user ID format' });
		res.status(500).json({ success: false, error: err.message });
	}
});

// ── GET /api/users/:id/tasks ───────────────────────────────────────
router.get('/:id/tasks', async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ success: false, error: 'User not found' });

		const tasks = await Task.find({ assignedTo: req.params.id })
			.populate('assignedTo', 'name email role')
			.sort({ createdAt: -1 });

		res.status(200).json({ success: true, user: user.name, count: tasks.length, data: tasks });
	} catch (err) {
		if (err.name === 'CastError') return res.status(400).json({ success: false, error: 'Invalid user ID format' });
		res.status(500).json({ success: false, error: err.message });
	}
});

// ── POST /api/users ────────────────────────────────────────────────
router.post('/', validateCreateUser, async (req, res) => {
	try {
		const { name, email, role } = req.body;
		const user = await User.create({ name, email, role });
		res.status(201).json({ success: true, message: 'User created successfully', data: user });
	} catch (err) {
		if (err.code === 11000) {
			const field = Object.keys(err.keyValue)[0];
			return res.status(409).json({ success: false, error: `${field} "${err.keyValue[field]}" already exists` });
		}
		if (err.name === 'ValidationError') {
			const messages = Object.values(err.errors).map(e => e.message);
			return res.status(400).json({ success: false, error: 'Validation failed', details: messages });
		}
		res.status(500).json({ success: false, error: err.message });
	}
});

// ── PUT /api/users/:id ─────────────────────────────────────────────
router.put('/:id', validateUpdateUser, async (req, res) => {
	try {
		const { name, email, role, isActive } = req.body;
		const updates = {};
		if (name     !== undefined) updates.name     = name;
		if (email    !== undefined) updates.email    = email;
		if (role     !== undefined) updates.role     = role;
		if (isActive !== undefined) updates.isActive = isActive;

		const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
		if (!user) return res.status(404).json({ success: false, error: 'User not found' });
		res.status(200).json({ success: true, message: 'User updated', data: user });
	} catch (err) {
		if (err.code === 11000) return res.status(409).json({ success: false, error: `${Object.keys(err.keyValue)[0]} already taken` });
		if (err.name === 'ValidationError') {
			const messages = Object.values(err.errors).map(e => e.message);
			return res.status(400).json({ success: false, error: 'Validation failed', details: messages });
		}
		if (err.name === 'CastError') return res.status(400).json({ success: false, error: 'Invalid user ID format' });
		res.status(500).json({ success: false, error: err.message });
	}
});

// ── DELETE /api/users/:id ──────────────────────────────────────────
router.delete('/:id', async (req, res) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id);
		if (!user) return res.status(404).json({ success: false, error: 'User not found' });
		await Task.deleteMany({ assignedTo: req.params.id });
		res.status(204).send();
	} catch (err) {
		if (err.name === 'CastError') return res.status(400).json({ success: false, error: 'Invalid user ID format' });
		res.status(500).json({ success: false, error: err.message });
	}
});

module.exports = router;
