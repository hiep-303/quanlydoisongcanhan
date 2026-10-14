const bcrypt = require('bcryptjs');
const { queryOne, queryAll, execute } = require('../config/db');

function getProfile(req, res) {
  const user = queryOne(`
    SELECT id, name, email, role, avatar_url, bio, phone, timezone, language, theme, notification_prefs, created_at, updated_at
    FROM users WHERE id = ?
  `, [req.user.id]);

  if (!user) {
    return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
  }

  user.notification_prefs = JSON.parse(user.notification_prefs || '{}');
  return res.json({ success: true, data: user });
}

function updateProfile(req, res) {
  try {
    const { name, bio, phone, avatar_url, timezone, language, theme, notification_prefs } = req.body;
    const now = new Date().toISOString();

    const notifStr = notification_prefs ? JSON.stringify(notification_prefs) : undefined;

    execute(`
      UPDATE users SET
        name = COALESCE(?, name),
        bio = COALESCE(?, bio),
        phone = COALESCE(?, phone),
        avatar_url = COALESCE(?, avatar_url),
        timezone = COALESCE(?, timezone),
        language = COALESCE(?, language),
        theme = COALESCE(?, theme),
        notification_prefs = COALESCE(?, notification_prefs),
        updated_at = ?
      WHERE id = ?
    `, [
      name ? name.trim() : null,
      bio !== undefined ? bio : null,
      phone !== undefined ? phone : null,
      avatar_url !== undefined ? avatar_url : null,
      timezone || null,
      language || null,
      theme || null,
      notifStr || null,
      now,
      req.user.id
    ]);

    const updated = queryOne(`
      SELECT id, name, email, role, avatar_url, bio, phone, timezone, language, theme, notification_prefs, updated_at
      FROM users WHERE id = ?
    `, [req.user.id]);

    updated.notification_prefs = JSON.parse(updated.notification_prefs || '{}');

    return res.json({
      success: true,
      message: 'Cập nhật thông tin hồ sơ thành công!',
      data: updated
    });
  } catch (err) {
    console.error('Lỗi updateProfile:', err);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật hồ sơ.' });
  }
}

function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
  }

  const user = queryOne('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
  const match = bcrypt.compareSync(currentPassword, user.password_hash);
  if (!match) {
    return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác.' });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  execute('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?', [newHash, new Date().toISOString(), req.user.id]);

  return res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
}

function exportData(req, res) {
  try {
    const userId = req.user.id;
    const tasks = queryAll('SELECT * FROM tasks WHERE user_id = ?', [userId]);
    const events = queryAll('SELECT * FROM events WHERE user_id = ?', [userId]);
    const goals = queryAll('SELECT * FROM goals WHERE user_id = ?', [userId]);
    const habits = queryAll('SELECT * FROM habits WHERE user_id = ?', [userId]);
    const habitLogs = queryAll('SELECT * FROM habit_logs WHERE user_id = ?', [userId]);
    const transactions = queryAll('SELECT * FROM transactions WHERE user_id = ?', [userId]);
    const budgets = queryAll('SELECT * FROM budgets WHERE user_id = ?', [userId]);
    const notes = queryAll('SELECT * FROM notes WHERE user_id = ?', [userId]);

    const exportBundle = {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        exported_at: new Date().toISOString()
      },
      tasks,
      events,
      goals,
      habits,
      habitLogs,
      transactions,
      budgets,
      notes
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="lifehub_export_${Date.now()}.json"`);
    return res.json(exportBundle);
  } catch (err) {
    console.error('Lỗi exportData:', err);
    return res.status(500).json({ success: false, message: 'Lỗi xuất dữ liệu.' });
  }
}

function deleteAccount(req, res) {
  try {
    const userId = req.user.id;
    // Delete cascading user data
    execute('DELETE FROM users WHERE id = ?', [userId]);

    return res.json({
      success: true,
      message: 'Tài khoản và toàn bộ dữ liệu cá nhân liên quan đã được xóa vĩnh viễn theo chính sách quyền riêng tư.'
    });
  } catch (err) {
    console.error('Lỗi deleteAccount:', err);
    return res.status(500).json({ success: false, message: 'Không thể xóa tài khoản lúc này.' });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  exportData,
  deleteAccount
};
