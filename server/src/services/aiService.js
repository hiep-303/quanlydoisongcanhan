const { queryAll, queryOne } = require('../config/db');

async function processUserPrompt(userId, prompt, userPrefs = {}) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonth = todayStr.substring(0, 7);

  // 1. Gather real user context from database
  const tasks = queryAll(`
    SELECT title, priority, status, due_date, category 
    FROM tasks WHERE user_id = ? 
    ORDER BY CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END, due_date ASC
    LIMIT 20
  `, [userId]);

  const overdueTasks = tasks.filter(t => t.status !== 'completed' && t.due_date && t.due_date < todayStr);
  const todayTasks = tasks.filter(t => t.status !== 'completed' && t.due_date === todayStr);
  const pendingTasks = tasks.filter(t => t.status !== 'completed');

  const habits = queryAll('SELECT title, frequency, streak, best_streak FROM habits WHERE user_id = ?', [userId]);
  
  const goals = queryAll('SELECT title, progress, target_date, status FROM goals WHERE user_id = ?', [userId]);

  const events = queryAll(`
    SELECT title, start_time, end_time, location 
    FROM events WHERE user_id = ? AND start_time >= ? 
    ORDER BY start_time ASC LIMIT 5
  `, [userId, todayStr]);

  const monthIncome = queryOne(`
    SELECT SUM(amount) as s FROM transactions WHERE user_id = ? AND type = 'income' AND substr(date, 1, 7) = ?
  `, [userId, currentMonth]).s || 0;

  const monthExpense = queryOne(`
    SELECT SUM(amount) as s FROM transactions WHERE user_id = ? AND type = 'expense' AND substr(date, 1, 7) = ?
  `, [userId, currentMonth]).s || 0;

  const topExpenseCategory = queryOne(`
    SELECT category, SUM(amount) as s FROM transactions 
    WHERE user_id = ? AND type = 'expense' AND substr(date, 1, 7) = ?
    GROUP BY category ORDER BY s DESC LIMIT 1
  `, [userId, currentMonth]);

  const pLower = prompt.toLowerCase();
  let mode = 'local_ai'; // local rule-based contextual engine or external
  let reply = '';
  let suggestedActions = [];

  // Check if user has configured Gemini API
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Bạn là Trợ lý AI Quản lý Đời sống Cá nhân LifeHub. Dưới đây là dữ liệu thực của người dùng hiện tại:
- Ngày hôm nay: ${todayStr}
- Công việc cần làm: ${pendingTasks.length} việc (Quá hạn: ${overdueTasks.length}, Hôm nay: ${todayTasks.length})
- Danh sách việc: ${JSON.stringify(tasks.slice(0, 10))}
- Thói quen: ${JSON.stringify(habits)}
- Mục tiêu: ${JSON.stringify(goals)}
- Sự kiện sắp tới: ${JSON.stringify(events)}
- Tài chính tháng ${currentMonth}: Thu nhập ${monthIncome} đ, Chi tiêu ${monthExpense} đ.

Yêu cầu người dùng: "${prompt}"

