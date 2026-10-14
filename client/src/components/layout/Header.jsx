import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  Sparkles,
  Calendar as CalendarIcon
} from 'lucide-react';

export default function Header({ onMenuClick }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function fetchUnread() {
      try {
        const res = await api.get('/notifications?is_read=0&limit=1');
        if (mounted && res.success) {
          setUnreadCount(res.unreadCount || 0);
        }
      } catch (e) {
        // quiet error on header polling
      }
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [location.pathname]);

  const titles = {
    '/dashboard': 'Dashboard Tổng Quan',
    '/tasks': 'Quản Lý Công Việc',
    '/calendar': 'Lịch Trình & Sự Kiện',
    '/goals': 'Mục Tiêu & Lộ Trình',
    '/habits': 'Rèn Luyện Thói Quen',
    '/finance': 'Quản Lý Tài Chính & Ngân Sách',
    '/notes': 'Ghi Chú Cá Nhân',
    '/notifications': 'Trung Tâm Thông Báo',
    '/reports': 'Báo Cáo & Thống Kê',
    '/assistant': 'Trợ Lý AI Thông Minh',
    '/profile': 'Hồ Sơ Cá Nhân',
    '/settings': 'Cài Đặt Hệ Thống',
    '/help': 'Trợ Giúp & FAQ',
    '/admin': 'Khu Vực Quản Trị Hệ Thống',
    '/admin/users': 'Quản Trị Người Dùng'
  };

  const currentTitle = titles[location.pathname] || 'LifeHub';

  const todayFormatted = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  return (
    <header className="header-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          className="btn btn-icon btn-secondary mobile-menu-trigger"
          onClick={onMenuClick}
          style={{ display: 'none' }}
          title="Mở menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{currentTitle}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <CalendarIcon size={13} />
            <span style={{ textTransform: 'capitalize' }}>{todayFormatted}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* AI Quick Button */}
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => navigate('/assistant')}
          style={{ border: '1px solid rgba(99, 102, 241, 0.4)', color: 'var(--primary)' }}
          id="header-ai-btn"
        >
          <Sparkles size={16} />
          <span>Hỏi AI</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          className="btn btn-icon btn-secondary"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
          id="theme-toggle-btn"
        >
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} />}
        </button>

        {/* Notifications Icon with Badge */}
        <button
          className="btn btn-icon btn-secondary"
          onClick={() => navigate('/notifications')}
          style={{ position: 'relative' }}
          title="Thông báo"
          id="notifications-btn"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: 'var(--danger)',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--bg-card)'
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Profile Avatar click */}
        <div
          onClick={() => navigate('/profile')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          title="Xem hồ sơ cá nhân"
          id="header-profile-link"
        >
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
            alt={user?.name}
            style={{ width: '38px', height: '38px', borderRadius: '50%', border: '2px solid var(--primary)', objectFit: 'cover' }}
          />
        </div>
      </div>
    </header>
  );
}
