import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import TaskList from '../components/tasks/TaskList';
import TaskModal from '../components/tasks/TaskModal';
import Dashboard from '../components/dashboard/Dashboard';
import Members from '../components/projects/Members';
import './ProjectDetail.css';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tasks');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchProject = useCallback(async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
    } catch {
      toast.error('Project not found');
      navigate('/projects');
    }
  }, [id, navigate]);

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await api.get(`/tasks?project=${id}`);
      setTasks(data);
    } catch {
      toast.error('Failed to load tasks');
    }
  }, [id]);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchProject(), fetchTasks()]);
      setLoading(false);
    };
    init();
  }, [fetchProject, fetchTasks]);

  const isAdmin = project?.members.some(
    m => m.user._id === user.id && m.role === 'admin'
  );

  const handleTaskSaved = (task, isNew) => {
    if (isNew) setTasks(prev => [task, ...prev]);
    else setTasks(prev => prev.map(t => t._id === task._id ? task : t));
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const handleTaskDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, { status });
      setTasks(prev => prev.map(t => t._id === data._id ? data : t));
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="loading"><span className="spinner" />Loading...</div>;
  if (!project) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/projects')}>← Projects</button>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{project.name}</h1>
          {project.description && (
            <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>{project.description}</p>
          )}
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setEditingTask(null); setShowTaskModal(true); }}>
            + Add Task
          </button>
        )}
      </div>

      <div className="tabs">
        {['tasks', 'dashboard', 'members'].map(t => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'tasks' ? '📋' : t === 'dashboard' ? '📊' : '👥'}{' '}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        {tab === 'tasks' && (
          <TaskList
            tasks={tasks}
            isAdmin={isAdmin}
            currentUser={user}
            onEdit={(task) => { setEditingTask(task); setShowTaskModal(true); }}
            onDelete={handleTaskDelete}
            onStatusChange={handleStatusChange}
          />
        )}
        {tab === 'dashboard' && <Dashboard projectId={id} />}
        {tab === 'members' && (
          <Members project={project} isAdmin={isAdmin} onUpdate={setProject} />
        )}
      </div>

      {showTaskModal && (
        <TaskModal
          projectId={id}
          task={editingTask}
          members={project.members}
          onSave={handleTaskSaved}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
}
