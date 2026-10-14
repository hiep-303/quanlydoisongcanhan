import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import {
  Bot,
  Send,
  Trash2,
  Sparkles,
  User,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Wallet,
  Flame,
  ArrowRight
} from 'lucide-react';

export default function AssistantPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiMode, setAiMode] = useState('LifeHub Contextual Assistant');
  const chatBottomRef = useRef(null);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/assistant/history');
      if (res.success) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải lịch sử AI:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: 'local_' + Date.now(),
      role: 'user',
      content: textToSend.trim(),
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/assistant/chat', { prompt: textToSend.trim() });
      if (res.success && res.data) {
        setMessages(prev => [
          ...prev,
          {
            id: 'asst_' + Date.now(),
            role: 'assistant',
            content: res.data.content,
            suggestedActions: res.data.suggestedActions,
            created_at: new Date().toISOString()
          }
        ]);
        if (res.data.mode) setAiMode(res.data.mode);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          role: 'assistant',
          content: 'Xin lỗi, trợ lý AI đang bận xử lý hoặc không thể kết nối. Vui lòng thử lại!',
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện với AI?')) return;
    try {
      await api.delete('/assistant/history');
      setMessages([]);
    } catch (err) {
      alert(err.message || 'Lỗi xóa lịch sử trò chuyện.');
    }
  };

  const quickPrompts = [
    'Lập kế hoạch công việc ngày hôm nay',
    'Phân tích tình hình chi tiêu tháng này',
    'Kiểm tra chuỗi thói quen và cách cải thiện',
    'Gợi ý chia nhỏ các bước thực hiện mục tiêu'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', maxWidth: '1000px', margin: '0 auto', gap: '16px' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Trợ Lý AI Quản Lý Đời Sống</h2>
            <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
              <Sparkles size={12} /> {aiMode}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Phân tích dữ liệu thực tế: công việc, thói quen, ngân sách và lịch trình cá nhân của bạn
          </p>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={handleClearHistory}
          disabled={messages.length === 0}
          title="Xóa lịch sử trò chuyện"
        >
          <Trash2 size={14} />
          <span>Xóa hội thoại</span>
        </button>
      </div>

      {/* Notice Banner */}
      <div style={{
        padding: '10px 16px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        fontSize: '0.82rem',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <ShieldCheck size={16} color="var(--success)" />
        <span>
          <strong>Cam kết dữ liệu:</strong> AI chỉ truy cập dữ liệu công việc và tài chính trong tài khoản của bạn để phân tích. Không tự ý sửa đổi khi chưa có xác nhận.
        </span>
      </div>

      {/* Chat Messages Container */}
      <div className="card" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {messages.length === 0 ? (
          <div className="empty-state" style={{ margin: 'auto' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              margin: '0 auto 16px',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)'
            }}>
              <Bot size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Tôi có thể giúp gì cho cuộc sống của bạn hôm nay?</h3>
            <p style={{ maxWidth: '480px', margin: '0 auto 24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Hãy đặt câu hỏi hoặc chọn một trong các gợi ý bên dưới để nhận được phân tích cá nhân hóa dựa trên dữ liệu thật của bạn.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', maxWidth: '600px', margin: '0 auto' }}>
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleSend(qp)}
                  style={{ textAlign: 'left' }}
                >
                  <Sparkles size={13} color="var(--primary)" />
                  <span>{qp}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map(m => {
            const isAsst = m.role === 'assistant';
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignSelf: isAsst ? 'flex-start' : 'flex-end',
                  maxWidth: '85%'
                }}
              >
                {isAsst && (
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'var(--primary-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0
                  }}>
                    <Bot size={20} />
                  </div>
                )}

                <div style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: isAsst ? 'var(--bg-tertiary)' : 'var(--primary)',
                  color: isAsst ? 'var(--text-primary)' : '#ffffff',
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {m.content}

                  {/* Render Suggested Quick Actions if available */}
                  {isAsst && m.suggestedActions?.length > 0 && (
                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {m.suggestedActions.map((action, i) => (
                        <button
                          key={i}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                          onClick={() => handleSend(action)}
                        >
                          <span>{action}</span>
                          <ArrowRight size={12} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {!isAsst && (
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-primary)',
                    flexShrink: 0
                  }}>
                    <User size={18} />
                  </div>
                )}
              </div>
            );
          })
        )}

        {loading && (
          <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Bot size={20} />
            </div>
            <div style={{ padding: '12px 18px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-tertiary)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Trợ lý đang phân tích dữ liệu của bạn...
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{ display: 'flex', gap: '10px' }}
      >
        <input
          type="text"
          className="form-input"
          style={{ height: '48px', padding: '0 18px', fontSize: '0.95rem' }}
          placeholder="Nhập câu hỏi của bạn (ví dụ: Tóm tắt các việc cần làm hôm nay)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          id="assistant-input"
        />
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '52px', height: '48px', padding: 0 }}
          disabled={loading || !input.trim()}
          id="assistant-send-btn"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
