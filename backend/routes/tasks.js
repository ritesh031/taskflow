const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// Helper: check if user is admin of a project
const isAdmin = (project, userId) =>
  project.members.some((m) => m.user.toString() === userId.toString() && m.role === 'admin');

// Helper: check if user is member of a project
const isMember = (project, userId) =>
  project.members.some((m) => m.user.toString() === userId.toString());

// GET /api/tasks?project=projectId — Get tasks for a project
router.get('/', protect, async (req, res) => {
  try {
    const { project: projectId } = req.query;
    if (!projectId) return res.status(400).json({ message: 'Project ID required' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isMember(project, req.user._id)) return res.status(403).json({ message: 'Access denied' });

    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks — Create task (admin only)
router.post(
  '/',
  protect,
  [
    body('title').notEmpty().withMessage('Title required'),
    body('project').notEmpty().withMessage('Project ID required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const project = await Project.findById(req.body.project);
      if (!project) return res.status(404).json({ message: 'Project not found' });
      if (!isAdmin(project, req.user._id)) return res.status(403).json({ message: 'Admin only' });

      const task = await Task.create({
        title: req.body.title,
        description: req.body.description,
        dueDate: req.body.dueDate,
        priority: req.body.priority,
        project: req.body.project,
        assignedTo: req.body.assignedTo || null,
        createdBy: req.user._id,
      });
      await task.populate('assignedTo', 'name email');
      await task.populate('createdBy', 'name email');
      res.status(201).json(task);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// PUT /api/tasks/:id — Update task
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!isMember(project, req.user._id)) return res.status(403).json({ message: 'Access denied' });

    const admin = isAdmin(project, req.user._id);
    const isAssigned = task.assignedTo?.toString() === req.user._id.toString();

    if (!admin && !isAssigned) return res.status(403).json({ message: 'You can only update tasks assigned to you' });

    // Members can only update status; admins can update everything
    if (admin) {
      const { title, description, dueDate, priority, status, assignedTo } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (dueDate) task.dueDate = dueDate;
      if (priority) task.priority = priority;
      if (status) task.status = status;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    } else {
      if (req.body.status) task.status = req.body.status;
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/tasks/:id — Delete task (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!isAdmin(project, req.user._id)) return res.status(403).json({ message: 'Admin only' });

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
