const { queryAll, queryOne, execute } = require('../config/db');

function getNotes(req, res) {
  try {
    const userId = req.user.id;
    const { search, tag, is_pinned } = req.query;

    let sql = 'SELECT * FROM notes WHERE user_id = ?';
    const params = [userId];

    if (is_pinned !== undefined && is_pinned !== 'all') {
      sql += ' AND is_pinned = ?';
      params.push(is_pinned === 'true' || is_pinned === '1' ? 1 : 0);
    }

    if (search) {
      sql += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY is_pinned DESC, updated_at DESC';

    let notes = queryAll(sql, params).map(n => ({
      ...n,
      tags: JSON.parse(n.tags || '[]')
    }));

    if (tag) {
      notes = notes.filter(n => n.tags.includes(tag));
    }

    return res.json({ success: true, data: notes });
  } catch (err) {
    console.error('Lỗi getNotes:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách ghi chú.' });
  }
}

function createNote(req, res) {
  try {
    const userId = req.user.id;
    const { title, content, is_pinned = 0, tags = [], color = '#ffffff' } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Tiêu đề ghi chú không được để trống.' });
    }

    const noteId = 'not_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    execute(`
      INSERT INTO notes (id, user_id, title, content, is_pinned, tags, color, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [noteId, userId, title.trim(), content || '', is_pinned ? 1 : 0, JSON.stringify(tags), color, now, now]);

    const created = queryOne('SELECT * FROM notes WHERE id = ?', [noteId]);
    created.tags = JSON.parse(created.tags || '[]');

    return res.status(201).json({ success: true, message: 'Tạo ghi chú thành công!', data: created });
  } catch (err) {
    console.error('Lỗi createNote:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tạo ghi chú.' });
  }
}

function updateNote(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const existing = queryOne('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, userId]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ghi chú.' });
    }

    const { title, content, is_pinned, tags, color } = req.body;
    const now = new Date().toISOString();

    execute(`
      UPDATE notes SET
        title = COALESCE(?, title),
        content = COALESCE(?, content),
        is_pinned = COALESCE(?, is_pinned),
        tags = COALESCE(?, tags),
        color = COALESCE(?, color),
        updated_at = ?
      WHERE id = ? AND user_id = ?
    `, [
      title ? title.trim() : null,
      content !== undefined ? content : null,
      is_pinned !== undefined ? (is_pinned ? 1 : 0) : null,
      tags ? JSON.stringify(tags) : null,
      color || null,
      now,
      id,
      userId
    ]);

    const updated = queryOne('SELECT * FROM notes WHERE id = ?', [id]);
    updated.tags = JSON.parse(updated.tags || '[]');
    return res.json({ success: true, message: 'Cập nhật ghi chú thành công!', data: updated });
  } catch (err) {
    console.error('Lỗi updateNote:', err);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật ghi chú.' });
  }
}

function togglePinNote(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const existing = queryOne('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, userId]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ghi chú.' });
    }

    const newPinned = existing.is_pinned ? 0 : 1;
    const now = new Date().toISOString();

    execute('UPDATE notes SET is_pinned = ?, updated_at = ? WHERE id = ? AND user_id = ?', [newPinned, now, id, userId]);
    return res.json({
      success: true,
      message: newPinned ? 'Đã ghim ghi chú lên đầu!' : 'Đã bỏ ghim ghi chú.',
      data: { is_pinned: newPinned }
    });
  } catch (err) {
    console.error('Lỗi togglePinNote:', err);
    return res.status(500).json({ success: false, message: 'Lỗi ghim ghi chú.' });
  }
}

function deleteNote(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const existing = queryOne('SELECT id FROM notes WHERE id = ? AND user_id = ?', [id, userId]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ghi chú.' });
    }

    execute('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ success: true, message: 'Đã xóa ghi chú thành công.' });
  } catch (err) {
    console.error('Lỗi deleteNote:', err);
    return res.status(500).json({ success: false, message: 'Lỗi xóa ghi chú.' });
  }
}

module.exports = {
  getNotes,
  createNote,
  updateNote,
  togglePinNote,
  deleteNote
};
