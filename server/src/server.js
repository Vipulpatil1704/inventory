import app from './app.js';
import connectDB from './config/db.js';
import env from './config/env.js';

async function start() {
  try {
    await connectDB();
    if (env.nodeEnv === 'development') {
    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
      console.log(`Swagger docs: http://localhost:${env.port}/api/docs`);
    });
  }
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

start();

export default app;
