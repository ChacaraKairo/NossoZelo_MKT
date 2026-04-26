const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const source = path.join(projectRoot, 'src', 'HTML');
const target = path.join(projectRoot, 'dist', 'HTML');

if (fs.existsSync(source)) {
  fs.cpSync(source, target, { recursive: true });
}
