import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';

const PORT = parseInt(process.env.PORT || '3001', 10);
const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`[PromptShelf Backend] REST API listening on port ${PORT}`);
  console.log(`[PromptShelf Backend] Health check: http://localhost:${PORT}/api/health`);
  console.log(`[PromptShelf Backend] Prompts API: http://localhost:${PORT}/api/prompts`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server gracefully.');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Closing HTTP server gracefully.');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
