const Wikia = require('./src/wikia.js');
const FileUtils = require('./src/utils/file');

const frackinHashes = FileUtils.frackinJson('hashes.json')

const systems = require('./src/parsers/systems.js');
const systemsTemplate = require('./src/templates/systems.js');

// Retrieve the username and password from the ENV
const username = process.env.FRABOT_WIKIA_USERNAME;
const password = process.env.FRABOT_WIKIA_PASSWORD;

// For now I'm using this sample page for testing
const pageName = "Hello, i'm a title!";

Wikia.login(username, password, [])
  .then(Wikia.fetchImagesGivenAgent)
  .then(({agent, images}) => {
    const template = systemsTemplate(systems, images);
    return Wikia.editPage(pageName, "Hello, i'm a title!", template)(agent)
  });
