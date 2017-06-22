const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const FileUtils = require('../utils/file');

const frackinJson = FileUtils.frackinJson;
const frackinFile = FileUtils.frackinFile;
const starboundFile = FileUtils.starboundFile;
const readJson = FileUtils.readJSON;
const findByExtensions = FileUtils.findByExtensions;

// Fetch the leveling functions so we can calculate the human stats of the armor
const levelingFunctionsByName = () => {
  const extensions = [".functions"];
  const funFilesStarbound = findByExtensions(starboundFile('leveling'), extensions);
  const funFilesFrackin = findByExtensions(frackinFile('leveling'), extensions);

  const funFiles = funFilesStarbound.concat(funFilesFrackin);
  const functions = _.extend.apply(_, funFiles.map((fun) => readJson(fun)));

  return Object.keys(functions).reduce((acc, cur) => {
    acc[cur] = {
      kind: [functions[cur][1], functions[cur][2]],
      levels: functions[cur].slice(2).reduce((acc, cur, i) => {
        acc[cur[0]] = cur[1];
        return acc;
      }, {})
    };

    return acc;
  }, {});
};

module.exports = {
  levelingFunctionsByName,
}
