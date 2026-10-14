import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Bot,
  CheckCircle2,
  Calendar,
  Flame,
  Wallet,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Award,
  Zap,
  Lock
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Top Navbar */}
      <header style={{
        height: '75px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-card)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
          }}>
            <Bot size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              LifeHub
            </span>
            <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              QUẢN LÝ ĐỜI SỐNG CÁ NHÂN
            </span>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <a href="#features" style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Tính năng</a>
          <a href="#privacy" style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Bảo mật</a>
          <Link to="/help" style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Hướng dẫn & FAQ</Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary" id="landing-goto-dashboard">
              <span>Vào Dashboard của bạn</span>
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" id="landing-login-btn">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn btn-primary" id="landing-register-btn">
                <span>Bắt đầu miễn phí</span>
                <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '90px 24px 70px',
        textAlign: 'center',
        maxWidth: '1000px',
        margin: '0 auto',
        position: 'relative'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '999px',
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '24px'
        }}>
          <Sparkles size={16} />
          <span>Hệ thống Quản lý Đời sống Cá nhân Thông minh 2026</span>
        </div>

        <h1 style={{
          fontSize: '3.4rem',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          marginBottom: '24px'
        }}>
          Làm chủ thời gian, tài chính & thói quen trong một <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>nền tảng duy nhất</span>
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          maxWidth: '750px',
          margin: '0 auto 36px',
          lineHeight: 1.6
        }}>
          Tập hợp toàn diện công việc (Tasks), lịch trình (Calendar), mục tiêu dài hạn (Goals), chuỗi thói quen (Habits) và quản lý ngân sách chi tiêu (Finance) kết hợp cùng Trợ lý AI phân tích sâu sắc.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary btn-lg" id="hero-get-started-btn">
            <span>Tạo tài khoản ngay bây giờ</span>
            <ArrowRight size={18} />
          </Link>
          <button
            onClick={() => {
              navigate('/login', { state: { demo: true } });
            }}
            className="btn btn-secondary btn-lg"
            id="hero-demo-login-btn"
          >
            Trải nghiệm tài khoản Demo
          </button>
        </div>

        {/* Quick Credentials callout */}
        <div style={{
          marginTop: '32px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '16px',
          background: 'var(--bg-card)',
          border: '1px dashed var(--border-color)',
          padding: '10px 20px',
          borderRadius: '12px',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          <span>👤 Demo: <strong>user@lifehub.vn</strong> / <strong>User@123</strong></span>
          <span>•</span>
          <span>🛡️ Admin: <strong>admin@lifehub.vn</strong> / <strong>Admin@123</strong></span>
        </div>
      </section>

      {/* Interactive Feature Highlights */}
      <section id="features" style={{ padding: '60px 24px 80px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '12px' }}>Tất cả công cụ bạn cần để xây dựng cuộc sống kỷ luật</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>Được thiết kế tinh tế, kết nối liền mạch giữa dữ liệu thực tế và thông tin chi tiết</p>
        </div>

        <div className="grid-3">
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <CheckCircle2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Quản lý Công việc & Kanban</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Lập danh sách việc cần làm, phân loại theo độ ưu tiên, danh mục, thời hạn chót và chuyển đổi linh hoạt giữa giao diện Danh sách và Bảng Kanban.
            </p>
          </div>

          <div className="card" style={{ padding: '28px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Flame size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Theo dõi Chuỗi Thói quen</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Xây dựng kỷ luật mỗi ngày với tính năng tính chuỗi ngày liên tục (streak), lịch sử điểm danh tuần/tháng và gợi ý duy trì phong độ bền bỉ.
            </p>
          </div>

          <div className="card" style={{ padding: '28px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--warning-light)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Wallet size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Quản lý Tài chính & Ngân sách</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Ghi chép thu chi chính xác, đặt hạn mức ngân sách theo từng danh mục, tự động cảnh báo khi chi tiêu gần chạm ngưỡng quy định.
            </p>
          </div>

          <div className="card" style={{ padding: '28px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--info-light)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Calendar size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Lịch trình & Sự kiện</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Chế độ xem Tháng, Tuần và Ngày trực quan. Ngăn ngừa xung đột thời gian với thuật toán kiểm tra logic thời gian bắt đầu và kết thúc.
            </p>
          </div>

          <div className="card" style={{ padding: '28px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--purple-light)', color: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Bot size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Trợ lý AI Đời sống</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Phân tích trực tiếp từ cơ sở dữ liệu thực của bạn: tổng hợp công việc ưu tiên, phân tích xu hướng chi tiêu và đề xuất kế hoạch ngày hiệu quả.
            </p>
          </div>

          <div className="card" style={{ padding: '28px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <TrendingUp size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Báo cáo Thống kê Đầy đủ</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Biểu đồ trực quan, tỷ lệ hoàn thành công việc, phân bổ dòng tiền và khả năng xuất báo cáo định dạng CSV chuẩn hóa chỉ với một cú nhấp chuột.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Privacy Commitment */}
      <section id="privacy" style={{ padding: '60px 24px', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <ShieldCheck size={30} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Cam kết Bảo mật & Quyền Riêng Tư Tuyệt Đối</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '24px' }}>
            Toàn bộ mật khẩu được mã hóa an toàn bằng thuật toán băm Bcrypt. Dữ liệu của từng người dùng được phân tách và bảo vệ nghiêm ngặt ở tầng backend. Bạn hoàn toàn có quyền xuất toàn bộ dữ liệu cá nhân hoặc xóa tài khoản vĩnh viễn bất kỳ lúc nào.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Lock size={15} /> Mã hóa mật khẩu một chiều</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Award size={15} /> Phân quyền Role-based Access</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={15} /> Xuất dữ liệu cá nhân JSON/CSV</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)' }}>Trang chủ</Link>
          <Link to="/help" style={{ color: 'var(--text-secondary)' }}>Trợ giúp & FAQ</Link>
          <Link to="/login" style={{ color: 'var(--text-secondary)' }}>Đăng nhập</Link>
          <Link to="/register" style={{ color: 'var(--text-secondary)' }}>Đăng ký</Link>
        </div>
        <div>© 2026 LifeHub - Nghiên cứu và xây dựng hệ thống quản lý đời sống cá nhân trên nền tảng web.</div>
      </footer>
    </div>
  );
}
