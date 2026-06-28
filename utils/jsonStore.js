const fs = require('fs');
const path = require('path');

const cache = new Map();

function ensureFile(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
  }
}

function read(filePath, fallback = {}) {
  try {
    ensureFile(filePath, fallback);
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    cache.set(filePath, parsed);
    return parsed;
  } catch (error) {
    console.error(`Invalid JSON in ${filePath}: ${error.message}`);
    return cache.get(filePath) ?? fallback;
  }
}

function write(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  cache.set(filePath, data);
}

function watch(filePath, fallback = {}) {
  read(filePath, fallback);
  fs.watchFile(filePath, { interval: 1000 }, () => read(filePath, fallback));
}

module.exports = { read, write, watch, cache };
