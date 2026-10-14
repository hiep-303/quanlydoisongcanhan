const { queryAll, queryOne, execute } = require('../config/db');

function getGoals(req, res) {
  try {
    const userId = req.user.id;
    const { status, category, search } = req.query;

    let sql = 'SELECT * FROM goals WHERE user_id = ?';
    const params = [userId];

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      sql += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY created_at DESC';

    const goals = queryAll(sql, params).map(g => ({
      ...g,
      milestones: JSON.parse(g.milestones || '[]')
    }));

    return res.json({ success: true, data: goals });
  } catch (err) {
    console.error('Lỗi getGoals:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách mục tiêu.' });
  }
}

function createGoal(req, res) {
  try {
    const userId = req.user.id;
    const { title, description, category = 'Phát triển cá nhân', start_date, target_date, milestones = [] } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Tên mục tiêu không được để trống.' });
    }

    const goalId = 'gol_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    // Ensure milestone ids
    const formattedMilestones = milestones.map((m, idx) => ({
      id: m.id || `m_${idx}_${Date.now()}`,
      title: m.title || '',
      completed: !!m.completed
    }));

    // Calculate progress based on milestones if provided
    let progress = 0;
    if (formattedMilestones.length > 0) {
      const completedCount = formattedMilestones.filter(m => m.completed).length;
      progress = Math.round((completedCount / formattedMilestones.length) * 100);
    }

    execute(`
      INSERT INTO goals (id, user_id, title, description, category, start_date, target_date, status, progress, milestones, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'in_progress', ?, ?, ?, ?)
    `, [goalId, userId, title.trim(), description || '', category, start_date || null, target_date || null, progress, JSON.stringify(formattedMilestones), now, now]);

    const created = queryOne('SELECT * FROM goals WHERE id = ?', [goalId]);
    created.milestones = JSON.parse(created.milestones || '[]');

    return res.status(201).json({ success: true, message: 'Tạo mục tiêu thành công!', data: created });
  } catch (err) {
    console.error('Lỗi createGoal:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tạo mục tiêu.' });
  }
}

function updateGoal(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const existing = queryOne('SELECT * FROM goals WHERE id = ? AND user_id = ?', [id, userId]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mục tiêu.' });
    }

    const { title, description, category, start_date, target_date, status, progress, milestones } = req.body;
    const now = new Date().toISOString();

    let milestoneStr = undefined;
    let finalProgress = progress;

    if (milestones !== undefined) {
      milestoneStr = JSON.stringify(milestones);
      if (progress === undefined && milestones.length > 0) {
        const completedCount = milestones.filter(m => m.completed).length;
        finalProgress = Math.round((completedCount / milestones.length) * 100);
      }
    }

    execute(`
      UPDATE goals SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        start_date = COALESCE(?, start_date),
        target_date = COALESCE(?, target_date),
        status = COALESCE(?, status),
        progress = COALESCE(?, progress),
        milestones = COALESCE(?, milestones),
        updated_at = ?
      WHERE id = ? AND user_id = ?
    `, [
      title ? title.trim() : null,
      description !== undefined ? description : null,
      category || null,
      start_date !== undefined ? start_date : null,
      target_date !== undefined ? target_date : null,
      status || null,
      finalProgress !== undefined ? finalProgress : null,
      milestoneStr || null,
      now,
      id,
      userId
    ]);

    const updated = queryOne('SELECT * FROM goals WHERE id = ?', [id]);
    updated.milestones = JSON.parse(updated.milestones || '[]');

    return res.json({ success: true, message: 'Cập nhật mục tiêu thành công!', data: updated });
  } catch (err) {
    console.error('Lỗi updateGoal:', err);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật mục tiêu.' });
  }
}

function toggleMilestone(req, res) {
  try {
    const { id, milestoneId } = req.params;
    const userId = req.user.id;
    const goal = queryOne('SELECT * FROM goals WHERE id = ? AND user_id = ?', [id, userId]);

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mục tiêu.' });
    }

    const milestones = JSON.parse(goal.milestones || '[]');
    const target = milestones.find(m => m.id === milestoneId);
    if (!target) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bước này.' });
    }

    target.completed = !target.completed;
    const completedCount = milestones.filter(m => m.completed).length;
    const progress = Math.round((completedCount / milestones.length) * 100);
    const status = progress === 100 ? 'completed' : 'in_progress';
    const now = new Date().toISOString();

    execute(`
      UPDATE goals SET milestones = ?, progress = ?, status = ?, updated_at = ? WHERE id = ? AND user_id = ?
    `, [JSON.stringify(milestones), progress, status, now, id, userId]);

    const updated = queryOne('SELECT * FROM goals WHERE id = ?', [id]);
    updated.milestones = milestones;

    return res.json({ success: true, message: 'Cập nhật tiến độ thành công!', data: updated });
  } catch (err) {
    console.error('Lỗi toggleMilestone:', err);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật mốc mục tiêu.' });
  }
}

function deleteGoal(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const existing = queryOne('SELECT id FROM goals WHERE id = ? AND user_id = ?', [id, userId]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mục tiêu.' });
    }

    execute('DELETE FROM goals WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ success: true, message: 'Đã xóa mục tiêu thành công.' });
  } catch (err) {
    console.error('Lỗi deleteGoal:', err);
    return res.status(500).json({ success: false, message: 'Lỗi xóa mục tiêu.' });
  }
}

function suggestMilestones(req, res) {
  const { title, category } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp tên mục tiêu.' });
  }

  // Smart suggestions tailored to goal title/category
  const suggestions = [
    { title: `Nghiên cứu yêu cầu và lộ trình cho: ${title}`, completed: false },
    { title: `Thiết lập thói quen thực hành 30-45 phút mỗi ngày`, completed: false },
    { title: `Hoàn thành 50% khối lượng công việc / bài tập trọng tâm`, completed: false },
    { title: `Đánh giá sơ bộ tiến độ và khắc phục điểm yếu`, completed: false },
    { title: `Tổng kết kết quả và nghiệm thu mục tiêu hoàn thành`, completed: false }
  ];

  return res.json({
    success: true,
    data: suggestions
  });
}

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  toggleMilestone,
  deleteGoal,
  suggestMilestones
};
