const bcrypt = require('bcryptjs');
const { queryOne, execute, queryAll } = require('../config/db');

function seedDatabase() {
  // Check if admin exists
  const existingAdmin = queryOne('SELECT id FROM users WHERE email = ?', ['admin@lifehub.vn']);
  if (!existingAdmin) {
    const adminPasswordHash = bcrypt.hashSync('Admin@123', 10);
    const now = new Date().toISOString();
    const adminId = 'usr_admin_001';

    execute(`
      INSERT INTO users (id, name, email, password_hash, role, avatar_url, bio, timezone, language, theme, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      adminId,
      'Quản Trị Viên',
      'admin@lifehub.vn',
      adminPasswordHash,
      'admin',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      'Hệ thống quản trị LifeHub Vietnam',
      'Asia/Ho_Chi_Minh',
      'vi',
      'dark',
      now,
      now
    ]);

    console.log('[Seed] Đã khởi tạo tài khoản Admin: admin@lifehub.vn / Admin@123');
  }

  // Check if demo user exists
  const existingUser = queryOne('SELECT id FROM users WHERE email = ?', ['user@lifehub.vn']);
  if (!existingUser) {
    const userPasswordHash = bcrypt.hashSync('User@123', 10);
    const now = new Date().toISOString();
    const userId = 'usr_demo_001';

    execute(`
      INSERT INTO users (id, name, email, password_hash, role, avatar_url, bio, timezone, language, theme, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      'Nguyễn Văn An',
      'user@lifehub.vn',
      userPasswordHash,
      'user',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      'Yêu thích lối sống tối giản, rèn luyện thói quen và quản lý tài chính khoa học.',
      'Asia/Ho_Chi_Minh',
      'vi',
      'light',
      now,
      now
    ]);

    console.log('[Seed] Đã khởi tạo tài khoản Demo User: user@lifehub.vn / User@123');

    // Seed sample data for user@lifehub.vn
    seedUserData(userId);
  }
}

