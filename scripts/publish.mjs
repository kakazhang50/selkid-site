#!/usr/bin/env node
import { execSync } from 'child_process';
import readline from 'readline';

const args = process.argv.slice(2);
let message = args.join(' ').trim();

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', encoding: 'utf8' });
}

function runCapture(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

async function prompt(defaultMsg) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`更新说明（直接回车 = "${defaultMsg}"）: `, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultMsg);
    });
  });
}

async function main() {
  const defaultMsg = `Site update ${new Date().toISOString().slice(0, 10)}`;
  if (!message) message = await prompt(defaultMsg);

  const status = runCapture('git status --porcelain');
  if (!status) {
    console.log('\n没有需要提交的改动。');
    process.exit(0);
  }

  console.log('\n构建验证...');
  run('npm run build');

  console.log('\n提交并推送（Cloudflare 会自动部署）...\n');
  run('git add .');
  run(`git commit -m "${message.replace(/"/g, '\\"')}"`);
  run('git push origin main');

  console.log('\n✓ 已推送。约 2–5 分钟后访问网站并 Ctrl+F5 刷新。');
}

main().catch((err) => {
  console.error('\n失败:', err.message);
  process.exit(1);
});
