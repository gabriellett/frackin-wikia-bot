const Wikia = require('./src/wikia.js');
const _ = require('lodash');
const FileUtils = require('./src/utils/file');

const ArmorProcessor = require('./src/image_processors/armor');
const recipes = require('./src/parsers/recipes.js');
const items = require('./src/parsers/items.js');
const armors = require('./src/parsers/armors.js');
const leveling = require('./src/parsers/leveling.js');
const statusEffects = require('./src/parsers/statusEffects.js');

const armorsTemplate = require('./src/templates/armors.js');

const bonuses = statusEffects.bonuses();
const recipesByItem = recipes.recipesByItem()
const itemsByItem = items.itemsByItemName();
const itemsByUnlock = items.itemsByUnlock();
const levelingFunctions = leveling.levelingFunctionsByName();

// Retrieve the username and password from the ENV
const username = process.env.FRABOT_WIKIA_USERNAME;
const password = process.env.FRABOT_WIKIA_PASSWORD;

console.log(username);
console.log(password);

// Update the armors page
Wikia.login(username, password, [])
  .then(Wikia.fetchImagesGivenAgent)
  .then(({agent, images}) => {
    console.log("Starting parsing...");
    return armors.fullSets(recipesByItem, bonuses, levelingFunctions)
      .then((a) => { console.log("Parsed!"); return a })
      .then((pArmors) => armorsTemplate(pArmors, itemsByItem, images))
      .then((template) => Wikia.editPage("Armors Test", "Armors Test", template)(agent));
  }).catch((e) => console.error(e));

// Skiping the systems update
return;

// Get the image hashes and concat it into a single JSON
const systems = require('./src/parsers/systems.js');
const systemsTemplate = require('./src/templates/systems.js');

// For now I'm using this sample page for testing
const pageName = "Hello, i'm a title!";

Wikia.login(username, password, [])
  .then(Wikia.fetchImagesGivenAgent)
  .then(({agent, images}) => {
    const template = systemsTemplate(systems, images);
    return Wikia.editPage(pageName, "Hello, i'm a title!", template)(agent)
  });