function seedUserData(userId) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const tomorrow = new Date(now.getTime() + 86400000).toISOString().split('T')[0];
  const nextWeek = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0];
  const currentMonth = todayStr.substring(0, 7);

  // 1. Tasks
  const sampleTasks = [
    { id: 'tsk_1', title: 'Hoàn thiện báo cáo kế hoạch tuần', priority: 'high', status: 'in_progress', due_date: todayStr, category: 'Công việc' },
    { id: 'tsk_2', title: 'Đọc 30 trang sách "Atomic Habits"', priority: 'medium', status: 'completed', due_date: todayStr, category: 'Học tập' },
    { id: 'tsk_3', title: 'Kiểm tra và thanh toán tiền điện thoại', priority: 'low', status: 'todo', due_date: tomorrow, category: 'Tài chính' },
    { id: 'tsk_4', title: 'Chạy bộ 5km công viên', priority: 'medium', status: 'todo', due_date: todayStr, category: 'Sức khỏe' },
    { id: 'tsk_5', title: 'Soạn thảo đề cương nghiên cứu công nghệ mới', priority: 'urgent', status: 'todo', due_date: nextWeek, category: 'Dự án' }
  ];

  for (const t of sampleTasks) {
    execute(`
      INSERT INTO tasks (id, user_id, title, description, due_date, priority, status, category, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [t.id, userId, t.title, 'Mô tả chi tiết cho nhiệm vụ ' + t.title, t.due_date, t.priority, t.status, t.category, now.toISOString(), now.toISOString()]);
  }

  // 2. Events
  const sampleEvents = [
    { id: 'evt_1', title: 'Họp giao ban dự án', start_time: `${todayStr}T09:00:00`, end_time: `${todayStr}T10:30:00`, location: 'Phòng họp Google Meet', color: '#6366f1' },
    { id: 'evt_2', title: 'Khám sức khỏe định kỳ', start_time: `${tomorrow}T14:00:00`, end_time: `${tomorrow}T16:00:00`, location: 'Bệnh viện Đa khoa', color: '#10b981' },
    { id: 'evt_3', title: 'Hội thảo Công nghệ Web & AI', start_time: `${nextWeek}T08:30:00`, end_time: `${nextWeek}T17:00:00`, location: 'Trung tâm Hội nghị Quốc tế', color: '#f59e0b' }
  ];

  for (const e of sampleEvents) {
    execute(`
      INSERT INTO events (id, user_id, title, description, start_time, end_time, location, color, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [e.id, userId, e.title, 'Chi tiết sự kiện: ' + e.title, e.start_time, e.end_time, e.location, e.color, now.toISOString(), now.toISOString()]);
  }

  // 3. Goals
  const sampleGoals = [
    {
      id: 'gol_1',
      title: 'Đạt chứng chỉ IELTS 7.5',
      category: 'Học tập',
      target_date: '2026-12-31',
      progress: 65,
      milestones: JSON.stringify([
        { id: 'm1', title: 'Ôn tập 1000 từ vựng cốt lõi', completed: true },
        { id: 'm2', title: 'Hoàn thành 10 đề Cambridge Reading & Listening', completed: true },
        { id: 'm3', title: 'Luyện đề Writing Task 1 & 2 với gia sư', completed: false },
        { id: 'm4', title: 'Thi thử đạt band 7.0+', completed: false }
      ])
    },
    {
      id: 'gol_2',
      title: 'Xây dựng quỹ tiết kiệm khẩn cấp 50 triệu',
      category: 'Tài chính',
      target_date: '2026-11-30',
      progress: 80,
      milestones: JSON.stringify([
        { id: 'm5', title: 'Mở tài khoản tiết kiệm linh hoạt', completed: true },
        { id: 'm6', title: 'Đạt mốc 20 triệu', completed: true },
        { id: 'm7', title: 'Đạt mốc 40 triệu', completed: true },
        { id: 'm8', title: 'Đạt mục tiêu 50 triệu', completed: false }
      ])
    }
  ];

  for (const g of sampleGoals) {
    execute(`
      INSERT INTO goals (id, user_id, title, description, category, start_date, target_date, status, progress, milestones, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [g.id, userId, g.title, 'Kế hoạch hành động cụ thể để hiện thực hóa mục tiêu.', g.category, todayStr, g.target_date, 'in_progress', g.progress, g.milestones, now.toISOString(), now.toISOString()]);
  }

  // 4. Habits
  const sampleHabits = [
    { id: 'hab_1', title: 'Thức dậy trước 6:30 AM', frequency: 'daily', streak: 12, best_streak: 21, color: '#f59e0b' },
    { id: 'hab_2', title: 'Uống đủ 2 lít nước', frequency: 'daily', streak: 8, best_streak: 15, color: '#3b82f6' },
    { id: 'hab_3', title: 'Đọc sách 20 phút mỗi tối', frequency: 'daily', streak: 5, best_streak: 10, color: '#8b5cf6' },
    { id: 'hab_4', title: 'Tập thể dục / Gym', frequency: 'custom', streak: 4, best_streak: 14, color: '#10b981' }
  ];

  for (const h of sampleHabits) {
    execute(`
      INSERT INTO habits (id, user_id, title, description, frequency, streak, best_streak, color, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [h.id, userId, h.title, 'Duy trì thói quen mỗi ngày vì một lối sống tích cực.', h.frequency, h.streak, h.best_streak, h.color, now.toISOString(), now.toISOString()]);

    // Add today's log for first 2 habits
    if (h.id === 'hab_1' || h.id === 'hab_2') {
      execute(`
        INSERT INTO habit_logs (id, habit_id, user_id, log_date, completed, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [`log_${h.id}_today`, h.id, userId, todayStr, 1, now.toISOString()]);
    }
  }

  // 5. Budgets & Transactions
  const sampleBudgets = [
    { id: 'bdg_1', category: 'Ăn uống', monthly_limit: 4500000, month_year: currentMonth },
    { id: 'bdg_2', category: 'Đi lại & Xăng xe', monthly_limit: 1000000, month_year: currentMonth },
    { id: 'bdg_3', category: 'Giải trí & Mua sắm', monthly_limit: 2000000, month_year: currentMonth },
    { id: 'bdg_4', category: 'Học tập & Sách', monthly_limit: 1500000, month_year: currentMonth }
  ];

  for (const b of sampleBudgets) {
    execute(`
      INSERT INTO budgets (id, user_id, category, monthly_limit, month_year, alert_threshold, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [b.id, userId, b.category, b.monthly_limit, b.month_year, 80.0, now.toISOString(), now.toISOString()]);
  }

  const sampleTransactions = [
    { id: 'tx_1', type: 'income', amount: 25000000, category: 'Lương chính thức', date: `${currentMonth}-05`, notes: 'Nhận lương tháng qua chuyển khoản', payment_method: 'Chuyển khoản' },
    { id: 'tx_2', type: 'income', amount: 3500000, category: 'Freelance & Thưởng', date: `${currentMonth}-10`, notes: 'Dự án tư vấn giao diện web', payment_method: 'Chuyển khoản' },
    { id: 'tx_3', type: 'expense', amount: 150000, category: 'Ăn uống', date: todayStr, notes: 'Bữa trưa với đồng nghiệp', payment_method: 'Thẻ' },
    { id: 'tx_4', type: 'expense', amount: 450000, category: 'Ăn uống', date: `${currentMonth}-08`, notes: 'Đi siêu thị thực phẩm tuần', payment_method: 'Chuyển khoản' },
    { id: 'tx_5', type: 'expense', amount: 350000, category: 'Đi lại & Xăng xe', date: `${currentMonth}-06`, notes: 'Đổ xăng và phí cầu đường', payment_method: 'Tiền mặt' },
    { id: 'tx_6', type: 'expense', amount: 620000, category: 'Học tập & Sách', date: `${currentMonth}-09`, notes: 'Mua combo sách phát triển bản thân', payment_method: 'Thẻ' },
    { id: 'tx_7', type: 'expense', amount: 890000, category: 'Giải trí & Mua sắm', date: `${currentMonth}-11`, notes: 'Xem phim và mua đồ gia dụng nhỏ', payment_method: 'Thẻ' }
  ];

  for (const tx of sampleTransactions) {
    execute(`
      INSERT INTO transactions (id, user_id, type, amount, category, date, notes, payment_method, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [tx.id, userId, tx.type, tx.amount, tx.category, tx.date, tx.notes, tx.payment_method, now.toISOString(), now.toISOString()]);
  }

  // 6. Notes
  const sampleNotes = [
    { id: 'not_1', title: 'Ý tưởng dự án website quản lý đời sống', content: 'Cần tập trung vào giao diện tinh tế, thao tác mượt mà, phân loại rõ ràng giữa công việc, tài chính và thói quen. Tích hợp AI gợi ý lịch trình thông minh.', is_pinned: 1, tags: JSON.stringify(['Ý tưởng', 'Công nghệ']), color: '#e0e7ff' },
    { id: 'not_2', title: 'Quy tắc 50/30/20 trong tài chính', content: '50% cho nhu cầu thiết yếu (nhà cửa, ăn uống, điện nước).\n30% cho mong muốn cá nhân (mua sắm, du lịch, giải trí).\n20% cho tiết kiệm và đầu tư dài hạn.', is_pinned: 1, tags: JSON.stringify(['Tài chính', 'Kinh nghiệm']), color: '#dcfce7' },
    { id: 'not_3', title: 'Danh sách sách nên đọc quý này', content: '1. Sức mạnh của thói quen (Charles Duhigg)\n2. Deep Work (Cal Newport)\n3. Tư duy nhanh và chậm (Daniel Kahneman)', is_pinned: 0, tags: JSON.stringify(['Sách', 'Phát triển']), color: '#fef3c7' }
  ];

  for (const n of sampleNotes) {
    execute(`
      INSERT INTO notes (id, user_id, title, content, is_pinned, tags, color, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [n.id, userId, n.title, n.content, n.is_pinned, n.tags, n.color, now.toISOString(), now.toISOString()]);
  }

  // 7. Notifications
  const sampleNotifications = [
    { id: 'ntf_1', type: 'task', title: 'Nhiệm vụ đến hạn hôm nay', message: 'Bạn có nhiệm vụ "Hoàn thiện báo cáo kế hoạch tuần" cần hoàn thành hôm nay.', link: '/tasks', is_read: 0 },
    { id: 'ntf_2', type: 'finance', title: 'Thông báo ngân sách', message: 'Hạng mục Ăn uống đã sử dụng 13% ngân sách tháng hiện tại.', link: '/finance', is_read: 0 },
    { id: 'ntf_3', type: 'habit', title: 'Nhắc nhở rèn luyện', message: 'Đừng quên hoàn thành thói quen "Đọc sách 20 phút mỗi tối"!', link: '/habits', is_read: 1 }
  ];

  for (const nt of sampleNotifications) {
    execute(`
      INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [nt.id, userId, nt.type, nt.title, nt.message, nt.link, nt.is_read, now.toISOString()]);
  }

  // 8. AI Welcome message
  execute(`
    INSERT INTO ai_chats (id, user_id, role, content, suggested_actions, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    'ai_msg_welcome',
    userId,
    'assistant',
    'Xin chào Nguyễn Văn An! Tôi là Trợ lý AI Quản lý Đời sống Cá nhân. Tôi có thể giúp bạn tổng hợp các công việc ưu tiên, phân tích ngân sách chi tiêu, theo dõi chuỗi thói quen và lập kế hoạch thực hiện mục tiêu. Hôm nay tôi có thể hỗ trợ gì cho bạn?',
    JSON.stringify(['Kế hoạch hôm nay', 'Tóm tắt chi tiêu tháng này', 'Phân tích chuỗi thói quen']),
    now.toISOString()
  ]);
}

module.exports = {
  seedDatabase
};
