import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  List,
  Kanban,
  Tag,
  Flag,
  X
} from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('due_date');

  // Modal create/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formPriority, setFormPriority] = useState('medium');
  const [formCategory, setFormCategory] = useState('Công việc');
  const [formStatus, setFormStatus] = useState('todo');

  // Delete confirm modal
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (search) params.append('search', search);
      params.append('sortBy', sortBy);

      const [res, sRes] = await Promise.all([
        api.get(`/tasks?${params.toString()}`),
        api.get('/tasks/stats')
      ]);

      if (res.success) setTasks(res.data);
      if (sRes.success) setStats(sRes.data);
    } catch (err) {
      console.error('Lỗi tải công việc:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter, categoryFilter, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTasks();
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDescription('');
    setFormDueDate('');
    setFormPriority('medium');
    setFormCategory('Công việc');
    setFormStatus('todo');
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingTask(t);
    setFormTitle(t.title);
    setFormDescription(t.description || '');
    setFormDueDate(t.due_date || '');
    setFormPriority(t.priority || 'medium');
    setFormCategory(t.category || 'Công việc');
    setFormStatus(t.status || 'todo');
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    try {
      const payload = {
        title: formTitle,
        description: formDescription,
        due_date: formDueDate || null,
        priority: formPriority,
        category: formCategory,
        status: formStatus
      };

      if (editingTask) {
        await api.patch(`/tasks/${editingTask.id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      alert(err.message || 'Lỗi lưu công việc.');
    }
  };

  const handleToggleStatus = async (taskId) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/toggle`, {});
      if (res.success) {
        setTasks(prev => prev.map(t => t.id === taskId ? res.data : t));
        const sRes = await api.get('/tasks/stats');
        if (sRes.success) setStats(sRes.data);
      }
    } catch (err) {
      console.error('Lỗi đổi trạng thái:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setDeleteConfirmId(null);
      fetchTasks();
    } catch (err) {
      alert(err.message || 'Lỗi xóa công việc.');
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'urgent': return <span className="badge badge-danger">Khẩn cấp</span>;
      case 'high': return <span className="badge badge-warning">Ưu tiên cao</span>;
      case 'medium': return <span className="badge badge-primary">Trung bình</span>;
      default: return <span className="badge badge-info">Thấp</span>;
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'completed': return <span className="badge badge-success">Đã hoàn thành</span>;
      case 'in_progress': return <span className="badge badge-warning">Đang làm</span>;
      case 'cancelled': return <span className="badge badge-danger">Đã hủy</span>;
      default: return <span className="badge badge-primary">Cần làm</span>;
    }
  };

  // Kanban buckets
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Quản Lý Công Việc</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Tổng cộng: <strong>{stats?.total || 0}</strong> việc • Hoàn thành: <strong>{stats?.completed || 0}</strong> ({stats?.completionRate || 0}%) • Quá hạn: <strong style={{ color: 'var(--danger)' }}>{stats?.overdue || 0}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-tertiary)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
            <button
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('list')}
              title="Xem dạng danh sách"
              id="view-mode-list-btn"
            >
              <List size={16} />
              <span>Danh sách</span>
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('kanban')}
              title="Xem dạng bảng Kanban"
              id="view-mode-kanban-btn"
            >
              <Kanban size={16} />
              <span>Kanban</span>
            </button>
          </div>

          <button className="btn btn-primary" onClick={openCreateModal} id="add-task-btn">
            <Plus size={16} />
            <span>Thêm công việc</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Tìm kiếm công việc theo tiêu đề, mô tả..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="task-search-input"
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '130px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            id="task-status-filter"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="todo">Cần làm</option>
            <option value="in_progress">Đang thực hiện</option>
            <option value="completed">Đã hoàn thành</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '130px' }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            id="task-priority-filter"
          >
            <option value="all">Tất cả mức ưu tiên</option>
            <option value="urgent">Khẩn cấp</option>
            <option value="high">Ưu tiên cao</option>
            <option value="medium">Trung bình</option>
            <option value="low">Thấp</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '130px' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            id="task-category-filter"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="Công việc">Công việc</option>
            <option value="Học tập">Học tập</option>
            <option value="Cá nhân">Cá nhân</option>
            <option value="Sức khỏe">Sức khỏe</option>
            <option value="Tài chính">Tài chính</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '130px' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            id="task-sort-by"
          >
            <option value="due_date">Sắp xếp: Ngày đến hạn</option>
            <option value="priority">Sắp xếp: Độ ưu tiên</option>
            <option value="created_at">Sắp xếp: Ngày tạo</option>
          </select>

          <button type="submit" className="btn btn-secondary btn-sm" id="apply-filter-btn">
            Lọc
          </button>
        </form>
      </div>

      {/* Main Task View */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Đang tải danh sách công việc...
        </div>
      ) : tasks.length === 0 ? (
        <div className="card empty-state">
          <Layers size={48} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Chưa tìm thấy công việc nào</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
            Không có công việc nào khớp với bộ lọc hoặc bạn chưa tạo việc nào. Hãy thêm công việc mới ngay!
          </p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} /> Thêm công việc đầu tiên
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.map(t => (
            <div
              key={t.id}
              className="card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
                borderLeft: t.status === 'completed' ? '4px solid var(--success)' : t.due_date && t.due_date < new Date().toISOString().split('T')[0] ? '4px solid var(--danger)' : '4px solid var(--primary)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px' }}>
                <button
                  className="btn btn-icon btn-sm"
                  onClick={() => handleToggleStatus(t.id)}
                  style={{
                    backgroundColor: t.status === 'completed' ? 'var(--success)' : 'transparent',
                    color: t.status === 'completed' ? '#fff' : 'var(--text-muted)',
                    border: '2px solid',
                    borderColor: t.status === 'completed' ? 'var(--success)' : 'var(--border-color)',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px'
                  }}
                  title={t.status === 'completed' ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
                  id={`toggle-task-${t.id}`}
                >
                  <CheckCircle2 size={16} />
                </button>

                <div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    textDecoration: t.status === 'completed' ? 'line-through' : 'none',
                    color: t.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)'
                  }}>
                    {t.title}
                  </div>
                  {t.description && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {t.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Tag size={12} /> {t.category}
                    </span>
                    {t.due_date && (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: t.status !== 'completed' && t.due_date < new Date().toISOString().split('T')[0] ? 'var(--danger)' : 'inherit',
                        fontWeight: t.status !== 'completed' && t.due_date < new Date().toISOString().split('T')[0] ? 700 : 'normal'
                      }}>
                        <Calendar size={12} /> Hạn: {t.due_date}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {getPriorityBadge(t.priority)}
                {getStatusBadge(t.status)}

                <button
                  className="btn btn-icon btn-secondary btn-sm"
                  onClick={() => openEditModal(t)}
                  title="Sửa công việc"
                  id={`edit-task-${t.id}`}
                >
                  <Edit2 size={15} />
                </button>

                <button
                  className="btn btn-icon btn-secondary btn-sm"
                  onClick={() => setDeleteConfirmId(t.id)}
                  title="Xóa công việc"
                  style={{ color: 'var(--danger)' }}
                  id={`delete-task-${t.id}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Kanban View */
        <div className="kanban-board">
          {/* Column 1: Cần làm */}
          <div className="kanban-column">
            <div className="kanban-column-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Circle size={16} color="var(--primary)" />
                <span>Cần làm ({todoTasks.length})</span>
              </span>
            </div>
            {todoTasks.map(t => (
              <div key={t.id} className="kanban-card" onClick={() => openEditModal(t)}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '6px' }}>{t.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  {t.description}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {getPriorityBadge(t.priority)}
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{t.due_date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Column 2: Đang thực hiện */}
          <div className="kanban-column">
            <div className="kanban-column-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="var(--warning)" />
                <span>Đang thực hiện ({inProgressTasks.length})</span>
              </span>
            </div>
            {inProgressTasks.map(t => (
              <div key={t.id} className="kanban-card" onClick={() => openEditModal(t)}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '6px' }}>{t.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  {t.description}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {getPriorityBadge(t.priority)}
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{t.due_date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Column 3: Đã hoàn thành */}
          <div className="kanban-column">
            <div className="kanban-column-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="var(--success)" />
                <span>Đã hoàn thành ({completedTasks.length})</span>
              </span>
            </div>
            {completedTasks.map(t => (
              <div key={t.id} className="kanban-card" onClick={() => openEditModal(t)}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '6px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                  {t.title}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-success">Xong</span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{t.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Create/Edit Task */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {editingTask ? 'Cập Nhật Công Việc' : 'Tạo Công Việc Mới'}
              </h3>
              <button className="btn btn-icon btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTask}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="task-title-input">Tiêu đề công việc *</label>
                  <input
                    id="task-title-input"
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: Soạn thảo đề cương kế hoạch tháng..."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="task-desc-input">Mô tả chi tiết</label>
                  <textarea
                    id="task-desc-input"
                    className="form-textarea"
                    rows={3}
                    placeholder="Ghi chú thêm về các bước thực hiện, tài liệu tham khảo..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="task-duedate-input">Hạn hoàn thành</label>
                    <input
                      id="task-duedate-input"
                      type="date"
                      className="form-input"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="task-priority-input">Mức ưu tiên</label>
                    <select
                      id="task-priority-input"
                      className="form-select"
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value)}
                    >
                      <option value="low">Thấp</option>
                      <option value="medium">Trung bình</option>
                      <option value="high">Ưu tiên cao</option>
                      <option value="urgent">Khẩn cấp</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="task-category-input">Danh mục</label>
                    <select
                      id="task-category-input"
                      className="form-select"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                    >
                      <option value="Công việc">Công việc</option>
                      <option value="Học tập">Học tập</option>
                      <option value="Cá nhân">Cá nhân</option>
                      <option value="Sức khỏe">Sức khỏe</option>
                      <option value="Tài chính">Tài chính</option>
                      <option value="Dự án">Dự án</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="task-status-input">Trạng thái</label>
                    <select
                      id="task-status-input"
                      className="form-select"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                    >
                      <option value="todo">Cần làm</option>
                      <option value="in_progress">Đang thực hiện</option>
                      <option value="completed">Đã hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" id="save-task-btn">
                  {editingTask ? 'Lưu thay đổi' : 'Tạo công việc'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', color: 'var(--danger)' }}>Xác nhận xóa công việc</h3>
              <button className="btn btn-icon btn-secondary btn-sm" onClick={() => setDeleteConfirmId(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>
                Bạn có chắc chắn muốn xóa vĩnh viễn công việc này không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>
                Hủy bỏ
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteTask(deleteConfirmId)}
                id="confirm-delete-task-btn"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
