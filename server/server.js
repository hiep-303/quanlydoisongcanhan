require('dotenv').config();
const app = require('./src/app');
const { seedDatabase } = require('./src/services/seedService');

const PORT = process.env.PORT || 5000;

try {
  // Initialize and seed default accounts & sample data
  seedDatabase();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 LifeHub Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`👤 Admin: admin@lifehub.vn | Mật khẩu: Admin@123`);
    console.log(`👤 Demo User: user@lifehub.vn | Mật khẩu: User@123`);
    console.log(`=======================================================`);
  });
} catch (err) {
  console.error('Không thể khởi động server:', err);
  process.exit(1);
}
