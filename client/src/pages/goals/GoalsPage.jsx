import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Target,
  Plus,
  CheckCircle2,
  Circle,
  Sparkles,
  Trash2,
  Edit2,
  Calendar,
  X,
  Layers,
  TrendingUp,
  Tag
} from 'lucide-react';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Phát triển cá nhân');
  const [formStartDate, setFormStartDate] = useState('');
  const [formTargetDate, setFormTargetDate] = useState('');
  const [milestones, setMilestones] = useState([]);
  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [aiSuggesting, setAiSuggesting] = useState(false);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const endpoint = statusFilter === 'all' ? '/goals' : `/goals?status=${statusFilter}`;
      const res = await api.get(endpoint);
      if (res.success) {
        setGoals(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải mục tiêu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [statusFilter]);

  const openCreateModal = () => {
    setEditingGoal(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Phát triển cá nhân');
    const today = new Date().toISOString().split('T')[0];
    setFormStartDate(today);
    setFormTargetDate('');
    setMilestones([]);
    setNewMilestoneText('');
    setIsModalOpen(true);
  };

  const openEditModal = (g) => {
    setEditingGoal(g);
    setFormTitle(g.title);
    setFormDescription(g.description || '');
    setFormCategory(g.category || 'Phát triển cá nhân');
    setFormStartDate(g.start_date || '');
    setFormTargetDate(g.target_date || '');
    setMilestones(g.milestones || []);
    setNewMilestoneText('');
    setIsModalOpen(true);
  };

  const handleAddMilestone = () => {
    if (!newMilestoneText.trim()) return;
    setMilestones(prev => [
      ...prev,
      { id: 'm_' + Date.now(), title: newMilestoneText.trim(), completed: false }
    ]);
    setNewMilestoneText('');
  };

  const handleRemoveMilestone = (mId) => {
    setMilestones(prev => prev.filter(m => m.id !== mId));
  };

  const handleAiSuggestMilestones = async () => {
    if (!formTitle.trim()) {
      alert('Vui lòng nhập tên mục tiêu trước khi nhờ AI gợi ý các bước.');
      return;
    }
    try {
      setAiSuggesting(true);
      const res = await api.post('/goals/suggest-milestones', { title: formTitle, category: formCategory });
      if (res.success && res.data) {
        setMilestones(res.data);
      }
    } catch (err) {
      alert(err.message || 'Lỗi gợi ý bước mục tiêu.');
    } finally {
      setAiSuggesting(false);
    }
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    try {
      const payload = {
        title: formTitle,
        description: formDescription,
        category: formCategory,
        start_date: formStartDate || null,
        target_date: formTargetDate || null,
        milestones
      };

      if (editingGoal) {
        await api.patch(`/goals/${editingGoal.id}`, payload);
      } else {
        await api.post('/goals', payload);
      }

      setIsModalOpen(false);
      fetchGoals();
    } catch (err) {
      alert(err.message || 'Lỗi lưu mục tiêu.');
    }
  };

  const handleToggleMilestone = async (goalId, milestoneId) => {
    try {
      const res = await api.patch(`/goals/${goalId}/milestones/${milestoneId}`, {});
      if (res.success) {
        setGoals(prev => prev.map(g => (g.id === goalId ? res.data : g)));
      }
    } catch (err) {
      console.error('Lỗi đánh dấu mốc:', err);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mục tiêu này?')) return;
    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
    } catch (err) {
      alert(err.message || 'Lỗi xóa mục tiêu.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Mục Tiêu & Lộ Trình</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Thiết lập các mốc SMART và theo dõi tiến độ hoàn thành các mục tiêu quan trọng
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả mục tiêu</option>
            <option value="in_progress">Đang thực hiện</option>
            <option value="completed">Đã hoàn thành</option>
          </select>

          <button className="btn btn-primary" onClick={openCreateModal} id="add-goal-btn">
            <Plus size={16} />
            <span>Tạo mục tiêu mới</span>
          </button>
        </div>
      </div>

      {/* Goal Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Đang tải danh sách mục tiêu...
        </div>
      ) : goals.length === 0 ? (
        <div className="card empty-state">
          <Target size={48} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Chưa có mục tiêu nào</h3>
          <p style={{ maxWidth: '420px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
            Hãy đặt cho bản thân một mục tiêu có ý nghĩa trong tháng này và chia nhỏ thành các bước thực hiện.
          </p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} /> Tạo mục tiêu đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid-2">
          {goals.map(g => (
            <div key={g.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <span className="badge badge-primary" style={{ marginBottom: '8px' }}>
                      {g.category}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{g.title}</h3>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-icon btn-secondary btn-sm" onClick={() => openEditModal(g)} title="Sửa mục tiêu">
                      <Edit2 size={14} />
                    </button>
                    <button className="btn btn-icon btn-secondary btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteGoal(g.id)} title="Xóa mục tiêu">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {g.description && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: 1.5 }}>
                    {g.description}
                  </p>
                )}

                {/* Progress bar */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Tiến độ hoàn thành</span>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>{g.progress}%</span>
                  </div>
                  <div className="progress-bar-container" style={{ height: '10px' }}>
                    <div className="progress-bar-fill" style={{ width: `${g.progress}%` }}></div>
                  </div>
                </div>

                {/* Milestones list with checkboxes */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    CÁC BƯỚC HÀNH ĐỘNG ({g.milestones?.filter(m => m.completed).length || 0}/{g.milestones?.length || 0})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {g.milestones?.map(m => (
                      <div
                        key={m.id}
                        onClick={() => handleToggleMilestone(g.id, m.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: m.completed ? 'var(--success-light)' : 'var(--bg-tertiary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {m.completed ? (
                          <CheckCircle2 size={18} color="var(--success)" />
                        ) : (
                          <Circle size={18} color="var(--text-muted)" />
                        )}
                        <span style={{
                          fontSize: '0.88rem',
                          fontWeight: 500,
                          textDecoration: m.completed ? 'line-through' : 'none',
                          color: m.completed ? 'var(--text-muted)' : 'var(--text-primary)'
                        }}>
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>Bắt đầu: {g.start_date || 'N/A'}</span>
                <span>Hạn chót: {g.target_date || 'Không giới hạn'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add/Edit Goal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {editingGoal ? 'Cập Nhật Mục Tiêu' : 'Tạo Mục Tiêu Mới'}
              </h3>
              <button className="btn btn-icon btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveGoal}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tên mục tiêu *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: Đạt chứng chỉ TOEIC 850+, Tiết kiệm 50 triệu..."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mô tả mục tiêu</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Ý nghĩa của mục tiêu và định hướng thực hiện..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Danh mục</label>
                    <select
                      className="form-select"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                    >
                      <option value="Phát triển cá nhân">Phát triển cá nhân</option>
                      <option value="Học tập">Học tập</option>
                      <option value="Sự nghiệp">Sự nghiệp</option>
                      <option value="Tài chính">Tài chính</option>
                      <option value="Sức khỏe">Sức khỏe</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ngày bắt đầu</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hạn hoàn thành</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formTargetDate}
                      onChange={(e) => setFormTargetDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Sub-steps / Milestones builder */}
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Các bước hành động cụ thể</label>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleAiSuggestMilestones}
                      disabled={aiSuggesting}
                      style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
                    >
                      <Sparkles size={14} />
                      <span>{aiSuggesting ? 'AI đang phân tích...' : 'Nhờ AI gợi ý bước'}</span>
                    </button>
                  </div>

                  {/* Add milestone inline */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Thêm một bước thực hiện..."
                      value={newMilestoneText}
                      onChange={(e) => setNewMilestoneText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddMilestone();
                        }
                      }}
                    />
                    <button type="button" className="btn btn-secondary" onClick={handleAddMilestone}>
                      Thêm
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                    {milestones.map((m, idx) => (
                      <div key={m.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                        <span style={{ fontSize: '0.88rem' }}>{idx + 1}. {m.title}</span>
                        <button type="button" className="btn btn-icon btn-sm" onClick={() => handleRemoveMilestone(m.id)}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" id="save-goal-btn">
                  {editingGoal ? 'Lưu cập nhật' : 'Tạo mục tiêu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
