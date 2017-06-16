const fs = require('fs');
const stripJSONComments = require('strip-json-comments');

// Read a json file given the file path, stripping json comments
const readJSON = (jsonFile) => {
  var data = fs.readFileSync(jsonFile, 'utf8');
  return JSON.parse(stripJSONComments(data));
}

// Builds the main path to the frackin universe mod
// TODO: make it configurable
const frackinFile = (filePath) => `../FrackinUniverse/${filePath}`;

// Read a file from the FrackinUnverse folder and parse it to JSON
const frackinJson = (filePath) => readJSON(frackinFile(filePath));

module.exports = {
  frackinJson,
}
