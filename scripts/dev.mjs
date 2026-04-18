import { spawn } from 'node:child_process';

const children = [];

function run(cmd, args) {
  const child = spawn(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });
  children.push(child);
  child.on('exit', (code, signal) => {
    // If one process exits unexpectedly, shut down the other one too.
    if (code !== 0 && signal !== 'SIGTERM') {
      shutdown();
      process.exit(code ?? 1);
    }
  });
  return child;
}

function shutdown() {
  for (const child of children) {
    try {
      child.kill('SIGTERM');
    } catch {
      // ignore
    }
  }
}

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});
process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});

run('npm', ['run', 'dev:api']);
run('npm', ['run', 'dev:ui']);

// Keep the parent alive.
setInterval(() => {}, 1 << 30);
