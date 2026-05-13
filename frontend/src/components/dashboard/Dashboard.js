import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import './Dashboard.css';

export default function Dashboard({ projectId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/dashboard?project=${projectId}`)
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return <div className="loading"><span className="spinner" />Loading dashboard...</div>;
  if (!data) return null;

  const { totalTasks, byStatus, overdue, perUser } = data;
  const completionRate = totalTasks > 0 ? Math.round((byStatus.done / totalTasks) * 100) : 0;

  return (
    <div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard label="Total Tasks" value={totalTasks} icon="📋" color="#6366f1" />
        <StatCard label="In Progress" value={byStatus.inprogress} icon="⚡" color="#f59e0b" />
        <StatCard label="Completed" value={byStatus.done} icon="✅" color="#10b981" />
        <StatCard label="Overdue" value={overdue} icon="⚠️" color="#ef4444" />
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: 16 }}>Task Status Breakdown</h3>
          <div className="status-bars">
            <StatusBar label="To Do" count={byStatus.todo} total={totalTasks} color="#94a3b8" />
            <StatusBar label="In Progress" count={byStatus.inprogress} total={totalTasks} color="#f59e0b" />
            <StatusBar label="Done" count={byStatus.done} total={totalTasks} color="#10b981" />
          </div>
          <div className="completion-rate">
            <span>Overall Completion</span>
            <strong style={{ color: '#10b981' }}>{completionRate}%</strong>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: 16 }}>Tasks Per Member</h3>
          {perUser.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>No tasks assigned yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {perUser.map(({ user, total, done }) => (
                <div key={user._id} className="member-stat">
                  <div className="member-stat-info">
                    <div className="mini-avatar-lg">{user.name[0].toUpperCase()}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{user.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{done}/{total} done</div>
                    </div>
                  </div>
                  <div className="member-progress">
                    <div
                      className="member-progress-bar"
                      style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color + '1a', color }}>
        {icon}
      </div>
      <div>
        <div className="stat-value" style={{ color }}>{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function StatusBar({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
        <span style={{ color: 'var(--muted)' }}>{label}</span>
        <span style={{ fontWeight: 600 }}>{count}</span>
      </div>
      <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}
