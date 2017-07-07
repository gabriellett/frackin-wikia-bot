const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const FileUtils = require('../utils/file');

const frackinJson = FileUtils.frackinJson;
const frackinFile = FileUtils.frackinFile;
const starboundFile = FileUtils.starboundFile;
const readJson = FileUtils.readJSON;
const findByExtensions = FileUtils.findByExtensions;

const cache = {};

// This might take some time to run, will fetch info from starbound/fu items
const cacheItems = () => {
  const extensions = [".item", ".liqitem", ".consumable", ".matitem", ".head", ".chest", ".legs"];
  const itemFilesStarbound = findByExtensions(starboundFile('items'), extensions);
  const itemFilesFrackin = findByExtensions(frackinFile('items'), extensions);

  const itemFiles = itemFilesStarbound.concat(itemFilesFrackin);

  cache.itemsByName = cache.itemsByName || {};
  cache.itemsByUnlock = cache.itemsByUnlock || {};

  itemFiles.forEach((cur) => {
    file = readJson(cur);
    file.inventoryIcon = `/${path.parse(cur).dir}/${file.inventoryIcon}`;

    cache.itemsByName[file.itemName] = file;

    if (file.learnBlueprintsOnPickup) {
      file.learnBlueprintsOnPickup.forEach((itemUnlocked) => {
        cache.itemsByUnlock[itemUnlocked] = cache.itemsByUnlock[itemUnlocked] || [];
        cache.itemsByUnlock[itemUnlocked] = cache.itemsByUnlock[itemUnlocked].concat(file.itemName);
      });
    }
  });
}


const itemsByItemName = () => {
  if (Object.keys(cache).length === 0) {
    cacheItems();
  }

  return cache.itemsByName;
};

const itemsByUnlock = () => {
  if (Object.keys(cache).length === 0) {
    cacheItems();
  }

  return cache.itemsByUnlock;
};



module.exports = {
  itemsByItemName,
  itemsByUnlock
}

