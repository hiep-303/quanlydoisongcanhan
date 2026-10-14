const { queryAll, queryOne, execute } = require('../config/db');

function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const { is_read, limit = 50 } = req.query;

    let sql = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [userId];

    if (is_read !== undefined && is_read !== 'all') {
      sql += ' AND is_read = ?';
      params.push(is_read === 'true' || is_read === '1' ? 1 : 0);
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const notifications = queryAll(sql, params);
    const unreadCount = queryOne('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0', [userId]).count;

    return res.json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (err) {
    console.error('Lỗi getNotifications:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách thông báo.' });
  }
}

function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    execute('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ success: true, message: 'Đã đánh dấu đã đọc.' });
  } catch (err) {
    console.error('Lỗi markAsRead:', err);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật thông báo.' });
  }
}

function markAllAsRead(req, res) {
  try {
    const userId = req.user.id;
    execute('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
    return res.json({ success: true, message: 'Đã đánh dấu tất cả thông báo là đã đọc.' });
  } catch (err) {
    console.error('Lỗi markAllAsRead:', err);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật thông báo.' });
  }
}

function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    execute('DELETE FROM notifications WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ success: true, message: 'Đã xóa thông báo.' });
  } catch (err) {
    console.error('Lỗi deleteNotification:', err);
    return res.status(500).json({ success: false, message: 'Lỗi xóa thông báo.' });
  }
}

function clearReadNotifications(req, res) {
  try {
    const userId = req.user.id;
    execute('DELETE FROM notifications WHERE user_id = ? AND is_read = 1', [userId]);
    return res.json({ success: true, message: 'Đã dọn dẹp các thông báo đã đọc.' });
  } catch (err) {
    console.error('Lỗi clearReadNotifications:', err);
    return res.status(500).json({ success: false, message: 'Lỗi xóa thông báo.' });
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications
};
