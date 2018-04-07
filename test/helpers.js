const fs = require('fs');
const path = require('path');

exports.readFile = fileName => fs.readFileSync(
  path.join(__dirname, `resources/${fileName}.json`),
  'utf8',
);
