import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import {
  Settings,
  Sun,
  Moon,
  Globe,
  Bell,
  CheckCircle2,
  Save
} from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();

  const [language, setLanguage] = useState(user?.language || 'vi');
  const [notifTasks, setNotifTasks] = useState(user?.notification_prefs?.tasks ?? true);
  const [notifBudget, setNotifBudget] = useState(user?.notification_prefs?.budget ?? true);
  const [notifHabits, setNotifHabits] = useState(user?.notification_prefs?.habits ?? true);
  const [statusMsg, setStatusMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.patch('/users/profile', {
        language,
        theme,
        notification_prefs: {
          tasks: notifTasks,
          budget: notifBudget,
          habits: notifHabits
        }
      });
      if (res.success && res.data) {
        updateUser(res.data);
        setStatusMsg('Đã lưu các cài đặt tùy chọn thành công!');
        setTimeout(() => setStatusMsg(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Lỗi lưu cài đặt.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Cài Đặt Hệ Thống</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Tùy chỉnh giao diện, ngôn ngữ hiển thị và kênh thông báo của bạn
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

      <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Appearance Theme */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>Giao Diện & Màu Sắc</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div
              onClick={() => setTheme('light')}
              style={{
                padding: '18px',
                borderRadius: 'var(--radius-md)',
                border: '2px solid',
                borderColor: theme === 'light' ? 'var(--primary)' : 'var(--border-color)',
                backgroundColor: 'var(--bg-tertiary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <Sun size={24} color="#f59e0b" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Giao diện Sáng (Light)</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Phù hợp làm việc ban ngày</div>
              </div>
            </div>

            <div
              onClick={() => setTheme('dark')}
              style={{
                padding: '18px',
                borderRadius: 'var(--radius-md)',
                border: '2px solid',
                borderColor: theme === 'dark' ? 'var(--primary)' : 'var(--border-color)',
                backgroundColor: 'var(--bg-tertiary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <Moon size={24} color="#818cf8" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Giao diện Tối (Dark)</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Giảm mỏi mắt ban đêm</div>
              </div>
            </div>
          </div>
        </div>

        {/* Language & Regional */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>Ngôn Ngữ & Vùng</h3>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Ngôn ngữ hiển thị chính</label>
            <select
              className="form-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="vi">Tiếng Việt (Mặc định)</option>
              <option value="en">English (Quốc tế)</option>
            </select>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>Tùy Chọn Thông Báo</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={notifTasks}
                onChange={(e) => setNotifTasks(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Nhắc nhở công việc đến hạn</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Nhận thông báo khi có công việc sắp hoặc quá hạn chót</div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={notifBudget}
                onChange={(e) => setNotifBudget(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Cảnh báo ngân sách chi tiêu</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cảnh báo khi mức chi tiêu đạt 80% hoặc vượt ngân sách tháng</div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={notifHabits}
                onChange={(e) => setNotifHabits(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Nhắc nhở rèn luyện thói quen</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Nhắc nhở điểm danh thói quen trước khi kết thúc ngày</div>
              </div>
            </label>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving} id="save-settings-btn">
          <Save size={16} />
          <span>{saving ? 'Đang lưu...' : 'Lưu tất cả cài đặt'}</span>
        </button>
      </form>
    </div>
  );
}
