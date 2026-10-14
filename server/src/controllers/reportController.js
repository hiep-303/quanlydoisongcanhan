const { queryAll, queryOne } = require('../config/db');

function getSummaryStats(req, res) {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);

    // 1. Tasks Stats
    const totalTasks = queryOne('SELECT COUNT(*) as c FROM tasks WHERE user_id = ?', [userId]).c;
    const completedTasks = queryOne('SELECT COUNT(*) as c FROM tasks WHERE user_id = ? AND status = "completed"', [userId]).c;
    const pendingTasks = queryOne('SELECT COUNT(*) as c FROM tasks WHERE user_id = ? AND status IN ("todo", "in_progress")', [userId]).c;
    const overdueTasks = queryOne('SELECT COUNT(*) as c FROM tasks WHERE user_id = ? AND status != "completed" AND due_date < ?', [userId, today]).c;

    const tasksByPriority = queryAll(`
      SELECT priority, COUNT(*) as count FROM tasks WHERE user_id = ? GROUP BY priority
    `, [userId]);

    const tasksByCategory = queryAll(`
      SELECT category, COUNT(*) as count FROM tasks WHERE user_id = ? GROUP BY category
    `, [userId]);

    // 2. Goals Stats
    const totalGoals = queryOne('SELECT COUNT(*) as c FROM goals WHERE user_id = ?', [userId]).c;
    const completedGoals = queryOne('SELECT COUNT(*) as c FROM goals WHERE user_id = ? AND status = "completed"', [userId]).c;
    const activeGoals = queryOne('SELECT COUNT(*) as c FROM goals WHERE user_id = ? AND status = "in_progress"', [userId]).c;
    const avgGoalProgress = queryOne('SELECT AVG(progress) as avg FROM goals WHERE user_id = ?', [userId]).avg || 0;

    // 3. Habits Stats
    const totalHabits = queryOne('SELECT COUNT(*) as c FROM habits WHERE user_id = ?', [userId]).c;
    const maxStreak = queryOne('SELECT MAX(best_streak) as max FROM habits WHERE user_id = ?', [userId]).max || 0;
    const totalCompletions = queryOne('SELECT COUNT(*) as c FROM habit_logs WHERE user_id = ? AND completed = 1', [userId]).c;

    // 4. Finance Stats (Current month)
    const monthIncome = queryOne(`
      SELECT SUM(amount) as s FROM transactions WHERE user_id = ? AND type = 'income' AND substr(date, 1, 7) = ?
    `, [userId, currentMonth]).s || 0;

    const monthExpense = queryOne(`
      SELECT SUM(amount) as s FROM transactions WHERE user_id = ? AND type = 'expense' AND substr(date, 1, 7) = ?
    `, [userId, currentMonth]).s || 0;

    // 6-month financial history
    const monthlyFinance = queryAll(`
      SELECT 
        substr(date, 1, 7) as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE user_id = ? AND date >= date('now', '-6 months')
      GROUP BY substr(date, 1, 7)
      ORDER BY month ASC
    `, [userId]);

    // Expense categories
    const expenseCategories = queryAll(`
      SELECT category, SUM(amount) as total FROM transactions
      WHERE user_id = ? AND type = 'expense' AND substr(date, 1, 7) = ?
      GROUP BY category
      ORDER BY total DESC
    `, [userId, currentMonth]);

    return res.json({
      success: true,
      data: {
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          overdue: overdueTasks,
          rate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          byPriority: tasksByPriority,
          byCategory: tasksByCategory
        },
        goals: {
          total: totalGoals,
          completed: completedGoals,
          active: activeGoals,
          avgProgress: Math.round(avgGoalProgress)
        },
        habits: {
          total: totalHabits,
          maxStreak,
          totalCompletions
        },
        finance: {
          month: currentMonth,
          income: monthIncome,
          expense: monthExpense,
          net: monthIncome - monthExpense,
          monthlyHistory: monthlyFinance,
          categoryBreakdown: expenseCategories
        }
      }
    });
  } catch (err) {
    console.error('Lỗi getSummaryStats:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tạo báo cáo thống kê.' });
  }
}

function exportCsvReport(req, res) {
  try {
    const userId = req.user.id;
    const { type = 'transactions' } = req.query;

    let csvContent = '';
    let fileName = '';

    if (type === 'tasks') {
      const tasks = queryAll('SELECT title, category, priority, status, due_date, created_at FROM tasks WHERE user_id = ?', [userId]);
      fileName = `tasks_report_${Date.now()}.csv`;
      csvContent = 'Tiêu đề,Danh mục,Mức ưu tiên,Trạng thái,Hạn hoàn thành,Ngày tạo\n';
      tasks.forEach(t => {
        csvContent += `"${(t.title || '').replace(/"/g, '""')}","${t.category}","${t.priority}","${t.status}","${t.due_date || ''}","${t.created_at}"\n`;
      });
    } else if (type === 'habits') {
      const habits = queryAll('SELECT title, frequency, streak, best_streak, created_at FROM habits WHERE user_id = ?', [userId]);
      fileName = `habits_report_${Date.now()}.csv`;
      csvContent = 'Tên thói quen,Tần suất,Chuỗi hiện tại,Kỷ lục chuỗi,Ngày tạo\n';
      habits.forEach(h => {
        csvContent += `"${(h.title || '').replace(/"/g, '""')}","${h.frequency}",${h.streak},${h.best_streak},"${h.created_at}"\n`;
      });
    } else {
      // Default: transactions
      const txs = queryAll('SELECT type, amount, category, date, payment_method, notes FROM transactions WHERE user_id = ? ORDER BY date DESC', [userId]);
      fileName = `finance_transactions_${Date.now()}.csv`;
      csvContent = 'Loại,Số tiền (VND),Danh mục,Ngày,Phương thức,Ghi chú\n';
      txs.forEach(t => {
        const typeStr = t.type === 'income' ? 'Thu nhập' : 'Chi tiêu';
        csvContent += `"${typeStr}",${t.amount},"${t.category}","${t.date}","${t.payment_method}","${(t.notes || '').replace(/"/g, '""')}"\n`;
      });
    }

    // Set utf-8 BOM for proper excel reading in Vietnamese
    const bom = '\uFEFF';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.send(bom + csvContent);
  } catch (err) {
    console.error('Lỗi exportCsvReport:', err);
    return res.status(500).json({ success: false, message: 'Lỗi xuất báo cáo CSV.' });
  }
}

module.exports = {
  getSummaryStats,
  exportCsvReport
};
