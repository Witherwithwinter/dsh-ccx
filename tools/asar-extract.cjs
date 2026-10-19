#!/usr/bin/env node
// Minimal asar reader: list / extract files from an Electron .asar archive.
// Usage:
//   node tools/asar-extract.js list  <archive> [prefix]
//   node tools/asar-extract.js get   <archive> <path/in/asar> [outFile]
const fs = require('fs');

function openArchive(p) {
  const buf = fs.readFileSync(p);
  const pickleSize = buf.readUInt32LE(4);
  const jsonStart = 16;
  const jsonLen = buf.readUInt32LE(12);
  const header = JSON.parse(buf.slice(jsonStart, jsonStart + jsonLen).toString());
  return { buf, header, dataStart: 8 + pickleSize };
}

function walk(node, prefix, out) {
  for (const [name, child] of Object.entries(node.files || {})) {
    const path = prefix ? `${prefix}/${name}` : name;
    if (child.files) walk(child, path, out);
    else out.push({ path, size: child.size, offset: child.offset });
  }
}

function resolve(root, path) {
  let node = root;
  for (const part of path.split('/')) {
    node = node.files && node.files[part];
    if (!node) throw new Error(`not found in asar: ${path}`);
  }
  return node;
}

const [cmd, archive, arg1, arg2] = process.argv.slice(2);
const a = openArchive(archive);

if (cmd === 'list') {
  const out = [];
  const prefix = arg1 || '';
  walk(resolve(a.header, prefix), prefix, out);
  for (const f of out) console.log(`${f.size}\t${f.path}`);
} else if (cmd === 'get') {
  const node = resolve(a.header, arg1);
  if (node.files) throw new Error('is a directory: ' + arg1);
  const data = a.buf.slice(a.dataStart + Number(node.offset), a.dataStart + Number(node.offset) + node.size);
  if (arg2) fs.writeFileSync(arg2, data);
  else process.stdout.write(data);
} else {
  console.error('unknown command');
  process.exit(1);
}
