import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  FileText,
  Plus,
  Pin,
  Search,
  Tag,
  Trash2,
  Edit2,
  X
} from 'lucide-react';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formColor, setFormColor] = useState('#ffffff');
  const [formTags, setFormTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedTag) params.append('tag', selectedTag);

      const res = await api.get(`/notes?${params.toString()}`);
      if (res.success) {
        setNotes(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải ghi chú:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [selectedTag]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNotes();
  };

  const openCreateModal = () => {
    setEditingNote(null);
    setFormTitle('');
    setFormContent('');
    setFormColor('#ffffff');
    setFormTags([]);
    setTagInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (n) => {
    setEditingNote(n);
    setFormTitle(n.title);
    setFormContent(n.content);
    setFormColor(n.color || '#ffffff');
    setFormTags(n.tags || []);
    setTagInput('');
    setIsModalOpen(true);
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!formTags.includes(tagInput.trim())) {
      setFormTags([...formTags, tagInput.trim()]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tToRemove) => {
    setFormTags(formTags.filter(t => t !== tToRemove));
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    try {
      const payload = {
        title: formTitle,
        content: formContent,
        color: formColor,
        tags: formTags
      };

      if (editingNote) {
        await api.patch(`/notes/${editingNote.id}`, payload);
      } else {
        await api.post('/notes', payload);
      }

      setIsModalOpen(false);
      fetchNotes();
    } catch (err) {
      alert(err.message || 'Lỗi lưu ghi chú.');
    }
  };

  const handleTogglePin = async (id) => {
    try {
      await api.patch(`/notes/${id}/pin`, {});
      fetchNotes();
    } catch (err) {
      console.error('Lỗi ghim ghi chú:', err);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) return;
    try {
      await api.delete(`/notes/${id}`);
      fetchNotes();
    } catch (err) {
      alert(err.message || 'Lỗi xóa ghi chú.');
    }
  };

  // Collect all unique tags for filter chips
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags || [])));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Ghi Chú Cá Nhân</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Không gian lưu giữ ý tưởng, bài học và suy nghĩ riêng tư an toàn
          </p>
        </div>

        <button className="btn btn-primary" onClick={openCreateModal} id="add-note-btn">
          <Plus size={16} />
          <span>Tạo ghi chú mới</span>
        </button>
      </div>

      {/* Search and Tags Filter */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: allTags.length > 0 ? '14px' : 0 }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="note-search-input"
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">Tìm kiếm</button>
        </form>

        {allTags.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Lọc theo thẻ:</span>
            <button
              className={`btn btn-sm ${selectedTag === '' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
              onClick={() => setSelectedTag('')}
            >
              Tất cả
            </button>
            {allTags.map(t => (
              <button
                key={t}
                className={`btn btn-sm ${selectedTag === t ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                onClick={() => setSelectedTag(t)}
              >
                #{t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Đang tải danh sách ghi chú...
        </div>
      ) : notes.length === 0 ? (
        <div className="card empty-state">
          <FileText size={48} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Chưa có ghi chú nào</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
            Ghi lại những ý tưởng bất chợt, trích dẫn hay trong sách hoặc checklist quan trọng.
          </p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} /> Tạo ghi chú đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {notes.map(n => (
            <div
              key={n.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                borderTop: n.is_pinned === 1 ? '4px solid var(--warning)' : '1px solid var(--border-color)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{n.title}</h3>
                  <button
                    className="btn btn-icon btn-secondary btn-sm"
                    onClick={() => handleTogglePin(n.id)}
                    style={{ color: n.is_pinned === 1 ? 'var(--warning)' : 'var(--text-muted)' }}
                    title={n.is_pinned === 1 ? 'Bỏ ghim' : 'Ghim lên đầu'}
                  >
                    <Pin size={15} style={{ transform: n.is_pinned === 1 ? 'rotate(45deg)' : 'none' }} />
                  </button>
                </div>

                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  marginBottom: '16px'
                }}>
                  {n.content}
                </p>

                {/* Tags */}
                {n.tags?.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {n.tags.map(t => (
                      <span key={t} className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {n.updated_at.substring(0, 10)}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-icon btn-secondary btn-sm" onClick={() => openEditModal(n)}>
                    <Edit2 size={13} />
                  </button>
                  <button className="btn btn-icon btn-secondary btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteNote(n.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add/Edit Note */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {editingNote ? 'Sửa Ghi Chú' : 'Tạo Ghi Chú Mới'}
              </h3>
              <button className="btn btn-icon btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNote}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tiêu đề ghi chú *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: Quy tắc phân bổ ngân sách, Ý tưởng dự án..."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nội dung chi tiết</label>
                  <textarea
                    className="form-textarea"
                    rows={6}
                    placeholder="Viết suy nghĩ của bạn ở đây..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                  />
                </div>

                {/* Tags manager */}
                <div className="form-group">
                  <label className="form-label">Thẻ gắn nhãn (tags)</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nhập thẻ rồi bấm Thêm..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <button type="button" className="btn btn-secondary" onClick={handleAddTag}>Thêm</button>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {formTags.map(t => (
                      <span key={t} className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        #{t}
                        <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveTag(t)} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" id="save-note-btn">
                  {editingNote ? 'Lưu cập nhật' : 'Tạo ghi chú'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
