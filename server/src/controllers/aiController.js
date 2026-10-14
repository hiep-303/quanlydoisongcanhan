const { queryAll, execute } = require('../config/db');
const { processUserPrompt } = require('../services/aiService');

async function chat(req, res) {
  try {
    const userId = req.user.id;
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung câu hỏi cho AI.' });
    }

    const now = new Date().toISOString();

    // Save user message
    const userMsgId = 'ai_usr_' + Date.now();
    execute(`
      INSERT INTO ai_chats (id, user_id, role, content, created_at)
      VALUES (?, ?, 'user', ?, ?)
    `, [userMsgId, userId, prompt.trim(), now]);

    // Generate response
    const result = await processUserPrompt(userId, prompt.trim(), req.user.notification_prefs);

    // Save assistant message
    const asstMsgId = 'ai_ast_' + Date.now();
    execute(`
      INSERT INTO ai_chats (id, user_id, role, content, suggested_actions, created_at)
      VALUES (?, ?, 'assistant', ?, ?, ?)
    `, [asstMsgId, userId, result.reply, JSON.stringify(result.suggestedActions), new Date().toISOString()]);

    return res.json({
      success: true,
      data: {
        role: 'assistant',
        content: result.reply,
        suggestedActions: result.suggestedActions,
        mode: result.mode
      }
    });
  } catch (err) {
    console.error('Lỗi ai chat:', err);
    return res.status(500).json({ success: false, message: 'Trợ lý AI đang bận. Vui lòng thử lại sau.' });
  }
}

function getChatHistory(req, res) {
  try {
    const userId = req.user.id;
    const history = queryAll(`
      SELECT id, role, content, suggested_actions, created_at 
      FROM ai_chats 
      WHERE user_id = ? 
      ORDER BY created_at ASC
    `, [userId]).map(m => ({
      ...m,
      suggestedActions: JSON.parse(m.suggested_actions || '[]')
    }));

    return res.json({ success: true, data: history });
  } catch (err) {
    console.error('Lỗi getChatHistory:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tải lịch sử trò chuyện.' });
  }
}

function clearChatHistory(req, res) {
  try {
    const userId = req.user.id;
    execute('DELETE FROM ai_chats WHERE user_id = ?', [userId]);
    return res.json({ success: true, message: 'Đã xóa toàn bộ lịch sử trò chuyện với AI.' });
  } catch (err) {
    console.error('Lỗi clearChatHistory:', err);
    return res.status(500).json({ success: false, message: 'Lỗi xóa lịch sử trò chuyện.' });
  }
}

module.exports = {
  chat,
  getChatHistory,
  clearChatHistory
};
