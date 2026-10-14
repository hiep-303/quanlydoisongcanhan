import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Wallet,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Search,
  Filter,
  Trash2,
  Edit2,
  AlertTriangle,
  Calendar,
  CreditCard,
  X,
  PieChart
} from 'lucide-react';

export default function FinancePage() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().substring(0, 7));

  // Modal Transaction
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [txType, setTxType] = useState('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('Ăn uống');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txNotes, setTxNotes] = useState('');
  const [txPaymentMethod, setTxPaymentMethod] = useState('Chuyển khoản');

  // Modal Budget
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [bgCategory, setBgCategory] = useState('Ăn uống');
  const [bgLimit, setBgLimit] = useState('');
  const [bgThreshold, setBgThreshold] = useState(80);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (search) params.append('search', search);

      const [txRes, bgRes, anRes] = await Promise.all([
        api.get(`/finance/transactions?${params.toString()}`),
        api.get(`/finance/budgets?monthYear=${currentMonth}`),
        api.get(`/finance/analytics?monthYear=${currentMonth}`)
      ]);

      if (txRes.success) setTransactions(txRes.data);
      if (bgRes.success) setBudgets(bgRes.data);
      if (anRes.success) setAnalytics(anRes.data);
    } catch (err) {
      console.error('Lỗi tải tài chính:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter, categoryFilter, currentMonth]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const openCreateTxModal = (type = 'expense') => {
    setEditingTx(null);
    setTxType(type);
    setTxAmount('');
    setTxCategory(type === 'income' ? 'Lương chính thức' : 'Ăn uống');
    setTxDate(new Date().toISOString().split('T')[0]);
    setTxNotes('');
    setTxPaymentMethod('Chuyển khoản');
    setIsTxModalOpen(true);
  };

  const openEditTxModal = (tx) => {
    setEditingTx(tx);
    setTxType(tx.type);
    setTxAmount(tx.amount.toString());
    setTxCategory(tx.category);
    setTxDate(tx.date);
    setTxNotes(tx.notes || '');
    setTxPaymentMethod(tx.payment_method || 'Tiền mặt');
    setIsTxModalOpen(true);
  };

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    const num = parseFloat(txAmount);
    if (isNaN(num) || num <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ lớn hơn 0.');
      return;
    }

    try {
      const payload = {
        type: txType,
        amount: num,
        category: txCategory,
        date: txDate,
        notes: txNotes,
        payment_method: txPaymentMethod
      };

      if (editingTx) {
        await api.patch(`/finance/transactions/${editingTx.id}`, payload);
      } else {
        await api.post('/finance/transactions', payload);
      }

      setIsTxModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Lỗi lưu giao dịch.');
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) return;
    try {
      await api.delete(`/finance/transactions/${id}`);
      fetchData();
    } catch (err) {
      alert(err.message || 'Lỗi xóa giao dịch.');
    }
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    const limit = parseFloat(bgLimit);
    if (isNaN(limit) || limit <= 0) {
      alert('Vui lòng nhập hạn mức lớn hơn 0.');
      return;
    }

    try {
      await api.post('/finance/budgets', {
        category: bgCategory,
        monthly_limit: limit,
        month_year: currentMonth,
        alert_threshold: parseFloat(bgThreshold)
      });
      setIsBudgetModalOpen(false);
      setBgLimit('');
      fetchData();
    } catch (err) {
      alert(err.message || 'Lỗi thiết lập ngân sách.');
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!confirm('Xóa ngân sách này?')) return;
    try {
      await api.delete(`/finance/budgets/${id}`);
      fetchData();
    } catch (err) {
      alert(err.message || 'Lỗi xóa ngân sách.');
    }
  };

  const handleExportCsv = async () => {
    try {
      await api.downloadCsv('/reports/export-csv?type=transactions', `transactions_${currentMonth}.csv`);
    } catch (err) {
      alert(err.message || 'Lỗi xuất file CSV.');
    }
  };

  const incomeCategories = ['Lương chính thức', 'Thưởng & Bonus', 'Freelance & Dự án ngoài', 'Đầu tư & Cổ tức', 'Khác'];
  const expenseCategories = ['Ăn uống', 'Đi lại & Xăng xe', 'Nhà ở & Tiện ích', 'Mua sắm & Gia dụng', 'Giải trí', 'Học tập & Sách', 'Sức khỏe & Y tế', 'Khác'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Month Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Quản Lý Tài Chính Cá Nhân</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Theo dõi dòng tiền, hạn mức ngân sách và xây dựng tài chính lành mạnh
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="month"
            className="form-input"
            style={{ width: 'auto' }}
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
          />

          <button className="btn btn-secondary" onClick={handleExportCsv} title="Xuất file CSV" id="export-csv-btn">
            <Download size={16} />
            <span>Xuất CSV</span>
          </button>

          <button className="btn btn-primary" onClick={() => openCreateTxModal('expense')} id="add-expense-btn">
            <Plus size={16} />
            <span>Thêm chi tiêu</span>
          </button>

          <button className="btn btn-secondary" onClick={() => openCreateTxModal('income')} style={{ color: 'var(--success)', borderColor: 'var(--success)' }} id="add-income-btn">
            <Plus size={16} />
            <span>Thêm thu nhập</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid-3">
        {/* Total Income */}
        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>TỔNG THU NHẬP</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--success)' }}>
              {(analytics?.totalIncome || 0).toLocaleString('vi-VN')} đ
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Tháng {currentMonth}
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Total Expense */}
        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>TỔNG CHI TIÊU</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--danger)' }}>
              {(analytics?.totalExpense || 0).toLocaleString('vi-VN')} đ
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Tháng {currentMonth}
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
            <TrendingDown size={24} />
          </div>
        </div>

        {/* Net Savings */}
        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>SỐ DƯ TÍCH LŨY</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: (analytics?.netSavings || 0) >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
              {(analytics?.netSavings || 0).toLocaleString('vi-VN')} đ
            </div>
            <div style={{ fontSize: '0.8rem', color: (analytics?.netSavings || 0) >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600, marginTop: '4px' }}>
              {(analytics?.netSavings || 0) >= 0 ? '✓ Đang thặng dư ngân sách' : '⚠️ Vượt thu nhập'}
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Wallet size={24} />
          </div>
        </div>
      </div>

      {/* Budgets Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Hạn Mức Ngân Sách Theo Danh Mục</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Kiểm soát hạn mức và cảnh báo tự động khi gần chạm ngưỡng chi tiêu
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setIsBudgetModalOpen(true)} id="set-budget-btn">
            <Plus size={14} />
            <span>Thiết lập hạn mức</span>
          </button>
        </div>

        {budgets.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <div>Chưa thiết lập ngân sách cho tháng này. Hãy đặt hạn mức cho các khoản chi tiêu thiết yếu!</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {budgets.map(b => (
              <div
                key={b.id}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid',
                  borderColor: b.is_exceeded ? 'var(--danger)' : b.percentage >= b.alert_threshold ? 'var(--warning)' : 'var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{b.category}</span>
                  <button className="btn btn-icon btn-sm" onClick={() => handleDeleteBudget(b.id)} title="Xóa hạn mức">
                    <Trash2 size={13} color="var(--text-muted)" />
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                  <span>Đã chi: <strong>{b.spent.toLocaleString('vi-VN')} đ</strong></span>
                  <span>Hạn mức: <strong>{b.monthly_limit.toLocaleString('vi-VN')} đ</strong></span>
                </div>

                <div className="progress-bar-container" style={{ height: '8px' }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min(100, b.percentage)}%`,
                      background: b.is_exceeded ? 'var(--danger)' : b.percentage >= b.alert_threshold ? 'var(--warning)' : 'var(--primary)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '6px', color: b.is_exceeded ? 'var(--danger)' : 'var(--text-muted)' }}>
                  <span>{b.percentage}% hạn mức</span>
                  <span>{b.is_exceeded ? '⚠️ ĐÃ VƯỢT NGÂN SÁCH' : `Còn lại: ${b.remaining.toLocaleString('vi-VN')} đ`}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transactions Filter & Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Lịch Sử Giao Dịch</h3>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-input"
              style={{ width: '220px' }}
              placeholder="Tìm theo ghi chú..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Tất cả loại</option>
              <option value="expense">Khoản chi</option>
              <option value="income">Khoản thu</option>
            </select>

            <button type="submit" className="btn btn-secondary btn-sm">
              Tìm
            </button>
          </form>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <DollarSign size={40} />
            <div>Chưa có giao dịch nào phù hợp.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 14px' }}>Ngày</th>
                  <th style={{ padding: '12px 14px' }}>Danh mục</th>
                  <th style={{ padding: '12px 14px' }}>Ghi chú</th>
                  <th style={{ padding: '12px 14px' }}>Phương thức</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Số tiền</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>{tx.date}</td>
                    <td style={{ padding: '14px', fontWeight: 600 }}>{tx.category}</td>
                    <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>{tx.notes || '—'}</td>
                    <td style={{ padding: '14px', color: 'var(--text-muted)' }}>{tx.payment_method}</td>
                    <td style={{
                      padding: '14px',
                      textAlign: 'right',
                      fontWeight: 800,
                      color: tx.type === 'income' ? 'var(--success)' : 'var(--text-primary)'
                    }}>
                      {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')} đ
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                        <button className="btn btn-icon btn-secondary btn-sm" onClick={() => openEditTxModal(tx)}>
                          <Edit2 size={13} />
                        </button>
                        <button className="btn btn-icon btn-secondary btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteTransaction(tx.id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Transaction */}
      {isTxModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTxModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {editingTx ? 'Sửa Giao Dịch' : txType === 'income' ? 'Thêm Khoản Thu Nhập' : 'Thêm Khoản Chi Tiêu'}
              </h3>
              <button className="btn btn-icon btn-secondary btn-sm" onClick={() => setIsTxModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <button
                    type="button"
                    className={`btn ${txType === 'expense' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ background: txType === 'expense' ? 'var(--danger)' : undefined }}
                    onClick={() => {
                      setTxType('expense');
                      setTxCategory('Ăn uống');
                    }}
                  >
                    Khoản Chi
                  </button>
                  <button
                    type="button"
                    className={`btn ${txType === 'income' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ background: txType === 'income' ? 'var(--success)' : undefined }}
                    onClick={() => {
                      setTxType('income');
                      setTxCategory('Lương chính thức');
                    }}
                  >
                    Khoản Thu
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">Số tiền (VNĐ) *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Ví dụ: 150000"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    required
                    min="1000"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Danh mục</label>
                    <select
                      className="form-select"
                      value={txCategory}
                      onChange={(e) => setTxCategory(e.target.value)}
                    >
                      {(txType === 'income' ? incomeCategories : expenseCategories).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ngày giao dịch</label>
                    <input
                      type="date"
                      className="form-input"
                      value={txDate}
                      onChange={(e) => setTxDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phương thức thanh toán</label>
                  <select
                    className="form-select"
                    value={txPaymentMethod}
                    onChange={(e) => setTxPaymentMethod(e.target.value)}
                  >
                    <option value="Chuyển khoản">Chuyển khoản</option>
                    <option value="Tiền mặt">Tiền mặt</option>
                    <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                    <option value="Ví điện tử (Momo/ZaloPay)">Ví điện tử</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Ghi chú giao dịch</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: Ăn trưa với khách hàng, mua giáo trình..."
                    value={txNotes}
                    onChange={(e) => setTxNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsTxModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" id="save-tx-btn">
                  {editingTx ? 'Lưu thay đổi' : 'Ghi nhận giao dịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Set Budget */}
      {isBudgetModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBudgetModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Thiết Lập Ngân Sách Tháng {currentMonth}</h3>
              <button className="btn btn-icon btn-secondary btn-sm" onClick={() => setIsBudgetModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBudget}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Danh mục chi tiêu</label>
                  <select
                    className="form-select"
                    value={bgCategory}
                    onChange={(e) => setBgCategory(e.target.value)}
                  >
                    {expenseCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Hạn mức chi tối đa (VNĐ) *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Ví dụ: 3000000"
                    value={bgLimit}
                    onChange={(e) => setBgLimit(e.target.value)}
                    required
                    min="10000"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cảnh báo khi đạt đến (% hạn mức)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={bgThreshold}
                    onChange={(e) => setBgThreshold(e.target.value)}
                    min="50"
                    max="100"
                  />
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Hệ thống sẽ gửi thông báo khi chi tiêu đạt mức này (mặc định 80%).
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsBudgetModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" id="save-budget-btn">
                  Lưu hạn mức
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
