const fs = require('fs');
const path = require('path');

exports.readJsonFile = (fileName) => fs.readFileSync(
  path.join(__dirname, `resources/${fileName}.json`),
  'utf8',
);

exports.readXmlFile = (fileName) => fs.readFileSync(
  path.join(__dirname, `resources/${fileName}.xml`),
  'utf8',
);
