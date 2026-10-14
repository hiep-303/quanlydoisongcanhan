const { queryAll, queryOne, execute } = require('../config/db');

// Calculate consecutive streak ending today or yesterday
function calculateStreak(habitId, userId) {
  const logs = queryAll(`
    SELECT log_date FROM habit_logs 
    WHERE habit_id = ? AND user_id = ? AND completed = 1
    ORDER BY log_date DESC
  `, [habitId, userId]);

  if (!logs || logs.length === 0) return 0;

  const dates = new Set(logs.map(l => l.log_date));
  let streak = 0;
  let curr = new Date();

  // If not completed today, check if completed yesterday
  const todayStr = curr.toISOString().split('T')[0];
  if (!dates.has(todayStr)) {
    curr.setDate(curr.getDate() - 1);
  }

  while (true) {
    const dStr = curr.toISOString().split('T')[0];
    if (dates.has(dStr)) {
      streak++;
      curr.setDate(curr.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function getHabits(req, res) {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const habits = queryAll('SELECT * FROM habits WHERE user_id = ? ORDER BY created_at ASC', [userId]);

    // Fetch today's completion and last 7 days history for each habit
    const result = habits.map(h => {
      const todayLog = queryOne(`
        SELECT completed FROM habit_logs 
        WHERE habit_id = ? AND user_id = ? AND log_date = ?
      `, [h.id, userId, today]);

      // Last 7 days logs
      const pastLogs = queryAll(`
        SELECT log_date, completed FROM habit_logs
        WHERE habit_id = ? AND user_id = ? AND log_date >= date('now', '-6 days')
        ORDER BY log_date ASC
      `, [h.id, userId]);

      return {
        ...h,
        target_days: JSON.parse(h.target_days || '[]'),
        completed_today: todayLog ? !!todayLog.completed : false,
        past_logs: pastLogs
      };
    });

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Lỗi getHabits:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách thói quen.' });
  }
}

function createHabit(req, res) {
  try {
    const userId = req.user.id;
    const { title, description, frequency = 'daily', target_days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], reminder_time, color = '#10b981' } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Tên thói quen không được để trống.' });
    }

    const habitId = 'hab_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    execute(`
      INSERT INTO habits (id, user_id, title, description, frequency, target_days, reminder_time, streak, best_streak, color, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?)
    `, [habitId, userId, title.trim(), description || '', frequency, JSON.stringify(target_days), reminder_time || null, color, now, now]);

    const created = queryOne('SELECT * FROM habits WHERE id = ?', [habitId]);
    created.target_days = JSON.parse(created.target_days || '[]');
    created.completed_today = false;
    created.past_logs = [];

    return res.status(201).json({ success: true, message: 'Tạo thói quen thành công!', data: created });
  } catch (err) {
    console.error('Lỗi createHabit:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tạo thói quen.' });
  }
}

function updateHabit(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const existing = queryOne('SELECT * FROM habits WHERE id = ? AND user_id = ?', [id, userId]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thói quen.' });
    }

    const { title, description, frequency, target_days, reminder_time, color } = req.body;
    const now = new Date().toISOString();

    execute(`
      UPDATE habits SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        frequency = COALESCE(?, frequency),
        target_days = COALESCE(?, target_days),
        reminder_time = COALESCE(?, reminder_time),
        color = COALESCE(?, color),
        updated_at = ?
      WHERE id = ? AND user_id = ?
    `, [
      title ? title.trim() : null,
      description !== undefined ? description : null,
      frequency || null,
      target_days ? JSON.stringify(target_days) : null,
      reminder_time !== undefined ? reminder_time : null,
      color || null,
      now,
      id,
      userId
    ]);

    const updated = queryOne('SELECT * FROM habits WHERE id = ?', [id]);
    updated.target_days = JSON.parse(updated.target_days || '[]');
    return res.json({ success: true, message: 'Cập nhật thói quen thành công!', data: updated });
  } catch (err) {
    console.error('Lỗi updateHabit:', err);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật thói quen.' });
  }
}

function toggleHabitLog(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { date } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const habit = queryOne('SELECT * FROM habits WHERE id = ? AND user_id = ?', [id, userId]);
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thói quen.' });
    }

    const existingLog = queryOne(`
      SELECT * FROM habit_logs WHERE habit_id = ? AND user_id = ? AND log_date = ?
    `, [id, userId, targetDate]);

    let isCompleted = true;
    const now = new Date().toISOString();

    if (existingLog) {
      if (existingLog.completed === 1) {
        // Toggle to uncompleted
        execute('UPDATE habit_logs SET completed = 0 WHERE id = ?', [existingLog.id]);
        isCompleted = false;
      } else {
        // Toggle back to completed
        execute('UPDATE habit_logs SET completed = 1 WHERE id = ?', [existingLog.id]);
        isCompleted = true;
      }
    } else {
      const logId = 'hlog_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      execute(`
        INSERT INTO habit_logs (id, habit_id, user_id, log_date, completed, created_at)
        VALUES (?, ?, ?, ?, 1, ?)
      `, [logId, id, userId, targetDate, now]);
      isCompleted = true;
    }

    // Recalculate streak
    const newStreak = calculateStreak(id, userId);
    const bestStreak = Math.max(habit.best_streak || 0, newStreak);

    execute(`
      UPDATE habits SET streak = ?, best_streak = ?, updated_at = ? WHERE id = ?
    `, [newStreak, bestStreak, now, id]);

    return res.json({
      success: true,
      message: isCompleted ? 'Đã ghi nhận hoàn thành thói quen!' : 'Đã hủy đánh dấu hoàn thành.',
      data: {
        completed: isCompleted,
        streak: newStreak,
        best_streak: bestStreak
      }
    });
  } catch (err) {
    console.error('Lỗi toggleHabitLog:', err);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật nhật ký thói quen.' });
  }
}

function deleteHabit(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const existing = queryOne('SELECT id FROM habits WHERE id = ? AND user_id = ?', [id, userId]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thói quen.' });
    }

    execute('DELETE FROM habits WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ success: true, message: 'Đã xóa thói quen thành công.' });
  } catch (err) {
    console.error('Lỗi deleteHabit:', err);
    return res.status(500).json({ success: false, message: 'Lỗi xóa thói quen.' });
  }
}

module.exports = {
  getHabits,
  createHabit,
  updateHabit,
  toggleHabitLog,
  deleteHabit
};
