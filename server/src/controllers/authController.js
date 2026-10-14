const bcrypt = require('bcryptjs');
const { queryOne, execute } = require('../config/db');
const { signToken } = require('../config/jwt');

function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Email không hợp lệ.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = queryOne('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email này đã được đăng ký trong hệ thống.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const now = new Date().toISOString();

    execute(`
      INSERT INTO users (id, name, email, password_hash, role, timezone, language, theme, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'user', 'Asia/Ho_Chi_Minh', 'vi', 'light', ?, ?)
    `, [userId, name.trim(), normalizedEmail, passwordHash, now, now]);

    // Create a welcome notification
    execute(`
      INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
      VALUES (?, ?, 'system', 'Chào mừng bạn đến với LifeHub!', 'Bắt đầu ngày mới bằng việc thêm công việc, thói quen và ngân sách đầu tiên của bạn.', '/dashboard', 0, ?)
    `, ['notif_' + Date.now(), userId, now]);

    const token = signToken({ id: userId, email: normalizedEmail, role: 'user' });

    const user = queryOne('SELECT id, name, email, role, avatar_url, bio, timezone, language, theme, created_at FROM users WHERE id = ?', [userId]);

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      data: { token, user }
    });
  } catch (err) {
    console.error('Lỗi register:', err);
    return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi máy chủ trong quá trình đăng ký.' });
  }
}

function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = queryOne('SELECT * FROM users WHERE email = ?', [normalizedEmail]);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
    }

    if (user.is_locked) {
      return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên.' });
    }

    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      bio: user.bio,
      phone: user.phone,
      timezone: user.timezone,
      language: user.language,
      theme: user.theme,
      notification_prefs: JSON.parse(user.notification_prefs || '{}'),
      created_at: user.created_at
    };

    return res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      data: { token, user: safeUser }
    });
  } catch (err) {
    console.error('Lỗi login:', err);
    return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi trong quá trình đăng nhập.' });
  }
}

function me(req, res) {
  return res.json({
    success: true,
    data: req.user
  });
}

function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email.' });
  }

  const user = queryOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
  if (!user) {
    // For privacy/security, we respond with success message anyway
    return res.json({
      success: true,
      message: 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến hòm thư của bạn.'
    });
  }

  // Generate a mock reset token for self-service or simulation
  return res.json({
    success: true,
    message: 'Hướng dẫn đặt lại mật khẩu đã được xử lý. Để thuận tiện trải nghiệm, bạn có thể nhập mật khẩu mới ngay bên dưới.'
  });
}

function resetPassword(req, res) {
  const { email, newPassword } = req.body;
  if (!email || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
  }

  const user = queryOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản với email này.' });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  execute('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?', [newHash, new Date().toISOString(), user.id]);

  return res.json({
    success: true,
    message: 'Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập bằng mật khẩu mới.'
  });
}

module.exports = {
  register,
  login,
  me,
  forgotPassword,
  resetPassword
};
