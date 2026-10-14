import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  const { user } = useAuth();

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '480px' }}>
        <div style={{
          fontSize: '6rem',
          fontWeight: 900,
          background: 'var(--primary-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1
        }}>
          404
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '16px 0 8px' }}>
          Trang không tồn tại
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '28px', lineHeight: 1.6 }}>
          Đường dẫn bạn yêu cầu có thể đã bị di chuyển, xóa hoặc không tồn tại trong hệ thống LifeHub.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <Link to={user ? '/dashboard' : '/'} className="btn btn-primary">
            <Home size={16} />
            <span>{user ? 'Về Dashboard' : 'Về Trang Chủ'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
