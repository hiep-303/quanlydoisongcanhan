import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Target,
  Flame,
  Wallet,
  FileText,
  Bell,
  BarChart3,
  Bot,
  User,
  Settings,
  HelpCircle,
  ShieldAlert,
  Users,
  LogOut,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  const mainNav = [
    { to: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { to: '/tasks', label: 'Công việc', icon: CheckSquare },
    { to: '/calendar', label: 'Lịch trình', icon: Calendar },
    { to: '/goals', label: 'Mục tiêu', icon: Target },
    { to: '/habits', label: 'Thói quen', icon: Flame },
    { to: '/finance', label: 'Tài chính', icon: Wallet },
    { to: '/notes', label: 'Ghi chú', icon: FileText },
    { to: '/notifications', label: 'Thông báo', icon: Bell },
    { to: '/reports', label: 'Báo cáo & Thống kê', icon: BarChart3 },
    { to: '/assistant', label: 'Trợ lý AI', icon: Bot }
  ];

  const secondaryNav = [
    { to: '/profile', label: 'Hồ sơ cá nhân', icon: User },
    { to: '/settings', label: 'Cài đặt', icon: Settings },
    { to: '/help', label: 'Trợ giúp & FAQ', icon: HelpCircle }
  ];

  const adminNav = [
    { to: '/admin', label: 'Dashboard Admin', icon: ShieldAlert },
    { to: '/admin/users', label: 'Quản lý tài khoản', icon: Users }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Logo */}
      <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)'
          }}>
            <Bot size={20} />
          </div>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              LifeHub
            </span>
            <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
              QUẢN LÝ ĐỜI SỐNG
            </span>
          </div>
        </div>
        {isOpen && (
          <button className="btn btn-icon btn-secondary" onClick={onClose} style={{ display: 'flex' }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        <div className="nav-section-title">CHỨC NĂNG CHÍNH</div>
        {mainNav.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {user?.role === 'admin' && (
          <>
            <div className="nav-section-title" style={{ marginTop: '14px', color: '#8b5cf6' }}>QUẢN TRỊ VIÊN</div>
            {adminNav.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  style={{ color: '#8b5cf6' }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </>
        )}

        <div className="nav-section-title" style={{ marginTop: '14px' }}>CÁ NHÂN & HỆ THỐNG</div>
        {secondaryNav.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User info & Logout */}
      <div style={{ padding: '16px 18px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-tertiary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
            alt="Avatar"
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.name || 'Người dùng'}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {user?.role === 'admin' ? '🛡️ Quản trị viên' : 'Thành viên'}
            </div>
          </div>
        </div>
        <button
          className="btn btn-icon btn-secondary"
          onClick={logout}
          title="Đăng xuất"
          id="logout-btn"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
