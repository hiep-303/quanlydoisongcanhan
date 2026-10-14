const { queryAll, queryOne, execute } = require('../config/db');

function getOverviewStats(req, res) {
  try {
    const totalUsers = queryOne('SELECT COUNT(*) as count FROM users').count;
    const activeUsers = queryOne('SELECT COUNT(*) as count FROM users WHERE is_locked = 0').count;
    const lockedUsers = queryOne('SELECT COUNT(*) as count FROM users WHERE is_locked = 1').count;

    const totalTasks = queryOne('SELECT COUNT(*) as count FROM tasks').count;
    const totalHabits = queryOne('SELECT COUNT(*) as count FROM habits').count;
    const totalTransactions = queryOne('SELECT COUNT(*) as count FROM transactions').count;
    const totalGoals = queryOne('SELECT COUNT(*) as count FROM goals').count;

    // Recent audit logs
    const recentAuditLogs = queryAll('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10');

    // Recent user registrations
    const recentUsers = queryAll(`
      SELECT id, name, email, role, is_locked, created_at 
      FROM users ORDER BY created_at DESC LIMIT 5
    `);

    return res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        lockedUsers,
        totalTasks,
        totalHabits,
        totalTransactions,
        totalGoals,
        recentAuditLogs,
        recentUsers
      }
    });
  } catch (err) {
    console.error('Lỗi admin getOverviewStats:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tải thống kê quản trị.' });
  }
}

function getUsers(req, res) {
  try {
    const { search, role, status } = req.query;

    let sql = 'SELECT id, name, email, role, avatar_url, timezone, language, is_locked, created_at, updated_at FROM users WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role && role !== 'all') {
      sql += ' AND role = ?';
      params.push(role);
    }

    if (status && status !== 'all') {
      sql += ' AND is_locked = ?';
      params.push(status === 'locked' ? 1 : 0);
    }

    sql += ' ORDER BY created_at DESC';

    const users = queryAll(sql, params);
    return res.json({ success: true, data: users });
  } catch (err) {
    console.error('Lỗi admin getUsers:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách người dùng.' });
  }
}

function toggleLockUser(req, res) {
  try {
    const { id } = req.params;
    const targetUser = queryOne('SELECT id, name, email, is_locked, role FROM users WHERE id = ?', [id]);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    // Do not allow locking self
    if (targetUser.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Không thể tự khóa tài khoản của chính mình.' });
    }

    const newLockState = targetUser.is_locked ? 0 : 1;
    const now = new Date().toISOString();

    execute('UPDATE users SET is_locked = ?, updated_at = ? WHERE id = ?', [newLockState, now, id]);

    // Record audit log
    const action = newLockState === 1 ? 'LOCK_USER' : 'UNLOCK_USER';
    const details = `Quản trị viên ${req.user.email} đã ${newLockState === 1 ? 'khóa' : 'mở khóa'} tài khoản ${targetUser.email} (${targetUser.name}).`;
    
    execute(`
      INSERT INTO audit_logs (id, actor_id, actor_email, action, target_type, target_id, details, created_at)
      VALUES (?, ?, ?, ?, 'user', ?, ?, ?)
    `, ['log_' + Date.now(), req.user.id, req.user.email, action, id, details, now]);

    return res.json({
      success: true,
      message: newLockState === 1 ? 'Đã khóa tài khoản thành công.' : 'Đã mở khóa tài khoản thành công.',
      data: { is_locked: newLockState }
    });
  } catch (err) {
    console.error('Lỗi admin toggleLockUser:', err);
    return res.status(500).json({ success: false, message: 'Lỗi thay đổi trạng thái khóa tài khoản.' });
  }
}

function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Vai trò phải là user hoặc admin.' });
    }

    const targetUser = queryOne('SELECT id, name, email, role FROM users WHERE id = ?', [id]);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    if (targetUser.id === req.user.id && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Không thể tự hạ quyền quản trị của chính mình.' });
    }

    const now = new Date().toISOString();
    execute('UPDATE users SET role = ?, updated_at = ? WHERE id = ?', [role, now, id]);

    // Record audit log
    const details = `Quản trị viên ${req.user.email} đã thay đổi quyền của ${targetUser.email} từ ${targetUser.role} sang ${role}.`;
    execute(`
      INSERT INTO audit_logs (id, actor_id, actor_email, action, target_type, target_id, details, created_at)
      VALUES (?, ?, ?, 'CHANGE_ROLE', 'user', ?, ?, ?)
    `, ['log_' + Date.now(), req.user.id, req.user.email, id, details, now]);

    return res.json({
      success: true,
      message: `Đã cập nhật vai trò người dùng thành ${role}.`
    });
  } catch (err) {
    console.error('Lỗi admin updateUserRole:', err);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật vai trò người dùng.' });
  }
}

function getAuditLogs(req, res) {
  try {
    const logs = queryAll('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100');
    return res.json({ success: true, data: logs });
  } catch (err) {
    console.error('Lỗi admin getAuditLogs:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tải nhật ký kiểm toán.' });
  }
}

module.exports = {
  getOverviewStats,
  getUsers,
  toggleLockUser,
  updateUserRole,
  getAuditLogs
};
