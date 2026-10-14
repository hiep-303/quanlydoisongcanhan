import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Flame,
  Plus,
  CheckCircle2,
  Circle,
  Award,
  Calendar,
  Trash2,
  Edit2,
  X,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFrequency, setFormFrequency] = useState('daily');
  const [formColor, setFormColor] = useState('#10b981');
  const [formReminder, setFormReminder] = useState('07:00');

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const res = await api.get('/habits');
      if (res.success) {
        setHabits(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải thói quen:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const openCreateModal = () => {
    setEditingHabit(null);
    setFormTitle('');
    setFormDescription('');
    setFormFrequency('daily');
    setFormColor('#10b981');
    setFormReminder('07:00');
    setIsModalOpen(true);
  };

  const openEditModal = (h) => {
    setEditingHabit(h);
    setFormTitle(h.title);
    setFormDescription(h.description || '');
    setFormFrequency(h.frequency || 'daily');
    setFormColor(h.color || '#10b981');
    setFormReminder(h.reminder_time || '07:00');
    setIsModalOpen(true);
  };

  const handleSaveHabit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    try {
      const payload = {
        title: formTitle,
        description: formDescription,
        frequency: formFrequency,
        color: formColor,
        reminder_time: formReminder
      };

      if (editingHabit) {
        await api.patch(`/habits/${editingHabit.id}`, payload);
      } else {
        await api.post('/habits', payload);
      }

      setIsModalOpen(false);
      fetchHabits();
    } catch (err) {
      alert(err.message || 'Lỗi lưu thói quen.');
    }
  };

  const handleToggleLog = async (habitId, dateStr) => {
    try {
      const res = await api.post(`/habits/${habitId}/toggle-log`, { date: dateStr });
      if (res.success) {
        fetchHabits();
      }
    } catch (err) {
      console.error('Lỗi điểm danh:', err);
    }
  };

  const handleDeleteHabit = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thói quen này? Toàn bộ lịch sử điểm danh cũng sẽ bị xóa.')) return;
    try {
      await api.delete(`/habits/${id}`);
      fetchHabits();
    } catch (err) {
      alert(err.message || 'Lỗi xóa thói quen.');
    }
  };

  // Generate last 7 days list
  const past7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    past7Days.push(d.toISOString().split('T')[0]);
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const totalCompletionsToday = habits.filter(h => h.completed_today).length;
  const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Stats Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Rèn Luyện Thói Quen</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Điểm danh hôm nay: <strong>{totalCompletionsToday}/{habits.length} thói quen</strong> • Chuỗi kỷ lục: <strong style={{ color: 'var(--warning)' }}>{maxStreak} ngày liên tiếp</strong>
          </p>
        </div>

        <button className="btn btn-primary" onClick={openCreateModal} id="add-habit-btn">
          <Plus size={16} />
          <span>Thêm thói quen mới</span>
        </button>
      </div>

      {/* Habits List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Đang tải thói quen...
        </div>
      ) : habits.length === 0 ? (
        <div className="card empty-state">
          <Flame size={48} color="#f59e0b" />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Chưa có thói quen nào</h3>
          <p style={{ maxWidth: '420px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
            Xây dựng các thói quen nguyên tử (Atomic Habits) nhỏ bé mỗi ngày: đọc sách 15 phút, uống 2 lít nước, chạy bộ...
          </p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} /> Tạo thói quen đầu tiên
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {habits.map(h => (
            <div
              key={h.id}
              className="card"
              style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '20px',
                borderLeft: `5px solid ${h.color || '#10b981'}`
              }}
            >
              {/* Left Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '260px' }}>
                <button
                  className="btn btn-icon"
                  onClick={() => handleToggleLog(h.id, todayStr)}
                  style={{
                    backgroundColor: h.completed_today ? 'var(--success)' : 'var(--bg-tertiary)',
                    color: h.completed_today ? '#fff' : 'var(--text-muted)',
                    border: '2px solid',
                    borderColor: h.completed_today ? 'var(--success)' : 'var(--border-color)',
                    borderRadius: '50%',
                    width: '42px',
                    height: '42px',
                    transition: 'all 0.2s ease'
                  }}
                  title={h.completed_today ? 'Nhấn để hủy điểm danh hôm nay' : 'Nhấn để điểm danh hôm nay'}
                  id={`habit-toggle-${h.id}`}
                >
                  <CheckCircle2 size={24} />
                </button>

                <div>
                  <h3 style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    textDecoration: h.completed_today ? 'line-through' : 'none',
                    color: h.completed_today ? 'var(--text-muted)' : 'var(--text-primary)'
                  }}>
                    {h.title}
                  </h3>
                  {h.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {h.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--warning)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      🔥 {h.streak} ngày liên tiếp
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>• Kỷ lục: {h.best_streak} ngày</span>
                  </div>
                </div>
              </div>

              {/* Center: 7-Day History Matrix */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginRight: '6px' }}>
                  7 ngày qua:
                </div>
                {past7Days.map(dStr => {
                  const logMatch = h.past_logs?.find(l => l.log_date === dStr && l.completed === 1);
                  const isToday = dStr === todayStr;

                  return (
                    <div
                      key={dStr}
                      onClick={() => handleToggleLog(h.id, dStr)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: logMatch ? (h.color || '#10b981') : 'var(--bg-tertiary)',
                        color: logMatch ? '#fff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: isToday ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        transition: 'transform 0.15s ease'
                      }}
                      title={`${dStr}: ${logMatch ? 'Đã hoàn thành' : 'Chưa ghi nhận'}`}
                    >
                      {dStr.substring(8, 10)}
                    </div>
                  );
                })}
              </div>

              {/* Right: Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button className="btn btn-icon btn-secondary btn-sm" onClick={() => openEditModal(h)}>
                  <Edit2 size={15} />
                </button>
                <button className="btn btn-icon btn-secondary btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteHabit(h.id)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add/Edit Habit */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {editingHabit ? 'Cập Nhật Thói Quen' : 'Thêm Thói Quen Mới'}
              </h3>
              <button className="btn btn-icon btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveHabit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tên thói quen *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: Thức dậy 6:00 AM, Đọc sách 20 phút..."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mô tả / Động lực</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Tại sao bạn muốn xây dựng thói quen này?..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Tần suất</label>
                    <select
                      className="form-select"
                      value={formFrequency}
                      onChange={(e) => setFormFrequency(e.target.value)}
                    >
                      <option value="daily">Hằng ngày</option>
                      <option value="weekly">Hằng tuần</option>
                      <option value="custom">Ngày thường (Thứ 2 - Thứ 6)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Giờ nhắc nhở</label>
                    <input
                      type="time"
                      className="form-input"
                      value={formReminder}
                      onChange={(e) => setFormReminder(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Màu sắc nhận diện</label>
                  <input
                    type="color"
                    className="form-input"
                    style={{ height: '42px', padding: '4px' }}
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" id="save-habit-btn">
                  {editingHabit ? 'Lưu cập nhật' : 'Tạo thói quen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
