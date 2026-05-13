import React, { useState } from 'react';
import { format, isPast, parseISO } from 'date-fns';
import './TaskList.css';

const STATUSES = ['todo', 'inprogress', 'done'];
const STATUS_LABELS = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' };

export default function TaskList({ tasks, isAdmin, currentUser, onEdit, onDelete, onStatusChange }) {
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filtered = tasks.filter(t => {
    const statusMatch = filter === 'all' || t.status === filter;
    const priorityMatch = priorityFilter === 'all' || t.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: 48 }}>📋</div>
        <h3>No tasks yet</h3>
        <p>{isAdmin ? 'Click "Add Task" to create the first task' : 'No tasks have been assigned yet'}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="task-filters">
        <div className="filter-group">
          <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>Status:</span>
          {['all', ...STATUSES].map(s => (
            <button
              key={s}
              className={`filter-btn ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? 'All' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <div className="filter-group">
          <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>Priority:</span>
          {['all', 'high', 'medium', 'low'].map(p => (
            <button
              key={p}
              className={`filter-btn ${priorityFilter === p ? 'active' : ''}`}
              onClick={() => setPriorityFilter(p)}
            >
              {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No tasks match your filters</p>
        </div>
      ) : (
        <div className="task-grid">
          {filtered.map(task => {
            const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'done';
            const isAssignedToMe = task.assignedTo?._id === currentUser.id;
            const canEdit = isAdmin || isAssignedToMe;

            return (
              <div key={task._id} className={`task-card ${isOverdue ? 'overdue' : ''}`}>
                <div className="task-card-top">
                  <span className={`badge badge-${task.priority}`}>
                    {task.priority}
                  </span>
                  {isOverdue && <span className="overdue-badge">⚠ Overdue</span>}
                </div>

                <h3 className="task-title">{task.title}</h3>
                {task.description && <p className="task-desc">{task.description}</p>}

                <div className="task-meta">
                  {task.assignedTo && (
                    <div className="task-assignee">
                      <div className="mini-avatar">{task.assignedTo.name[0].toUpperCase()}</div>
                      <span>{task.assignedTo.name}</span>
                    </div>
                  )}
                  {task.dueDate && (
                    <span style={{ fontSize: 12, color: isOverdue ? 'var(--danger)' : 'var(--muted)' }}>
                      📅 {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>

                <div className="task-footer">
                  {canEdit ? (
                    <select
                      className="status-select"
                      value={task.status}
                      onChange={e => onStatusChange(task._id, e.target.value)}
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`badge badge-${task.status}`}>{STATUS_LABELS[task.status]}</span>
                  )}

                  <div className="task-actions">
                    {isAdmin && (
                      <>
                        <button className="action-btn edit" onClick={() => onEdit(task)}>✏️</button>
                        <button className="action-btn delete" onClick={() => onDelete(task._id)}>🗑</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
