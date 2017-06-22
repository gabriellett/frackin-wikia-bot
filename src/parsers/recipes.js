const _ = require('lodash');
const fs = require('fs');

const FileUtils = require('../utils/file');

const frackinJson = FileUtils.frackinJson;
const frackinFile = FileUtils.frackinFile;
const readJson = FileUtils.readJSON;
const findByExtension = FileUtils.findByExtension;

// Generates a json map of item -> recipe
const recipesByItem = () => {
  const recipeFiles = findByExtension("../FrackinUniverse/recipes", ".recipe");
  return recipeFiles.reduce((acc, cur, i) => {
    file = readJson(cur);
    acc[file.output.item] = file.input;
    return acc;
  }, {});
};

module.exports = {
  recipesByItem,
}

