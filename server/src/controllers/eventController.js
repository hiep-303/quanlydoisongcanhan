const { queryAll, queryOne, execute } = require('../config/db');

function getEvents(req, res) {
  try {
    const userId = req.user.id;
    const { start, end, search } = req.query;

    let sql = 'SELECT * FROM events WHERE user_id = ?';
    const params = [userId];

    if (start) {
      sql += ' AND end_time >= ?';
      params.push(start);
    }
    if (end) {
      sql += ' AND start_time <= ?';
      params.push(end);
    }
    if (search) {
      sql += ' AND (title LIKE ? OR description LIKE ? OR location LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY start_time ASC';

    const events = queryAll(sql, params);
    return res.json({ success: true, data: events });
  } catch (err) {
    console.error('Lỗi getEvents:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tải lịch trình sự kiện.' });
  }
}

function getUpcomingEvents(req, res) {
  try {
    const userId = req.user.id;
    const now = new Date().toISOString();

    const events = queryAll(`
      SELECT * FROM events 
      WHERE user_id = ? AND end_time >= ?
      ORDER BY start_time ASC
      LIMIT 10
    `, [userId, now]);

    return res.json({ success: true, data: events });
  } catch (err) {
    console.error('Lỗi getUpcomingEvents:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tải sự kiện sắp tới.' });
  }
}

function createEvent(req, res) {
  try {
    const userId = req.user.id;
    const { title, description, start_time, end_time, location, color = '#6366f1', reminder_minutes = 15 } = req.body;

    if (!title || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tiêu đề, thời gian bắt đầu và kết thúc.' });
    }

    if (new Date(end_time) <= new Date(start_time)) {
      return res.status(400).json({ success: false, message: 'Thời gian kết thúc phải diễn ra sau thời gian bắt đầu.' });
    }

    const eventId = 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    execute(`
      INSERT INTO events (id, user_id, title, description, start_time, end_time, location, color, reminder_minutes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [eventId, userId, title.trim(), description || '', start_time, end_time, location || '', color, reminder_minutes, now, now]);

    const created = queryOne('SELECT * FROM events WHERE id = ?', [eventId]);
    return res.status(201).json({ success: true, message: 'Thêm sự kiện thành công!', data: created });
  } catch (err) {
    console.error('Lỗi createEvent:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tạo sự kiện.' });
  }
}

function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const existing = queryOne('SELECT * FROM events WHERE id = ? AND user_id = ?', [id, userId]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện.' });
    }

    const { title, description, start_time, end_time, location, color, reminder_minutes } = req.body;

    const startCheck = start_time || existing.start_time;
    const endCheck = end_time || existing.end_time;
    if (new Date(endCheck) <= new Date(startCheck)) {
      return res.status(400).json({ success: false, message: 'Thời gian kết thúc phải diễn ra sau thời gian bắt đầu.' });
    }

    const now = new Date().toISOString();

    execute(`
      UPDATE events SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        start_time = COALESCE(?, start_time),
        end_time = COALESCE(?, end_time),
        location = COALESCE(?, location),
        color = COALESCE(?, color),
        reminder_minutes = COALESCE(?, reminder_minutes),
        updated_at = ?
      WHERE id = ? AND user_id = ?
    `, [
      title ? title.trim() : null,
      description !== undefined ? description : null,
      start_time || null,
      end_time || null,
      location !== undefined ? location : null,
      color || null,
      reminder_minutes !== undefined ? reminder_minutes : null,
      now,
      id,
      userId
    ]);

    const updated = queryOne('SELECT * FROM events WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Cập nhật sự kiện thành công!', data: updated });
  } catch (err) {
    console.error('Lỗi updateEvent:', err);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật sự kiện.' });
  }
}

function deleteEvent(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const existing = queryOne('SELECT id FROM events WHERE id = ? AND user_id = ?', [id, userId]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện.' });
    }

    execute('DELETE FROM events WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ success: true, message: 'Đã xóa sự kiện thành công.' });
  } catch (err) {
    console.error('Lỗi deleteEvent:', err);
    return res.status(500).json({ success: false, message: 'Lỗi xóa sự kiện.' });
  }
}

module.exports = {
  getEvents,
  getUpcomingEvents,
  createEvent,
  updateEvent,
  deleteEvent
};
