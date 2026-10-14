const { queryAll, queryOne, execute } = require('../config/db');

function getTransactions(req, res) {
  try {
    const userId = req.user.id;
    const { type, category, startDate, endDate, search, limit = 100, page = 1 } = req.query;

    let sql = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [userId];

    if (type && type !== 'all') {
      sql += ' AND type = ?';
      params.push(type);
    }
    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (startDate) {
      sql += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND date <= ?';
      params.push(endDate);
    }
    if (search) {
      sql += ' AND (notes LIKE ? OR category LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY date DESC, created_at DESC';

    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    sql += ` LIMIT ${parseInt(limit)} OFFSET ${offset}`;

    const transactions = queryAll(sql, params);
    return res.json({ success: true, data: transactions });
  } catch (err) {
    console.error('Lỗi getTransactions:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách giao dịch.' });
  }
}

function createTransaction(req, res) {
  try {
    const userId = req.user.id;
    const { type, amount, category, date, notes, payment_method = 'Tiền mặt' } = req.body;

    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Loại giao dịch phải là thu (income) hoặc chi (expense).' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Số tiền phải là số dương hợp lệ lớn hơn 0.' });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Danh mục chi tiêu/thu nhập không được để trống.' });
    }

    const txDate = date || new Date().toISOString().split('T')[0];
    const txId = 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    execute(`
      INSERT INTO transactions (id, user_id, type, amount, category, date, notes, payment_method, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [txId, userId, type, numAmount, category.trim(), txDate, notes || '', payment_method, now, now]);

    // Check budget alert if this is an expense
    if (type === 'expense') {
      const monthYear = txDate.substring(0, 7);
      const budget = queryOne(`
        SELECT * FROM budgets WHERE user_id = ? AND category = ? AND month_year = ?
      `, [userId, category.trim(), monthYear]);

      if (budget) {
        const spent = queryOne(`
          SELECT SUM(amount) as total FROM transactions
          WHERE user_id = ? AND type = 'expense' AND category = ? AND substr(date, 1, 7) = ?
        `, [userId, category.trim(), monthYear]).total || 0;

        const ratio = (spent / budget.monthly_limit) * 100;
        if (ratio >= budget.alert_threshold) {
          const isOver = ratio > 100;
          const notifTitle = isOver ? `Cảnh báo vượt ngân sách: ${category}` : `Cảnh báo gần chạm hạn mức: ${category}`;
          const notifMsg = `Hạng mục "${category}" trong tháng ${monthYear} đã chi ${spent.toLocaleString('vi-VN')} đ / ${budget.monthly_limit.toLocaleString('vi-VN')} đ (${Math.round(ratio)}%).`;
          
          execute(`
            INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
            VALUES (?, ?, 'finance', ?, ?, '/finance', 0, ?)
          `, ['notif_bdg_' + Date.now(), userId, notifTitle, notifMsg, now]);
        }
      }
    }

    const created = queryOne('SELECT * FROM transactions WHERE id = ?', [txId]);
    return res.status(201).json({ success: true, message: 'Thêm giao dịch thành công!', data: created });
  } catch (err) {
    console.error('Lỗi createTransaction:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tạo giao dịch.' });
  }
}

function updateTransaction(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const existing = queryOne('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch.' });
    }

    const { type, amount, category, date, notes, payment_method } = req.body;
    let numAmount = amount !== undefined ? parseFloat(amount) : existing.amount;
    if (amount !== undefined && (isNaN(numAmount) || numAmount <= 0)) {
      return res.status(400).json({ success: false, message: 'Số tiền phải là số dương hợp lệ.' });
    }

    const now = new Date().toISOString();

    execute(`
      UPDATE transactions SET
        type = COALESCE(?, type),
        amount = ?,
        category = COALESCE(?, category),
        date = COALESCE(?, date),
        notes = COALESCE(?, notes),
        payment_method = COALESCE(?, payment_method),
        updated_at = ?
      WHERE id = ? AND user_id = ?
    `, [
      type || null,
      numAmount,
      category ? category.trim() : null,
      date || null,
      notes !== undefined ? notes : null,
      payment_method || null,
      now,
      id,
      userId
    ]);

    const updated = queryOne('SELECT * FROM transactions WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Cập nhật giao dịch thành công!', data: updated });
  } catch (err) {
    console.error('Lỗi updateTransaction:', err);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật giao dịch.' });
  }
}

function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const existing = queryOne('SELECT id FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch.' });
    }

    execute('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ success: true, message: 'Đã xóa giao dịch thành công.' });
  } catch (err) {
    console.error('Lỗi deleteTransaction:', err);
    return res.status(500).json({ success: false, message: 'Lỗi xóa giao dịch.' });
  }
}

function getBudgets(req, res) {
  try {
    const userId = req.user.id;
    const { monthYear } = req.query;
    const targetMonth = monthYear || new Date().toISOString().substring(0, 7);

    const budgets = queryAll(`
      SELECT * FROM budgets WHERE user_id = ? AND month_year = ?
      ORDER BY category ASC
    `, [userId, targetMonth]);

    // Attach actual spent amount for each budget category
    const result = budgets.map(b => {
      const spentRow = queryOne(`
        SELECT SUM(amount) as spent FROM transactions
        WHERE user_id = ? AND type = 'expense' AND category = ? AND substr(date, 1, 7) = ?
      `, [userId, b.category, targetMonth]);

      const spent = spentRow && spentRow.spent ? spentRow.spent : 0;
      const percentage = Math.round((spent / b.monthly_limit) * 100);

      return {
        ...b,
        spent,
        remaining: Math.max(0, b.monthly_limit - spent),
        percentage,
        is_exceeded: spent > b.monthly_limit
      };
    });

    return res.json({ success: true, data: result, monthYear: targetMonth });
  } catch (err) {
    console.error('Lỗi getBudgets:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tải ngân sách.' });
  }
}

function setBudget(req, res) {
  try {
    const userId = req.user.id;
    const { category, monthly_limit, month_year, alert_threshold = 80.0 } = req.body;

    if (!category || !monthly_limit || !month_year) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp danh mục, hạn mức và tháng (YYYY-MM).' });
    }

    const limit = parseFloat(monthly_limit);
    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({ success: false, message: 'Hạn mức ngân sách phải lớn hơn 0.' });
    }

    const existing = queryOne(`
      SELECT id FROM budgets WHERE user_id = ? AND category = ? AND month_year = ?
    `, [userId, category.trim(), month_year]);

    const now = new Date().toISOString();

    if (existing) {
      execute(`
        UPDATE budgets SET monthly_limit = ?, alert_threshold = ?, updated_at = ?
        WHERE id = ?
      `, [limit, alert_threshold, now, existing.id]);
    } else {
      const budgetId = 'bdg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      execute(`
        INSERT INTO budgets (id, user_id, category, monthly_limit, month_year, alert_threshold, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [budgetId, userId, category.trim(), limit, month_year, alert_threshold, now, now]);
    }

    return res.json({ success: true, message: 'Cập nhật ngân sách thành công!' });
  } catch (err) {
    console.error('Lỗi setBudget:', err);
    return res.status(500).json({ success: false, message: 'Lỗi thiết lập ngân sách.' });
  }
}

