import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Trash2,
  Edit2,
  X,
  AlertCircle
} from 'lucide-react';

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'day'
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formColor, setFormColor] = useState('#6366f1');
  const [formReminder, setFormReminder] = useState(15);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events');
      if (res.success) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải sự kiện:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() - 1);
    else if (viewMode === 'week') next.setDate(next.getDate() - 7);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() + 1);
    else if (viewMode === 'week') next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const openCreateModal = (presetDateStr) => {
    setErrorMsg('');
    setEditingEvent(null);
    setFormTitle('');
    setFormDescription('');
    const dStr = presetDateStr || new Date().toISOString().split('T')[0];
    setFormStartTime(`${dStr}T09:00`);
    setFormEndTime(`${dStr}T10:00`);
    setFormLocation('');
    setFormColor('#6366f1');
    setFormReminder(15);
    setIsModalOpen(true);
  };

  const openEditModal = (evt) => {
    setErrorMsg('');
    setEditingEvent(evt);
    setFormTitle(evt.title);
    setFormDescription(evt.description || '');
    setFormStartTime(evt.start_time.substring(0, 16));
    setFormEndTime(evt.end_time.substring(0, 16));
    setFormLocation(evt.location || '');
    setFormColor(evt.color || '#6366f1');
    setFormReminder(evt.reminder_minutes || 15);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (new Date(formEndTime) <= new Date(formStartTime)) {
      setErrorMsg('Thời gian kết thúc phải diễn ra sau thời gian bắt đầu.');
      return;
    }

    try {
      const payload = {
        title: formTitle,
        description: formDescription,
        start_time: formStartTime,
        end_time: formEndTime,
        location: formLocation,
        color: formColor,
        reminder_minutes: parseInt(formReminder)
      };

      if (editingEvent) {
        await api.patch(`/events/${editingEvent.id}`, payload);
      } else {
        await api.post('/events', payload);
      }

      setIsModalOpen(false);
      fetchEvents();
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi lưu sự kiện.');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) return;
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch (err) {
      alert(err.message || 'Lỗi xóa sự kiện.');
    }
  };

  // Month calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysGrid = [];
  // Adjusted for Monday start (Mon: 0, Sun: 6)
  const offset = (firstDayIndex + 6) % 7;
  for (let i = 0; i < offset; i++) {
    daysGrid.push({ dayNumber: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const evts = events.filter(e => e.start_time.startsWith(dStr));
    daysGrid.push({ dayNumber: d, dateStr: dStr, events: evts });
  }

  const monthYearLabel = new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(currentDate);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header & Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, textTransform: 'capitalize' }}>
            {monthYearLabel}
          </h2>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn btn-icon btn-secondary btn-sm" onClick={handlePrev} title="Kỳ trước" id="cal-prev-btn">
              <ChevronLeft size={18} />
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentDate(new Date())} id="cal-today-btn">
              Hôm nay
            </button>
            <button className="btn btn-icon btn-secondary btn-sm" onClick={handleNext} title="Kỳ sau" id="cal-next-btn">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-tertiary)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
            <button
              className={`btn btn-sm ${viewMode === 'month' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('month')}
              id="cal-mode-month-btn"
            >
              Tháng
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'week' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('week')}
              id="cal-mode-week-btn"
            >
              Tuần
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'day' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('day')}
              id="cal-mode-day-btn"
            >
              Ngày
            </button>
          </div>

          <button className="btn btn-primary" onClick={() => openCreateModal()} id="add-event-btn">
            <Plus size={16} />
            <span>Thêm sự kiện</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid View (Month) */}
      {viewMode === 'month' && (
        <div className="card" style={{ padding: '20px' }}>
          {/* Day of Week Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '10px', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <div>T2 (Hai)</div>
            <div>T3 (Ba)</div>
            <div>T4 (Tư)</div>
            <div>T5 (Năm)</div>
            <div>T6 (Sáu)</div>
            <div>T7 (Bảy)</div>
            <div style={{ color: 'var(--danger)' }}>CN (Chủ nhật)</div>
          </div>

          <div className="calendar-grid">
            {daysGrid.map((item, idx) => {
              if (!item.dayNumber) {
                return <div key={`empty_${idx}`} style={{ minHeight: '110px', opacity: 0.2 }} />;
              }

              const isToday = item.dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={item.dateStr}
                  className={`calendar-day-cell ${isToday ? 'today' : ''}`}
                  onClick={() => openCreateModal(item.dateStr)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{
                      fontWeight: isToday ? 800 : 600,
                      fontSize: '0.88rem',
                      color: isToday ? 'var(--primary)' : 'inherit',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isToday ? 'var(--primary-light)' : 'transparent'
                    }}>
                      {item.dayNumber}
                    </span>
                    {item.events?.length > 0 && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {item.events.length} việc
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', maxHeight: '78px' }}>
                    {item.events?.map(e => (
                      <div
                        key={e.id}
                        onClick={(evt) => {
                          evt.stopPropagation();
                          openEditModal(e);
                        }}
                        style={{
                          backgroundColor: e.color || '#6366f1',
                          color: '#fff',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={`${e.title} (${e.start_time.substring(11, 16)} - ${e.end_time.substring(11, 16)})`}
                      >
                        {e.start_time.substring(11, 16)} {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week / Day View or Agenda List */}
      {(viewMode === 'week' || viewMode === 'day') && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>
            {viewMode === 'week' ? 'Lịch trình trong tuần' : `Lịch trình ngày ${currentDate.toISOString().split('T')[0]}`}
          </h3>
          {events.length === 0 ? (
            <div className="empty-state">
              <CalendarIcon size={40} />
              <div>Không có sự kiện nào trong khoảng thời gian này.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {events.map(e => (
                <div
                  key={e.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderLeft: `5px solid ${e.color || '#6366f1'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ minWidth: '100px', fontWeight: 700, fontSize: '0.9rem' }}>
                      {e.start_time.substring(5, 10)} | {e.start_time.substring(11, 16)} - {e.end_time.substring(11, 16)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{e.title}</div>
                      {e.description && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{e.description}</div>
                      )}
                      {e.location && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <MapPin size={12} /> {e.location}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-icon btn-secondary btn-sm" onClick={() => openEditModal(e)}>
                      <Edit2 size={14} />
                    </button>
                    <button className="btn btn-icon btn-secondary btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteEvent(e.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Add/Edit Event */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {editingEvent ? 'Cập Nhật Sự Kiện' : 'Thêm Sự Kiện Lịch Mới'}
              </h3>
              <button className="btn btn-icon btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent}>
              <div className="modal-body">
                {errorMsg && (
                  <div style={{
                    backgroundColor: 'var(--danger-light)',
                    color: 'var(--danger)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="evt-title-input">Tên sự kiện / Lịch hẹn *</label>
                  <input
                    id="evt-title-input"
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: Họp nhóm dự án, Khám sức khỏe định kỳ..."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="evt-desc-input">Mô tả sự kiện</label>
                  <textarea
                    id="evt-desc-input"
                    className="form-textarea"
                    rows={2}
                    placeholder="Ghi chú nội dung chương trình, tài liệu mang theo..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="evt-start-input">Thời gian bắt đầu *</label>
                    <input
                      id="evt-start-input"
                      type="datetime-local"
                      className="form-input"
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="evt-end-input">Thời gian kết thúc *</label>
                    <input
                      id="evt-end-input"
                      type="datetime-local"
                      className="form-input"
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="evt-loc-input">Địa điểm / Đường dẫn họp trực tuyến</label>
                  <input
                    id="evt-loc-input"
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: Phòng họp 302, Google Meet..."
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="evt-color-input">Màu sắc đánh dấu</label>
                    <input
                      id="evt-color-input"
                      type="color"
                      className="form-input"
                      style={{ height: '42px', padding: '4px' }}
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="evt-rem-input">Nhắc trước (phút)</label>
                    <select
                      id="evt-rem-input"
                      className="form-select"
                      value={formReminder}
                      onChange={(e) => setFormReminder(e.target.value)}
                    >
                      <option value="5">5 phút trước</option>
                      <option value="15">15 phút trước</option>
                      <option value="30">30 phút trước</option>
                      <option value="60">1 giờ trước</option>
                      <option value="1440">1 ngày trước</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" id="save-event-btn">
                  {editingEvent ? 'Lưu cập nhật' : 'Thêm vào lịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
