const { verifyToken } = require('../config/jwt');
const { queryOne } = require('../config/db');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để tiếp tục.' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) {
    return res.status(401).json({ success: false, message: 'Phiên đăng nhập hết hạn hoặc không hợp lệ.' });
  }

  const user = queryOne('SELECT id, name, email, role, avatar_url, bio, phone, timezone, language, theme, notification_prefs, is_locked FROM users WHERE id = ?', [decoded.id]);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại.' });
  }

  if (user.is_locked) {
    return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' });
  }

  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền quản trị để truy cập chức năng này.' });
    }
    next();
  });
}

module.exports = {
  requireAuth,
  requireAdmin
};
