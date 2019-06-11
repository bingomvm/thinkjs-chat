const Base = require('./base.js');
const fs = require('fs');
const path = require('path');
const readFile = think.promisify(fs.readFile, fs);
const statFile = think.promisify(fs.stat, fs);
const writeFile = think.promisify(fs.writeFile, fs);
module.exports = class extends Base {
  indexAction() {
    return this.display();
  }
};
