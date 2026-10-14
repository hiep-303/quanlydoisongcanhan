import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  User,
  Mail,
  Phone,
  Clock,
  Shield,
  Key,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh');

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setPhone(user.phone || '');
      setAvatarUrl(user.avatar_url || '');
      setTimezone(user.timezone || 'Asia/Ho_Chi_Minh');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });
    try {
      setLoading(true);
      const res = await api.patch('/users/profile', {
        name,
        bio,
        phone,
        avatar_url: avatarUrl,
        timezone
      });
      if (res.success && res.data) {
        updateUser(res.data);
        setStatusMsg({ type: 'success', text: 'Cập nhật thông tin hồ sơ thành công!' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Lỗi cập nhật hồ sơ.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    if (newPassword !== confirmNewPassword) {
      setStatusMsg({ type: 'error', text: 'Mật khẩu mới xác nhận không khớp.' });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/users/change-password', {
        currentPassword,
        newPassword
      });
      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Lỗi đổi mật khẩu.' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await api.get('/users/export');
      const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifehub_data_export_${user?.id}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert(err.message || 'Lỗi xuất dữ liệu.');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = prompt('CẢNH BÁO: Hành động này sẽ xóa vĩnh viễn tài khoản và toàn bộ công việc, thói quen, tài chính của bạn. Nhập "XAC NHAN XOA" để tiếp tục:');
    if (confirmation !== 'XAC NHAN XOA') {
      alert('Hủy thao tác xóa tài khoản.');
      return;
    }

    try {
      await api.delete('/users/account');
      alert('Tài khoản của bạn đã được xóa thành công. Tạm biệt!');
      logout();
      navigate('/');
    } catch (err) {
      alert(err.message || 'Lỗi xóa tài khoản.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '850px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Hồ Sơ Cá Nhân</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Quản lý thông tin tài khoản, bảo mật và quyền riêng tư cá nhân
        </p>
      </div>

      {statusMsg.text && (
        <div style={{
          backgroundColor: statusMsg.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
          color: statusMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.9rem'
        }}>
          {statusMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Profile Form Card */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px' }}>Thông Tin Cơ Bản</h3>

        <form onSubmit={handleUpdateProfile}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <img
              src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
              alt="Avatar Preview"
              style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
            />
            <div style={{ flex: 1 }}>
              <label className="form-label" style={{ fontSize: '0.82rem' }}>URL Ảnh đại diện</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Họ và tên *</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Địa chỉ Email (Định danh)</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input
                type="tel"
                className="form-input"
                placeholder="0912..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Múi giờ làm việc</label>
              <select
                className="form-select"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                <option value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</option>
                <option value="Asia/Tokyo">Nhật Bản (GMT+9)</option>
                <option value="Europe/London">London (GMT+0)</option>
                <option value="America/New_York">New York (GMT-5)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tiểu sử ngắn / Phương châm sống</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Chia sẻ về sở thích, châm ngôn sống của bạn..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} id="save-profile-btn">
            <Save size={16} />
            <span>Lưu thông tin hồ sơ</span>
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '18px' }}>Đổi Mật Khẩu</h3>

        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label">Mật khẩu hiện tại *</label>
            <input
              type="password"
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Mật khẩu mới (tối thiểu 6 ký tự) *</label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu mới *</label>
              <input
                type="password"
                className="form-input"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-secondary" disabled={loading} id="change-pwd-btn">
            <Key size={16} />
            <span>Cập nhật mật khẩu mới</span>
          </button>
        </form>
      </div>

      {/* Privacy & Data Management */}
      <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px', color: 'var(--danger)' }}>
          Quyền Riêng Tư & Dữ Liệu Cá Nhân
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
          Bạn luôn là người làm chủ dữ liệu của mình trên LifeHub. Bạn có thể sao lưu dữ liệu bất kỳ lúc nào hoặc xóa tài khoản nếu không còn nhu cầu sử dụng.
        </p>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleExportData} id="export-json-data-btn">
            <Download size={16} />
            <span>Sao lưu toàn bộ dữ liệu (JSON)</span>
          </button>

          <button className="btn btn-danger" onClick={handleDeleteAccount} id="delete-account-btn">
            <Trash2 size={16} />
            <span>Xóa tài khoản vĩnh viễn</span>
          </button>
        </div>
      </div>
    </div>
  );
}