Hãy trả lời bằng tiếng Việt thân thiện, súc tích, phân tích dữ liệu trên và đưa ra lời khuyên thực tế nhất. Lưu ý: Không tự ý sửa hay xóa dữ liệu của người dùng khi chưa có xác nhận.`
            }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        mode = 'gemini_api';
      }
    } catch (e) {
      console.warn('Không thể gọi Gemini API, chuyển sang phân tích thông minh cục bộ:', e.message);
    }
  }

  // If external API not used or failed, use smart internal engine
  if (!reply) {
    if (pLower.includes('kế hoạch') || pLower.includes('hôm nay') || pLower.includes('ngày') || pLower.includes('công việc')) {
      reply = `### 📋 Phân tích kế hoạch công việc cho bạn:\n\n` +
        `- **Việc cần ưu tiên hoàn thành ngay (${todayTasks.length + overdueTasks.length}):**\n` +
        (overdueTasks.length > 0 ? `  ⚠️ Bạn có **${overdueTasks.length} công việc đã quá hạn**: ${overdueTasks.map(t => `"${t.title}"`).join(', ')}. Hãy xử lý hoặc dời hạn để giảm tải áp lực.\n` : '') +
        (todayTasks.length > 0 ? `  📌 **Việc đến hạn hôm nay**: ${todayTasks.map(t => `"${t.title}" (${t.priority})`).join(', ')}.\n` : '  ✨ Bạn không có công việc nào đến hạn chót trong hôm nay.\n') +
        `- **Sự kiện sắp tới:** ${events.length > 0 ? events.map(e => `${e.title} (${e.start_time.substring(11, 16)})`).join(', ') : 'Không có lịch hẹn trùng lặp'}.\n\n` +
        `💡 **Lời khuyên:** Hãy bắt đầu ngày làm việc bằng 1 công việc quan trọng nhất (Deep Work) trong 45 phút, sau đó kiểm tra lại các mục tiêu còn lại.`;

      suggestedActions = ['Xem danh sách công việc', 'Thêm công việc mới', 'Xem lịch'];

    } else if (pLower.includes('chi tiêu') || pLower.includes('tài chính') || pLower.includes('ngân sách') || pLower.includes('tiền')) {
      const net = monthIncome - monthExpense;
      const topCatStr = topExpenseCategory ? `Chi tiêu nhiều nhất ở hạng mục **${topExpenseCategory.category}** (${topExpenseCategory.s.toLocaleString('vi-VN')} đ).` : '';

      reply = `### 💰 Tóm tắt tài chính tháng ${currentMonth}:\n\n` +
        `- **Tổng thu nhập:** ${monthIncome.toLocaleString('vi-VN')} đ\n` +
        `- **Tổng chi tiêu:** ${monthExpense.toLocaleString('vi-VN')} đ\n` +
        `- **Chênh lệch (Số dư còn lại):** ${net >= 0 ? '+' : ''}${net.toLocaleString('vi-VN')} đ ${net >= 0 ? '🟢 (Thặng dư tích cực)' : '🔴 (Đang thâm hụt ngân sách)'}\n` +
        (topCatStr ? `- **Phân tích:** ${topCatStr}\n\n` : '\n') +
        `💡 **Gợi ý tài chính:** Áp dụng nguyên tắc 50/30/20 (50% chi phí thiết yếu, 30% nhu cầu linh hoạt, 20% tích lũy). Hãy duy trì ghi chép các khoản chi tiêu nhỏ hằng ngày để không bị thất thoát ngân sách.`;

      suggestedActions = ['Thêm giao dịch mới', 'Xem báo cáo tài chính', 'Kiểm tra hạn mức ngân sách'];

    } else if (pLower.includes('thói quen') || pLower.includes('streak') || pLower.includes('rèn luyện')) {
      const topHabit = habits.reduce((prev, curr) => (curr.streak > (prev?.streak || 0) ? curr : prev), null);
      
      reply = `### 🔥 Phân tích chuỗi thói quen của bạn:\n\n` +
        `- Bạn hiện có **${habits.length} thói quen** đang duy trì.\n` +
        (topHabit ? `- Thói quen có phong độ tốt nhất: **"${topHabit.title}"** với chuỗi **${topHabit.streak} ngày liên tiếp** (Kỷ lục: ${topHabit.best_streak} ngày) 👏.\n` : '') +
        `- **Danh sách thói quen:** ${habits.map(h => `"${h.title}" (${h.streak} ngày)`).join(', ')}.\n\n` +
        `💡 **Bí quyết duy trì:** Đừng bỏ lỡ 2 ngày liên tiếp! Ngay cả khi bận rộn, chỉ cần dành 2 phút thực hiện phiên bản rút gọn của thói quen để giữ vững tính kỷ luật.`;

      suggestedActions = ['Điểm danh thói quen hôm nay', 'Thêm thói quen mới'];

    } else if (pLower.includes('mục tiêu') || pLower.includes('kế hoạch lớn') || pLower.includes('goal')) {
      reply = `### 🎯 Tiến độ các mục tiêu trọng tâm:\n\n` +
        (goals.length > 0 
          ? goals.map(g => `- **${g.title}**: Đã hoàn thành **${g.progress}%** (Hạn chót: ${g.target_date || 'Chưa đặt'})`).join('\n')
          : '- Bạn chưa tạo mục tiêu dài hạn nào. Hãy tạo 1 mục tiêu SMART đầu tiên!'
        ) + `\n\n💡 **Gợi ý:** Để đạt mục tiêu lớn, hãy chia nhỏ thành 3-5 hành động cụ thể mỗi tuần và liên kết chúng với danh sách công việc hàng ngày.`;

      suggestedActions = ['Tạo mục tiêu mới', 'Gợi ý chia nhỏ mục tiêu'];

    } else {
      reply = `Xin chào! Tôi đã nắm được dữ liệu đời sống của bạn trên LifeHub:\n\n` +
        `- Hiện có **${pendingTasks.length} công việc** cần xử lý (${overdueTasks.length} quá hạn, ${todayTasks.length} đến hạn hôm nay).\n` +
        `- Đang duy trì **${habits.length} thói quen** tích cực.\n` +
        `- Tổng số dư tài chính tháng này đang đạt **${(monthIncome - monthExpense).toLocaleString('vi-VN')} đ**.\n\n` +
        `Bạn có thể yêu cầu tôi:\n` +
        `1. *"Lập kế hoạch công việc ngày hôm nay"*\n` +
        `2. *"Phân tích tình hình chi tiêu tháng này"*\n` +
        `3. *"Kiểm tra chuỗi thói quen và cách cải thiện"*\n` +
        `4. *"Gợi ý các bước chia nhỏ mục tiêu của tôi"*`;

      suggestedActions = ['Kế hoạch hôm nay', 'Phân tích chi tiêu', 'Kiểm tra thói quen'];
    }
  }

  return {
    reply,
    suggestedActions,
    mode: mode === 'gemini_api' ? 'Gemini AI (Đang kết nối API)' : 'LifeHub Contextual Assistant (Dựa trên dữ liệu thực tế của bạn)'
  };
}

module.exports = {
  processUserPrompt
};
