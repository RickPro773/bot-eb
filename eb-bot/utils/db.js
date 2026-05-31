const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

function readDB(file) {
  const filePath = path.join(dataDir, `${file}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '{}');
    return {};
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeDB(file, data) {
  const filePath = path.join(dataDir, `${file}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };
