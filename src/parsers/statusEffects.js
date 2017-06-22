const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const FileUtils = require('../utils/file');

const frackinJson = FileUtils.frackinJson;
const frackinFile = FileUtils.frackinFile;
const readJson = FileUtils.readJSON;

function readDirR(dir) {
	return fs.statSync(dir).isDirectory()
		? Array.prototype.concat(...fs.readdirSync(dir).map(f => readDirR(path.join(dir, f))))
		: dir;
}

const getFiles = () => {
  const sourceDir = 'stats/effects';

  return readDirR(frackinFile(sourceDir))
    .filter(file => !fs.lstatSync(file).isDirectory())
    .filter(file => {
      const matched = /^(.+?)effect(\d+)*\.statuseffect$/.exec(file);
      return matched !== null;
    })
}

// Fetch the bonuses files
const bonuses = () => {
	return getFiles().map((fileName) => readJson(fileName))
					.reduce((acc, cur, i) => {
            const matches = /^(.+?)effect(\d+)*$/.exec(cur.name)
						acc[[matches[1],matches[2]].join("")] = cur;
						return acc;
					}, {})
}

module.exports = {
	bonuses
}
