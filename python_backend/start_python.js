const { spawn } = require('child_process');
const path = require('path');

// Start Python backend
console.log('Starting Python backend...');
const pythonProcess = spawn('python', [path.join(__dirname, 'app.py')], {
  stdio: 'inherit'
});

pythonProcess.on('close', (code) => {
  console.log(`Python backend process exited with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Stopping Python backend...');
  pythonProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Stopping Python backend...');
  pythonProcess.kill('SIGTERM');
  process.exit(0);
});