const fs = require('fs');

function parseCsvToRows(filePath) {
  const content = fs.readFileSync(filePath, 'utf8').trim();
  const lines = content.split(/\r?\n/);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];
  for (const line of lines.slice(1)) {
    if (!line) continue;
    const fields = line.split(',').map(f => f.trim());
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = fields[idx] ?? '';
    });
    rows.push(obj);
  }
  return rows;
}

module.exports = parseCsvToRows;