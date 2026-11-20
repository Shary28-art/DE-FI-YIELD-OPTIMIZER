const { spawn } = require('child_process');
const path = require('path');

console.log('=============================================================');
console.log('🚀 Starting DeFi Yield Optimizer & Risk-Scoring Platform');
console.log('=============================================================');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';
const nodeCmd = isWin ? 'node.exe' : 'node';

// Start Backend
console.log('⚡ Launching Express + Mongoose Backend on Port 5000...');
const backend = spawn(nodeCmd, ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'pipe',
  shell: true,
  env: { ...process.env, PORT: '5000' },
});

backend.stdout.on('data', (data) => {
  process.stdout.write(`[BACKEND] ${data}`);
});

backend.stderr.on('data', (data) => {
  process.stderr.write(`[BACKEND ERROR] ${data}`);
});

// Start Frontend
console.log('⚡ Launching Next.js Frontend on Port 3000...');
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'pipe',
  shell: true,
  env: { ...process.env, PORT: '3000' },
});

frontend.stdout.on('data', (data) => {
  process.stdout.write(`[FRONTEND] ${data}`);
});

frontend.stderr.on('data', (data) => {
  process.stderr.write(`[FRONTEND ERROR] ${data}`);
});

const cleanup = () => {
  console.log('\n🛑 Shutting down DeFi Risk Dashboard servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
