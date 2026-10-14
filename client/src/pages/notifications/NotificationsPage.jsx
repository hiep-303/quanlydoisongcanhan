import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Bell,
  CheckCheck,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Calendar,
  Wallet,
  CheckSquare,
  ArrowRight
} from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterRead, setFilterRead] = useState('all'); // 'all' | '0' | '1'

  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const endpoint = filterRead === 'all' ? '/notifications' : `/notifications?is_read=${filterRead}`;
      const res = await api.get(endpoint);
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error('Lỗi tải thông báo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filterRead]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      fetchNotifications();
    } catch (err) {
      console.error('Lỗi đánh dấu đã đọc:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all', {});
      fetchNotifications();
    } catch (err) {
      alert(err.message || 'Lỗi cập nhật thông báo.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error('Lỗi xóa thông báo:', err);
    }
  };

  const handleClearRead = async () => {
    try {
      await api.delete('/notifications/clear/read');
      fetchNotifications();
    } catch (err) {
      console.error('Lỗi dọn thông báo:', err);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'task': return <CheckSquare size={18} color="var(--primary)" />;
      case 'calendar': return <Calendar size={18} color="var(--info)" />;
      case 'habit': return <Flame size={18} color="var(--warning)" />;
      case 'finance': return <Wallet size={18} color="var(--danger)" />;
      default: return <Bell size={18} color="var(--purple)" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Trung Tâm Thông Báo</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Bạn có <strong>{unreadCount} thông báo</strong> chưa đọc cần lưu ý
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            id="mark-all-read-btn"
          >
            <CheckCheck size={16} />
            <span>Đánh dấu tất cả đã đọc</span>
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={handleClearRead}
            title="Dọn dẹp các thông báo đã đọc"
            id="clear-read-notif-btn"
          >
            <Trash2 size={16} />
            <span>Xóa đã đọc</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          className={`btn btn-sm ${filterRead === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterRead('all')}
        >
          Tất cả
        </button>
        <button
          className={`btn btn-sm ${filterRead === '0' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterRead('0')}
        >
          Chưa đọc ({unreadCount})
        </button>
        <button
          className={`btn btn-sm ${filterRead === '1' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterRead('1')}
        >
          Đã đọc
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Đang tải danh sách thông báo...
        </div>
      ) : notifications.length === 0 ? (
        <div className="card empty-state">
          <Bell size={48} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Không có thông báo nào</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Bạn đã cập nhật và xử lý toàn bộ các thông báo trong hệ thống.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map(n => (
            <div
              key={n.id}
              className="card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                backgroundColor: n.is_read ? 'var(--bg-card)' : 'var(--primary-light)',
                borderLeft: n.is_read ? '1px solid var(--border-color)' : '4px solid var(--primary)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getNotifIcon(n.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: n.is_read ? 600 : 800, fontSize: '0.98rem' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {n.created_at.substring(0, 16).replace('T', ' ')}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {n.link && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      if (!n.is_read) handleMarkAsRead(n.id);
                      navigate(n.link);
                    }}
                  >
                    <span>Xem ngay</span>
                    <ArrowRight size={14} />
                  </button>
                )}

                {!n.is_read && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleMarkAsRead(n.id)}
                    title="Đánh dấu đã đọc"
                  >
                    <CheckCircle2 size={16} />
                  </button>
                )}

                <button
                  className="btn btn-icon btn-secondary btn-sm"
                  style={{ color: 'var(--danger)' }}
                  onClick={() => handleDelete(n.id)}
                  title="Xóa thông báo"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
