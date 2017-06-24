const config = require ('../config.json');
const fs = require('fs');
const path = require('path');
const stripJSONComments = require('strip-json-comments');

// Read a json file given the file path, stripping json comments
const readJSON = (jsonFile) => {
  var data = fs.readFileSync(jsonFile, 'utf8');
  return JSON.parse(stripJSONComments(data).replace(/\r?\n|\r/g, ""));
}

// Builds the main path to the frackin universe mod / starbound
const frackinFile = (filePath) => `${config.FrackinUniverseFolder}${filePath}`;
const starboundFile = (filePath) => `${config.UnpackedAssetsFolder}${filePath}`;

// Read a file from the FrackinUnverse/Starbound folder and parse it to JSON
const frackinJson = (filePath) => readJSON(frackinFile(filePath));
const starboundJson = (filePath) => readJSON(starboundFile(filePath));

const findByExtension = (startPath, extension, start) => findByExtensions(startPath, [extension], start);
const findByExtensions = (startPath, extensions, start) => {

	start = start || [];
	if (!fs.existsSync(startPath)){
		console.log("No dir ", startPath);
		return start;
	}

	const files = fs.readdirSync(startPath);
	for(var i=0; i<files.length; i++){
		var filename = path.join(startPath, files[i]);
		var stat = fs.lstatSync(filename);

		if (stat.isDirectory()){
			start = findByExtensions(filename, extensions, start)
		} else if (extensions.some((e) => files[i].endsWith(e))) {
			start = start.concat(path.join(startPath, files[i]))
		}
	}

  return start
};

module.exports = {
  frackinJson,
  starboundJson,
  frackinFile,
  starboundFile,
  readJSON,
  findByExtension,
  findByExtensions
}
