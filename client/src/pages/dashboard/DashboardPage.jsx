import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  CheckSquare,
  Calendar as CalendarIcon,
  Target,
  Flame,
  Wallet,
  FileText,
  Bot,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [taskStats, setTaskStats] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [activeGoals, setActiveGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [finance, setFinance] = useState(null);
  const [recentNotes, setRecentNotes] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tStats, events, goalsRes, habitsRes, finRes, notesRes] = await Promise.all([
        api.get('/tasks/stats'),
        api.get('/events/upcoming'),
        api.get('/goals?status=in_progress'),
        api.get('/habits'),
        api.get('/finance/analytics'),
        api.get('/notes?limit=4')
      ]);

      if (tStats.success) setTaskStats(tStats.data);
      if (events.success) setUpcomingEvents(events.data.slice(0, 3));
      if (goalsRes.success) setActiveGoals(goalsRes.data.slice(0, 3));
      if (habitsRes.success) setHabits(habitsRes.data);
      if (finRes.success) setFinance(finRes.data);
      if (notesRes.success) setRecentNotes(notesRes.data.slice(0, 3));
    } catch (err) {
      console.error('Lỗi tải dữ liệu dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleHabit = async (habitId) => {
    try {
      const res = await api.post(`/habits/${habitId}/toggle-log`, {});
      if (res.success) {
        setHabits(prev => prev.map(h => {
          if (h.id === habitId) {
            return {
              ...h,
              completed_today: res.data.completed,
              streak: res.data.streak,
              best_streak: res.data.best_streak
            };
          }
          return h;
        }));
      }
    } catch (err) {
      console.error('Lỗi điểm danh thói quen:', err);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Đang tổng hợp dữ liệu đời sống của bạn...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Welcome Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        padding: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
            <Sparkles size={16} />
            <span>{getGreeting()}, {user?.name || 'bạn'}!</span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            Hôm nay bạn có <span style={{ color: 'var(--primary)' }}>{taskStats?.dueToday || 0} công việc</span> và <span style={{ color: 'var(--warning)' }}>{upcomingEvents?.length || 0} sự kiện</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '6px' }}>
            Duy trì chuỗi kỷ luật và theo dõi các mục tiêu trọng tâm trong ngày.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/assistant')} id="dash-ask-ai-btn">
            <Bot size={16} color="var(--primary)" />
            <span>Hỏi Trợ lý AI</span>
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/tasks')} id="dash-add-task-btn">
            <Plus size={16} />
            <span>Thêm công việc</span>
          </button>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid-4">
        {/* Tasks Stat Card */}
        <Link to="/tasks" className="stat-card" id="dash-card-tasks">
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>CÔNG VIỆC</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800 }}>{taskStats?.todo + taskStats?.inProgress || 0} việc</div>
            <div style={{ fontSize: '0.8rem', color: taskStats?.overdue > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600, marginTop: '4px' }}>
              {taskStats?.overdue > 0 ? `⚠️ ${taskStats.overdue} việc quá hạn` : '✓ Đúng tiến độ'}
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <CheckSquare size={24} />
          </div>
        </Link>

        {/* Finance Stat Card */}
        <Link to="/finance" className="stat-card" id="dash-card-finance">
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>SỐ DƯ THÁNG NÀY</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800 }}>
              {((finance?.netSavings || 0) / 1000000).toFixed(1)} tr đ
            </div>
            <div style={{ fontSize: '0.8rem', color: (finance?.netSavings || 0) >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {(finance?.netSavings || 0) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>Chi: {((finance?.totalExpense || 0) / 1000000).toFixed(1)} tr đ</span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <Wallet size={24} />
          </div>
        </Link>

        {/* Habits Stat Card */}
        <Link to="/habits" className="stat-card" id="dash-card-habits">
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>THÓI QUEN ĐANG DUY TRÌ</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800 }}>{habits.length} thói quen</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 600, marginTop: '4px' }}>
              🔥 Chuỗi cao nhất: {Math.max(0, ...habits.map(h => h.best_streak || 0))} ngày
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
            <Flame size={24} />
          </div>
        </Link>

        {/* Goals Stat Card */}
        <Link to="/goals" className="stat-card" id="dash-card-goals">
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>MỤC TIÊU ĐANG CHẠY</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800 }}>{activeGoals.length} mục tiêu</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--purple)', fontWeight: 600, marginTop: '4px' }}>
              🎯 Tiến độ bình quân: {activeGoals.length > 0 ? Math.round(activeGoals.reduce((a, b) => a + b.progress, 0) / activeGoals.length) : 0}%
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}>
            <Target size={24} />
          </div>
        </Link>
      </div>

      {/* Main Grid: Left (Habits & Goals) + Right (Upcoming Events & Recent Notes) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Habit Check-ins Today */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Flame size={20} color="#f59e0b" />
              <h3 style={{ fontSize: '1.15rem' }}>Điểm danh thói quen hôm nay</h3>
            </div>
            <Link to="/habits" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>

          {habits.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div>Chưa có thói quen nào. Tạo thói quen đầu tiên!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {habits.map(h => (
                <div
                  key={h.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: h.completed_today ? 'var(--success-light)' : 'var(--bg-tertiary)',
                    border: '1px solid',
                    borderColor: h.completed_today ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      className="btn btn-icon btn-sm"
                      onClick={() => handleToggleHabit(h.id)}
                      style={{
                        backgroundColor: h.completed_today ? 'var(--success)' : 'var(--bg-secondary)',
                        color: h.completed_today ? '#fff' : 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                        width: '32px',
                        height: '32px'
                      }}
                      title={h.completed_today ? 'Đã hoàn thành hôm nay' : 'Nhấn để điểm danh'}
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem', textDecoration: h.completed_today ? 'line-through' : 'none' }}>
                        {h.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        🔥 Chuỗi liên tiếp: <strong>{h.streak} ngày</strong>
                      </div>
                    </div>
                  </div>

                  <span className={`badge ${h.completed_today ? 'badge-success' : 'badge-warning'}`}>
                    {h.completed_today ? 'Đã hoàn thành' : 'Chưa điểm danh'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Goals in Progress */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Target size={20} color="#8b5cf6" />
              <h3 style={{ fontSize: '1.15rem' }}>Mục tiêu trọng tâm</h3>
            </div>
            <Link to="/goals" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Quản lý mục tiêu <ArrowRight size={14} />
            </Link>
          </div>

          {activeGoals.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div>Chưa có mục tiêu nào đang thực hiện.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeGoals.map(g => (
                <div key={g.id} style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{g.title}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>{g.progress}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${g.progress}%` }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    <span>Danh mục: {g.category}</span>
                    <span>Hạn: {g.target_date || 'Không giới hạn'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Second Row: Upcoming Events & Recent Notes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Upcoming Events */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CalendarIcon size={20} color="#6366f1" />
              <h3 style={{ fontSize: '1.15rem' }}>Lịch trình sắp tới</h3>
            </div>
            <Link to="/calendar" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Mở lịch <ArrowRight size={14} />
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div>Không có sự kiện nào sắp tới trong lịch.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingEvents.map(e => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', borderLeft: `4px solid ${e.color || '#6366f1'}` }}>
                  <div style={{ minWidth: '60px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{e.start_time.substring(5, 10)}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>{e.start_time.substring(11, 16)}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{e.title}</div>
                    {e.location && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📍 {e.location}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notes */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={20} color="#10b981" />
              <h3 style={{ fontSize: '1.15rem' }}>Ghi chú gần đây</h3>
            </div>
            <Link to="/notes" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>

          {recentNotes.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div>Chưa có ghi chú nào. Hãy ghi lại suy nghĩ của bạn!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentNotes.map(n => (
                <Link to="/notes" key={n.id} style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'block' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{n.title}</span>
                    {n.is_pinned === 1 && <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>📌 Đã ghim</span>}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {n.content}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
