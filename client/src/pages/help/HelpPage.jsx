import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  HelpCircle,
  MessageSquare,
  Shield,
  FileText,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function HelpPage() {
  const [faqsOpen, setFaqsOpen] = useState({ 0: true });
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const faqs = [
    {
      q: 'Hệ thống LifeHub quản lý những khía cạnh nào của đời sống?',
      a: 'LifeHub được thiết kế như một trung tâm điều phối toàn diện gồm 6 phân hệ cốt lõi: Quản lý công việc (Tasks theo List & Kanban), Lịch trình sự kiện (Calendar), Mục tiêu dài hạn (Goals với các bước SMART), Rèn luyện thói quen (Habits với tính chuỗi streak), Tài chính cá nhân (Finance với thu/chi và hạn mức ngân sách) và Ghi chú bảo mật (Notes).'
    },
    {
      q: 'Trợ lý AI hoạt động như thế nào và có an toàn không?',
      a: 'Trợ lý AI phân tích các số liệu thực tế được cấp quyền trong tài khoản của bạn (như số công việc quá hạn, xu hướng chi tiêu tháng, chuỗi thói quen). AI hoạt động theo nguyên tắc: không bịa đặt số liệu, không tự ý sửa đổi hay xóa dữ liệu của người dùng khi chưa có xác nhận rõ ràng.'
    },
    {
      q: 'Làm thế nào để xuất dữ liệu hoặc sao lưu?',
      a: 'Bạn có thể vào trang "Báo cáo & Thống kê" để tải các tệp CSV chuyên biệt (Công việc, Thói quen, Giao dịch tài chính) hoặc vào "Hồ sơ cá nhân" để tải toàn bộ bản sao lưu đầy đủ dưới dạng tệp JSON chuẩn hóa.'
    },
    {
      q: 'Dữ liệu của tôi có bị chia sẻ cho người khác không?',
      a: 'Hoàn toàn không. Mỗi tài khoản được bảo vệ độc lập ở tầng cơ sở dữ liệu và xác thực backend. Ngay cả tài khoản Quản trị viên (Admin) cũng bị giới hạn quyền truy cập và không được tùy ý xem nội dung ghi chú cá nhân hay chi tiết giao dịch nhạy cảm của người dùng.'
    }
  ];

  const toggleFaq = (index) => {
    setFaqsOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/feedback', {
        name: feedbackName,
        email: feedbackEmail,
        subject: feedbackSubject,
        message: feedbackMessage
      });
      if (res.success) {
        setFeedbackSuccess('Cảm ơn bạn! Phản hồi của bạn đã được ghi nhận.');
        setFeedbackSubject('');
        setFeedbackMessage('');
      }
    } catch (err) {
      alert(err.message || 'Lỗi gửi phản hồi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '850px', margin: '0 auto' }}>
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Trợ Giúp & Câu Hỏi Thường Gặp</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Hướng dẫn khai thác tối đa sức mạnh của hệ thống quản lý đời sống LifeHub
        </p>
      </div>

      {/* FAQs Accordion */}
      <div className="card">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HelpCircle size={22} color="var(--primary)" />
          <span>Câu Hỏi Thường Gặp (FAQ)</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden'
              }}
            >
              <div
                onClick={() => toggleFaq(idx)}
                style={{
                  padding: '16px 20px',
                  backgroundColor: 'var(--bg-tertiary)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontWeight: 700,
                  fontSize: '0.95rem'
                }}
              >
                <span>{faq.q}</span>
                {faqsOpen[idx] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>

              {faqsOpen[idx] && (
                <div style={{ padding: '16px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, backgroundColor: 'var(--bg-card)' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Feedback & Contact Form */}
      <div className="card">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageSquare size={22} color="var(--success)" />
          <span>Gửi Phản Hồi & Ý Kiến Đóng Góp</span>
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
          Bạn có đề xuất tính năng mới hoặc cần hỗ trợ kỹ thuật? Hãy chia sẻ với đội ngũ phát triển.
        </p>

        {feedbackSuccess ? (
          <div style={{
            backgroundColor: 'var(--success-light)',
            color: 'var(--success)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.92rem'
          }}>
            <CheckCircle2 size={20} />
            <span>{feedbackSuccess}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmitFeedback}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Tên của bạn</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nguyễn Văn A"
                  value={feedbackName}
                  onChange={(e) => setFeedbackName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email phản hồi *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={feedbackEmail}
                  onChange={(e) => setFeedbackEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Chủ đề *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ví dụ: Đóng góp ý kiến về giao diện lịch..."
                value={feedbackSubject}
                onChange={(e) => setFeedbackSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nội dung phản hồi chi tiết *</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Mô tả ý kiến hoặc vấn đề bạn gặp phải..."
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} id="submit-feedback-btn">
              <Send size={16} />
              <span>{loading ? 'Đang gửi...' : 'Gửi phản hồi'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Privacy Policy and Terms Summary */}
      <div className="card" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={16} color="var(--primary)" />
          <span>Chính Sách Quyền Riêng Tư & Điều Khoản Sử Dụng</span>
        </h4>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          LifeHub tôn trọng tuyệt đối quyền bảo vệ bí mật đời sống cá nhân. Mọi thông tin ghi chép, kế hoạch tài chính và sự kiện đều được mã hóa và lưu trữ an toàn. Bạn có thể yêu cầu xóa hoàn toàn dữ liệu của mình bất cứ lúc nào trong mục Hồ Sơ Cá Nhân.
        </p>
      </div>
    </div>
  );
}
