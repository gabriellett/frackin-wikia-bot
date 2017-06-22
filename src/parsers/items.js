const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const FileUtils = require('../utils/file');

const frackinJson = FileUtils.frackinJson;
const frackinFile = FileUtils.frackinFile;
const starboundFile = FileUtils.starboundFile;
const readJson = FileUtils.readJSON;
const findByExtensions = FileUtils.findByExtensions;

// This might take some time to run, will fetch info from starbound/fu items
const itemsByItemName = () => {
  const extensions = [".item", ".liqitem", ".consumable", ".matitem"];
  const itemFilesStarbound = findByExtensions(starboundFile('items'), extensions);
  const itemFilesFrackin = findByExtensions(frackinFile('items'), extensions);

  const itemFiles = itemFilesStarbound.concat(itemFilesFrackin);

  return itemFiles.reduce((acc, cur, i) => {
    file = readJson(cur);
    file.inventoryIcon = `/${path.parse(cur).dir}/${file.inventoryIcon}`;
    acc[file.itemName] = file;
    return acc;
  }, {});
};

module.exports = {
  itemsByItemName,
}

