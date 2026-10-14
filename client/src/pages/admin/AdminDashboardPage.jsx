import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  ShieldAlert,
  Users,
  CheckSquare,
  Lock,
  Unlock,
  Activity,
  ArrowRight,
  TrendingUp,
  FileText,
  AlertTriangle
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/overview');
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải overview admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
        Đang tổng hợp thông tin vận hành hệ thống...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-warning" style={{ fontWeight: 800 }}>KHU VỰC QUẢN TRỊ VIÊN</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px' }}>Giám Sát Vận Hành Hệ Thống</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Tổng quan người dùng, tình trạng tài khoản và nhật ký kiểm toán an ninh
          </p>
        </div>

        <Link to="/admin/users" className="btn btn-primary" id="goto-admin-users-btn">
          <Users size={16} />
          <span>Quản lý danh sách tài khoản</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid-4">
        {/* Total Users */}
        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>TỔNG TÀI KHOẢN</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>
              {stats?.totalUsers || 0}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: '4px' }}>
              ● {stats?.activeUsers} đang hoạt động bình thường
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
        </div>

        {/* Locked Accounts */}
        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>TÀI KHOẢN BỊ KHÓA</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: stats?.lockedUsers > 0 ? 'var(--danger)' : 'var(--text-primary)', marginTop: '4px' }}>
              {stats?.lockedUsers || 0}
            </div>
            <div style={{ fontSize: '0.78rem', color: stats?.lockedUsers > 0 ? 'var(--danger)' : 'var(--text-muted)', marginTop: '4px' }}>
              {stats?.lockedUsers > 0 ? '⚠️ Cần kiểm tra vi phạm' : '✓ Không có tài khoản bị khóa'}
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
            <Lock size={24} />
          </div>
        </div>

        {/* Total Tasks Managed */}
        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>CÔNG VIỆC TRÊN HỆ THỐNG</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--purple)', marginTop: '4px' }}>
              {stats?.totalTasks || 0}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Tổng lượt tạo trên toàn hệ thống
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}>
            <CheckSquare size={24} />
          </div>
        </div>

        {/* Total Habits and Goals */}
        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>MỤC TIÊU & THÓI QUEN</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--warning)', marginTop: '4px' }}>
              {(stats?.totalHabits || 0) + (stats?.totalGoals || 0)}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {stats?.totalHabits} thói quen, {stats?.totalGoals} mục tiêu
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
            <Activity size={24} />
          </div>
        </div>
      </div>

      {/* Row 2: Recent User Registrations & Security Audit Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Recent Registered Users */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Người Dùng Mới Đăng Ký</h3>
            <Link to="/admin/users" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Tất cả <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats?.recentUsers?.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{u.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-info'}`}>
                    {u.role}
                  </span>
                  <span className={`badge ${u.is_locked ? 'badge-danger' : 'badge-success'}`}>
                    {u.is_locked ? 'Khóa' : 'Hoạt động'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>Nhật Ký Thao Tác Quản Trị (Audit Logs)</h3>

          {stats?.recentAuditLogs?.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div>Chưa có thao tác kiểm toán nào được ghi nhận.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
              {stats?.recentAuditLogs?.map(log => (
                <div key={log.id} style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', borderLeft: '4px solid #8b5cf6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{log.action}</span>
                    <span>{log.created_at.substring(0, 16).replace('T', ' ')}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {log.details}
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
