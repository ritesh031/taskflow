const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// GET /api/dashboard?project=projectId
router.get('/', protect, async (req, res) => {
  try {
    const { project: projectId } = req.query;
    if (!projectId) return res.status(400).json({ message: 'Project ID required' });

    const project = await Project.findById(projectId).populate('members.user', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = project.members.some((m) => m.user._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    const tasks = await Task.find({ project: projectId }).populate('assignedTo', 'name email');

    const now = new Date();

    // Tasks by status
    const byStatus = {
      todo: tasks.filter((t) => t.status === 'todo').length,
      inprogress: tasks.filter((t) => t.status === 'inprogress').length,
      done: tasks.filter((t) => t.status === 'done').length,
    };

    // Overdue tasks (not done and past due date)
    const overdue = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    ).length;

    // Tasks per user
    const perUser = {};
    tasks.forEach((t) => {
      if (t.assignedTo) {
        const key = t.assignedTo._id.toString();
        if (!perUser[key]) {
          perUser[key] = { user: t.assignedTo, total: 0, done: 0 };
        }
        perUser[key].total++;
        if (t.status === 'done') perUser[key].done++;
      }
    });

    res.json({
      totalTasks: tasks.length,
      byStatus,
      overdue,
      perUser: Object.values(perUser),
      members: project.members,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
