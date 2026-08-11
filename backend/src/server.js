const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/db');

const start = async () => {
  await prisma.$connect();
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
