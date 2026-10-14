const { queryAll, queryOne, execute } = require('../config/db');

function getTasks(req, res) {
  try {
    const userId = req.user.id;
    const { status, priority, category, search, sortBy = 'due_date', order = 'ASC' } = req.query;

    let sql = 'SELECT * FROM tasks WHERE user_id = ?';
    const params = [userId];

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (priority && priority !== 'all') {
      sql += ' AND priority = ?';
      params.push(priority);
    }

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const validSortFields = ['due_date', 'priority', 'created_at', 'title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    sql += ` ORDER BY ${sortField} ${sortOrder}, created_at DESC`;

    const tasks = queryAll(sql, params);
    return res.json({ success: true, data: tasks });
  } catch (err) {
    console.error('Lỗi getTasks:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách công việc.' });
  }
}

function getTaskStats(req, res) {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const total = queryOne('SELECT COUNT(*) as count FROM tasks WHERE user_id = ?', [userId]).count;
    const completed = queryOne('SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = ?', [userId, 'completed']).count;
    const inProgress = queryOne('SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = ?', [userId, 'in_progress']).count;
    const todo = queryOne('SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = ?', [userId, 'todo']).count;
    
    // Overdue tasks
    const overdue = queryOne(`
      SELECT COUNT(*) as count FROM tasks 
      WHERE user_id = ? AND status != 'completed' AND status != 'cancelled' AND due_date IS NOT NULL AND due_date < ?
    `, [userId, today]).count;

    // Due today
    const dueToday = queryOne(`
      SELECT COUNT(*) as count FROM tasks 
      WHERE user_id = ? AND due_date = ? AND status != 'completed'
    `, [userId, today]).count;

    return res.json({
      success: true,
      data: {
        total,
        completed,
        inProgress,
        todo,
        overdue,
        dueToday,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      }
    });
  } catch (err) {
    console.error('Lỗi getTaskStats:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tải thống kê công việc.' });
  }
}

function createTask(req, res) {
  try {
    const userId = req.user.id;
    const { title, description, due_date, priority = 'medium', status = 'todo', category = 'Chung' } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Tiêu đề công việc không được để trống.' });
    }

    const taskId = 'tsk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    execute(`
      INSERT INTO tasks (id, user_id, title, description, due_date, priority, status, category, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [taskId, userId, title.trim(), description || '', due_date || null, priority, status, category, now, now]);

    const created = queryOne('SELECT * FROM tasks WHERE id = ?', [taskId]);
    return res.status(201).json({ success: true, message: 'Tạo công việc thành công!', data: created });
  } catch (err) {
    console.error('Lỗi createTask:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tạo công việc.' });
  }
}

function updateTask(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const task = queryOne('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy công việc.' });
    }

    const { title, description, due_date, priority, status, category } = req.body;
    const now = new Date().toISOString();
    const completedAt = status === 'completed' ? (task.completed_at || now) : null;

    execute(`
      UPDATE tasks SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        due_date = COALESCE(?, due_date),
        priority = COALESCE(?, priority),
        status = COALESCE(?, status),
        category = COALESCE(?, category),
        completed_at = ?,
        updated_at = ?
      WHERE id = ? AND user_id = ?
    `, [
      title ? title.trim() : null,
      description !== undefined ? description : null,
      due_date !== undefined ? due_date : null,
      priority || null,
      status || null,
      category || null,
      completedAt,
      now,
      id,
      userId
    ]);

    const updated = queryOne('SELECT * FROM tasks WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Cập nhật công việc thành công!', data: updated });
  } catch (err) {
    console.error('Lỗi updateTask:', err);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật công việc.' });
  }
}

function toggleTaskStatus(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const task = queryOne('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy công việc.' });
    }

    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    const now = new Date().toISOString();
    const completedAt = newStatus === 'completed' ? now : null;

    execute(`
      UPDATE tasks SET status = ?, completed_at = ?, updated_at = ? WHERE id = ? AND user_id = ?
    `, [newStatus, completedAt, now, id, userId]);

    const updated = queryOne('SELECT * FROM tasks WHERE id = ?', [id]);
    return res.json({
      success: true,
      message: newStatus === 'completed' ? 'Đã hoàn thành công việc!' : 'Đã mở lại công việc!',
      data: updated
    });
  } catch (err) {
    console.error('Lỗi toggleTaskStatus:', err);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái.' });
  }
}

function deleteTask(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const task = queryOne('SELECT id FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy công việc.' });
    }

    execute('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ success: true, message: 'Đã xóa công việc thành công.' });
  } catch (err) {
    console.error('Lỗi deleteTask:', err);
    return res.status(500).json({ success: false, message: 'Lỗi xóa công việc.' });
  }
}

module.exports = {
  getTasks,
  getTaskStats,
  createTask,
  updateTask,
  toggleTaskStatus,
  deleteTask
};
