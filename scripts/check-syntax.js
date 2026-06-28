const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const directories = ['commands', 'events', 'handlers', 'utils'];

function collectJavaScriptFiles(directory) {
  const fullDirectory = path.join(__dirname, '..', directory);
  const entries = fs.readdirSync(fullDirectory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(fullDirectory, entry.name);
    if (entry.isDirectory()) files.push(...collectJavaScriptFiles(path.join(directory, entry.name)));
    if (entry.isFile() && entry.name.endsWith('.js')) files.push(fullPath);
  }

  return files;
}

for (const file of directories.flatMap(collectJavaScriptFiles)) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status);
}
