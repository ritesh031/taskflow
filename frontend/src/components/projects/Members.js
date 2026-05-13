import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import './Members.css';

export default function Members({ project, isAdmin, onUpdate }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post(`/projects/${project._id}/members`, { email });
      onUpdate(data);
      setEmail('');
      toast.success('Member added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId, name) => {
    if (!window.confirm(`Remove ${name} from this project?`)) return;
    try {
      const { data } = await api.delete(`/projects/${project._id}/members/${userId}`);
      onUpdate(data);
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  return (
    <div>
      {isAdmin && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>Add Member</h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: 10 }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Member's email address"
              required
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: 20, fontSize: 16 }}>
          Team Members ({project.members.length})
        </h3>
        <div className="members-list">
          {project.members.map(({ user, role }) => (
            <div key={user._id} className="member-row">
              <div className="member-info">
                <div className="member-avatar">{user.name[0].toUpperCase()}</div>
                <div>
                  <div className="member-name">{user.name}</div>
                  <div className="member-email">{user.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={`badge ${role === 'admin' ? 'badge-inprogress' : 'badge-todo'}`}>
                  {role}
                </span>
                {isAdmin && role !== 'admin' && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemove(user._id, user.name)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
