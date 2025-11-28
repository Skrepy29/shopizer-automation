import fs from 'fs';
import path from 'path';

export function parseCsvToRows(filePath: string): Record<string, string>[] {
  const full = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  const content = fs.readFileSync(full, 'utf-8').trim();
  const lines = content.split(/\r?\n/);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const rows: Record<string, string>[] = [];
  for (const line of lines.slice(1)) {
    if (!line) continue;
    const fields = line.split(',').map(f => f.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = fields[idx] ?? '';
    });
    rows.push(obj);
  }
  return rows;
}