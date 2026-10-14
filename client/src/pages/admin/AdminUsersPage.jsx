import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Users,
  Search,
  Filter,
  Lock,
  Unlock,
  Shield,
  ShieldAlert,
  UserCheck,
  AlertCircle,
  X,
  CheckCircle2
} from 'lucide-react';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Confirmation modal
  const [targetUser, setTargetUser] = useState(null);
  const [actionType, setActionType] = useState(null); // 'lock' | 'unlock' | 'role'
  const [newRole, setNewRole] = useState('user');
  const [statusMsg, setStatusMsg] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải người dùng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const openActionModal = (u, action) => {
    setTargetUser(u);
    setActionType(action);
    setNewRole(u.role === 'admin' ? 'user' : 'admin');
  };

  const handleConfirmAction = async () => {
    if (!targetUser) return;
    try {
      if (actionType === 'lock' || actionType === 'unlock') {
        const res = await api.patch(`/admin/users/${targetUser.id}/lock`, {});
        if (res.success) {
          setStatusMsg(res.message);
        }
      } else if (actionType === 'role') {
        const res = await api.patch(`/admin/users/${targetUser.id}/role`, { role: newRole });
        if (res.success) {
          setStatusMsg(res.message);
        }
      }

      setTargetUser(null);
      setActionType(null);
      fetchUsers();
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Lỗi thực hiện thao tác quản trị.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Quản Trị Tài Khoản Người Dùng</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Xem danh sách thành viên, cấp quyền quản trị và thực hiện khóa tài khoản vi phạm
        </p>
      </div>

      {statusMsg && (
        <div style={{
          backgroundColor: 'var(--success-light)',
          color: 'var(--success)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Tìm kiếm theo họ tên hoặc email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="admin-search-user-input"
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Tất cả vai trò</option>
            <option value="user">Người dùng thông thường (user)</option>
            <option value="admin">Quản trị viên (admin)</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="locked">Đã bị khóa</option>
          </select>

          <button type="submit" className="btn btn-secondary btn-sm">Tìm kiếm</button>
        </form>
      </div>

      {/* Users Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            Đang tải dữ liệu người dùng...
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <div>Không tìm thấy người dùng nào phù hợp.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Thành viên</th>
                  <th style={{ padding: '12px 16px' }}>Email</th>
                  <th style={{ padding: '12px 16px' }}>Vai trò</th>
                  <th style={{ padding: '12px 16px' }}>Trạng thái</th>
                  <th style={{ padding: '12px 16px' }}>Ngày tham gia</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const isCurrent = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt={u.name}
                            style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700 }}>
                              {u.name} {isCurrent && <span style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>(Bạn)</span>}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {u.id}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{u.email}</td>

                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-info'}`}>
                          {u.role === 'admin' ? '🛡️ Quản trị viên' : 'Người dùng'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge ${u.is_locked ? 'badge-danger' : 'badge-success'}`}>
                          {u.is_locked ? '🔒 Đã bị khóa' : '● Hoạt động'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {u.created_at.substring(0, 10)}
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          {/* Role Toggle Button */}
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openActionModal(u, 'role')}
                            disabled={isCurrent}
                            title="Thay đổi vai trò người dùng"
                            id={`role-btn-${u.id}`}
                          >
                            <Shield size={14} />
                            <span>{u.role === 'admin' ? 'Hạ quyền' : 'Thăng Admin'}</span>
                          </button>

                          {/* Lock / Unlock Button */}
                          <button
                            className={`btn btn-sm ${u.is_locked ? 'btn-secondary' : 'btn-danger'}`}
                            onClick={() => openActionModal(u, u.is_locked ? 'unlock' : 'lock')}
                            disabled={isCurrent}
                            title={u.is_locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                            id={`lock-btn-${u.id}`}
                          >
                            {u.is_locked ? <Unlock size={14} /> : <Lock size={14} />}
                            <span>{u.is_locked ? 'Mở khóa' : 'Khóa'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {targetUser && (
        <div className="modal-overlay" onClick={() => setTargetUser(null)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                {actionType === 'lock' ? 'Xác nhận khóa tài khoản' : actionType === 'unlock' ? 'Mở khóa tài khoản' : 'Thay đổi vai trò người dùng'}
              </h3>
              <button className="btn btn-icon btn-secondary btn-sm" onClick={() => setTargetUser(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {actionType === 'lock' && (
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Bạn có chắc chắn muốn <strong>khóa tài khoản</strong> của <strong>{targetUser.name}</strong> ({targetUser.email})? Người dùng này sẽ không thể đăng nhập vào hệ thống cho đến khi được mở khóa.
                </p>
              )}

              {actionType === 'unlock' && (
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Mở khóa tài khoản cho <strong>{targetUser.name}</strong> ({targetUser.email})? Người dùng sẽ có thể đăng nhập lại bình thường.
                </p>
              )}

              {actionType === 'role' && (
                <div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    Chọn vai trò mới cho người dùng <strong>{targetUser.name}</strong>:
                  </p>
                  <select
                    className="form-select"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                  >
                    <option value="user">Người dùng (user)</option>
                    <option value="admin">Quản trị viên (admin)</option>
                  </select>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setTargetUser(null)}>Hủy bỏ</button>
              <button
                className={`btn ${actionType === 'lock' ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleConfirmAction}
                id="confirm-admin-action-btn"
              >
                Xác nhận thực hiện
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
