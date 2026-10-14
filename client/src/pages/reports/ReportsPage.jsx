import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  BarChart3,
  TrendingUp,
  Download,
  CheckSquare,
  Target,
  Flame,
  Wallet,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/summary');
      if (res.success) {
        setReport(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải báo cáo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExport = async (type) => {
    try {
      await api.downloadCsv(`/reports/export-csv?type=${type}`, `lifehub_${type}_report_${Date.now()}.csv`);
    } catch (err) {
      alert(err.message || 'Lỗi xuất báo cáo CSV.');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
        Đang tổng hợp báo cáo và tính toán số liệu phân tích...
      </div>
    );
  }

  const { tasks, goals, habits, finance } = report || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header & Export Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Báo Cáo & Thống Kê Tổng Hợp</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Toàn bộ số liệu được phân tích trực tiếp từ cơ sở dữ liệu thực của bạn
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => handleExport('tasks')} id="export-tasks-csv-btn">
            <Download size={14} /> Xuất CSV Công việc
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => handleExport('habits')} id="export-habits-csv-btn">
            <Download size={14} /> Xuất CSV Thói quen
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => handleExport('transactions')} id="export-finance-csv-btn">
            <Download size={14} /> Xuất CSV Tài chính
          </button>
        </div>
      </div>

      {/* 4 Pillars Overview */}
      <div className="grid-4">
        {/* Task Efficiency */}
        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>TỶ LỆ HOÀN THÀNH VIỆC</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
              {tasks?.rate || 0}%
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {tasks?.completed} / {tasks?.total} việc đã xử lý
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <CheckSquare size={24} />
          </div>
        </div>

        {/* Goals Progress */}
        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>TIẾN ĐỘ MỤC TIÊU BÌNH QUÂN</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--purple)', marginTop: '4px' }}>
              {goals?.avgProgress || 0}%
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {goals?.active} mục tiêu đang theo đuổi
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}>
            <Target size={24} />
          </div>
        </div>

        {/* Habit Consistency */}
        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>TỔNG LƯỢT ĐIỂM DANH</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--warning)', marginTop: '4px' }}>
              {habits?.totalCompletions || 0} lượt
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Chuỗi kỷ lục: {habits?.maxStreak} ngày
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
            <Flame size={24} />
          </div>
        </div>

        {/* Net Savings */}
        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>SỐ DƯ DÒNG TIỀN THÁNG</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: (finance?.net || 0) >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: '4px' }}>
              {(finance?.net || 0).toLocaleString('vi-VN')} đ
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Thu {(finance?.income || 0).toLocaleString('vi-VN')} đ
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <Wallet size={24} />
          </div>
        </div>
      </div>

      {/* Row 2: Financial Trend Comparison + Expense Category Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Monthly Trend History */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px' }}>Lịch Sử Thu & Chi Theo Tháng</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
            So sánh dòng tiền thu nhập và chi phí phát sinh qua các kỳ gần nhất
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {finance?.monthlyHistory?.map(m => {
              const maxVal = Math.max(m.income, m.expense, 1);
              const incPercent = (m.income / maxVal) * 100;
              const expPercent = (m.expense / maxVal) * 100;

              return (
                <div key={m.month} style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontWeight: 700, fontSize: '0.92rem' }}>
                    <span>Tháng {m.month}</span>
                    <span style={{ color: m.income >= m.expense ? 'var(--success)' : 'var(--danger)' }}>
                      Chênh lệch: {(m.income - m.expense).toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  {/* Income Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', width: '60px', color: 'var(--text-muted)' }}>Thu:</span>
                    <div style={{ flex: 1, height: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${incPercent}%`, height: '100%', backgroundColor: 'var(--success)' }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, width: '100px', textAlign: 'right', color: 'var(--success)' }}>
                      {m.income.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  {/* Expense Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.75rem', width: '60px', color: 'var(--text-muted)' }}>Chi:</span>
                    <div style={{ flex: 1, height: '8px', backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${expPercent}%`, height: '100%', backgroundColor: 'var(--danger)' }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, width: '100px', textAlign: 'right', color: 'var(--danger)' }}>
                      {m.expense.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense Category Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px' }}>Phân Bổ Chi Tiêu Theo Danh Mục</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Cơ cấu các khoản chi lớn nhất trong kỳ tháng {finance?.month}
          </p>

          {finance?.categoryBreakdown?.length === 0 ? (
            <div className="empty-state">
              <div>Chưa có dữ liệu chi tiêu trong kỳ này.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {finance?.categoryBreakdown?.map((cat, idx) => {
                const totalExp = finance.expense || 1;
                const percent = Math.round((cat.total / totalExp) * 100);

                return (
                  <div key={cat.category} style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{idx + 1}. {cat.category}</span>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>{cat.total.toLocaleString('vi-VN')} đ ({percent}%)</span>
                    </div>
                    <div className="progress-bar-container" style={{ height: '7px' }}>
                      <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
