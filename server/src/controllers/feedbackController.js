const { queryAll, queryOne, execute } = require('../config/db');

function submitFeedback(req, res) {
  try {
    const { name, email, subject, message } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền email, chủ đề và nội dung phản hồi.' });
    }

    const feedbackId = 'fb_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    execute(`
      INSERT INTO feedback (id, user_id, name, email, subject, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'new', ?)
    `, [feedbackId, userId, name || '', email.trim(), subject.trim(), message.trim(), now]);

    return res.status(201).json({
      success: true,
      message: 'Cảm ơn bạn! Phản hồi của bạn đã được gửi tới đội ngũ phát triển LifeHub.'
    });
  } catch (err) {
    console.error('Lỗi submitFeedback:', err);
    return res.status(500).json({ success: false, message: 'Lỗi gửi phản hồi.' });
  }
}

function listFeedback(req, res) {
  try {
    const list = queryAll('SELECT * FROM feedback ORDER BY created_at DESC LIMIT 50');
    return res.json({ success: true, data: list });
  } catch (err) {
    console.error('Lỗi listFeedback:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách phản hồi.' });
  }
}

module.exports = {
  submitFeedback,
  listFeedback
};
