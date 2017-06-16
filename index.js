const Wikia = require('./src/wikia.js');

const systems = require('./src/parsers/systems.js');
const systemsTemplate = require('./src/templates/systems.js');

// Retrieve the username and password from the ENV
const username = process.env.FRABOT_WIKIA_USERNAME;
const password = process.env.FRABOT_WIKIA_PASSWORD;

// For now I'm using this sample page for testing
const pageName = "Hello, i'm a title!";

Wikia.login(username, password, [
  Wikia.editPage(pageName, {
    title: "Hello, i'm a title!",
    text: systemsTemplate(systems)
  })
]);
