const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const { protect, requireAdmin } = require('../middleware/auth');

// Middleware to load project and check membership
const loadProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('members.user', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const isMember = project.members.some((m) => m.user._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access denied' });
    req.project = project;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/projects — Get all projects for current user
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id }).populate('members.user', 'name email');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects — Create project
router.post(
  '/',
  protect,
  [body('name').notEmpty().withMessage('Project name required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const project = await Project.create({
        name: req.body.name,
        description: req.body.description,
        members: [{ user: req.user._id, role: 'admin' }],
      });
      await project.populate('members.user', 'name email');
      res.status(201).json(project);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// GET /api/projects/:id
router.get('/:id', protect, loadProject, (req, res) => res.json(req.project));

// PUT /api/projects/:id — Update project (admin only)
router.put('/:id', protect, loadProject, requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (name) req.project.name = name;
    if (description !== undefined) req.project.description = description;
    await req.project.save();
    res.json(req.project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/projects/:id — Delete project (admin only)
router.delete('/:id', protect, loadProject, requireAdmin, async (req, res) => {
  try {
    await Task.deleteMany({ project: req.project._id });
    await req.project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects/:id/members — Add member (admin only)
router.post('/:id/members', protect, loadProject, requireAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: 'User not found' });

    const alreadyMember = req.project.members.some(
      (m) => m.user._id.toString() === userToAdd._id.toString()
    );
    if (alreadyMember) return res.status(400).json({ message: 'User already a member' });

    req.project.members.push({ user: userToAdd._id, role: 'member' });
    await req.project.save();
    await req.project.populate('members.user', 'name email');
    res.json(req.project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/projects/:id/members/:userId — Remove member (admin only)
router.delete('/:id/members/:userId', protect, loadProject, requireAdmin, async (req, res) => {
  try {
    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admin cannot remove themselves' });
    }
    req.project.members = req.project.members.filter(
      (m) => m.user._id.toString() !== req.params.userId
    );
    await req.project.save();
    res.json(req.project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
