const fs = require('fs');
const path = require('path');
const cache = new Map();
function ensure(file, fallback){ if(!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(fallback,null,2)); }
function read(file, fallback = {}) { try { ensure(file, fallback); const raw=fs.readFileSync(file,'utf8'); const parsed=JSON.parse(raw); cache.set(file, parsed); return parsed; } catch(e){ console.error(`Invalid JSON in ${file}:`, e.message); return cache.get(file) ?? fallback; } }
function write(file, data){ fs.mkdirSync(path.dirname(file),{recursive:true}); fs.writeFileSync(file, JSON.stringify(data,null,2)); cache.set(file,data); }
function watch(file, fallback={}){ read(file,fallback); fs.watchFile(file,{interval:1000},()=>read(file,fallback)); }
module.exports={read,write,watch,cache};