function deleteBudget(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    execute('DELETE FROM budgets WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ success: true, message: 'Đã xóa ngân sách.' });
  } catch (err) {
    console.error('Lỗi deleteBudget:', err);
    return res.status(500).json({ success: false, message: 'Lỗi xóa ngân sách.' });
  }
}

function getFinanceAnalytics(req, res) {
  try {
    const userId = req.user.id;
    const { monthYear } = req.query;
    const currentMonth = monthYear || new Date().toISOString().substring(0, 7);

    // Total income and expense in selected month
    const incomeRow = queryOne(`
      SELECT SUM(amount) as total FROM transactions
      WHERE user_id = ? AND type = 'income' AND substr(date, 1, 7) = ?
    `, [userId, currentMonth]);
    const totalIncome = incomeRow && incomeRow.total ? incomeRow.total : 0;

    const expenseRow = queryOne(`
      SELECT SUM(amount) as total FROM transactions
      WHERE user_id = ? AND type = 'expense' AND substr(date, 1, 7) = ?
    `, [userId, currentMonth]);
    const totalExpense = expenseRow && expenseRow.total ? expenseRow.total : 0;

    const netSavings = totalIncome - totalExpense;

    // Expenses by category
    const categoryBreakdown = queryAll(`
      SELECT category, SUM(amount) as total FROM transactions
      WHERE user_id = ? AND type = 'expense' AND substr(date, 1, 7) = ?
      GROUP BY category
      ORDER BY total DESC
    `, [userId, currentMonth]);

    // Monthly trend for the last 6 months
    const monthlyTrends = queryAll(`
      SELECT 
        substr(date, 1, 7) as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE user_id = ? AND date >= date('now', '-6 months')
      GROUP BY substr(date, 1, 7)
      ORDER BY month ASC
    `, [userId]);

    return res.json({
      success: true,
      data: {
        currentMonth,
        totalIncome,
        totalExpense,
        netSavings,
        categoryBreakdown,
        monthlyTrends
      }
    });
  } catch (err) {
    console.error('Lỗi getFinanceAnalytics:', err);
    return res.status(500).json({ success: false, message: 'Lỗi phân tích tài chính.' });
  }
}

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getBudgets,
  setBudget,
  deleteBudget,
  getFinanceAnalytics
};
