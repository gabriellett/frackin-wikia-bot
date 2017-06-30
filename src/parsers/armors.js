const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const FileUtils = require('../utils/file');
const ArmorProcessor = require('../image_processors/armor');

const frackinJson = FileUtils.frackinJson;
const frackinFile = FileUtils.frackinFile;
const readJson = FileUtils.readJSON;

const getDirectoriesExcept = (srcpath, except) => {
  except = except || [];

  return fs.readdirSync(srcpath)
    .filter(file => fs.lstatSync(path.join(srcpath, file)).isDirectory())
    .filter(dir => except.indexOf(dir.split("/").pop()) == -1)
    .map(dir => path.join(srcpath, dir));
}

// Will remove every dir except tier dir I think
const mainDirectories = getDirectoriesExcept(frackinFile('items/armors'), ['bees', 'backitems', 'costumes', 'crew', 'decorative', 'other', 'unique'])

// Return the FULL SETS directories, checks if every dir has a .chest, .head and .legs file
const fullSetDirectories = () => _.flatten(mainDirectories.map((dir) => getDirectoriesExcept(frackinFile(dir), [])))
  .filter((dir) => {
    const containedPaths = fs.readdirSync(dir)
    return containedPaths.find((e) => e.endsWith(".head")) &&
      containedPaths.find((e) => e.endsWith(".chest")) &&
      containedPaths.find((e) => e.endsWith(".legs"))
  });

// Retrieve the set bonus (must be present on all armor pieces)
const parseSetBonus = (head, chest, legs) => {
  return _.findKey(_.flatten([head, chest, legs].map((obj) => obj.statusEffects.filter((obj) => typeof obj === 'string')))
   .reduce((acc, cur, i) => {
     acc[cur] = acc[cur] ? acc[cur] + 1 : 1 ;
     return acc;
   }, {}), (count) => count === 3);
};

// Parse the set name, thete is no label for the set, only for separate pieces, so the common part of the string
// is fetched and get "Armor" added on the end of it
const parseSetName = (head, chest, legs) => {
	const fullDescription = [head.shortdescription, chest.shortdescription, legs.shortdescription].join(" ");

	var reg = /(?=((.+)(?:.*?\2)+))/g;
	var sub = ""; //somewhere to stick temp results
	var maxstr = ""; // our maximum length repeated string
	reg.lastIndex = 0; // because reg previously existed, we may need to reset this
	sub = reg.exec(fullDescription); // find the first repeated string
	while (!(sub == null)){
		if ((!(sub == null)) && (sub[2].length > maxstr.length) && fullDescription.match(new RegExp(sub[2], "g")).length > 2){
			maxstr = sub[2];
		}
		sub = reg.exec(fullDescription);
		reg.lastIndex++; // start searching from the next position
	}
	return `${maxstr} Armor`.replace("  "," ");
}

// Generate the power/shield/energy/health human values
const generateLeveledStatus = (levelingFunctions) => (json) => json.leveledStatusEffects === undefined ? [] : json.leveledStatusEffects.map((eff) => {
  return {
    stat: eff.stat,
    value: levelingFunctions[eff.levelFunction].levels[json.level] * (eff.baseMultiplier ? ((eff.baseMultiplier - 1)*100) : eff.amount)
  };
});

const parseDescription = (description) => description
  .replace(/\^reset;/g, ", ")
  .replace(/(\^.*?\;)/g, " ")
  .replace(/\ \ /g, " ")
  .replace(/\,\ \,/g, ",")
  .replace(/\.\ \,/g, ".")
  .slice(0, -1);

const parseArmorPiece = (pieceJson, recipes, genLeveledStatus) => ({
  id: pieceJson.itemName,
  name: pieceJson.shortdescription,
  level: pieceJson.level,
  recipe: recipes[pieceJson.itemName],
  icon: pieceJson.inventoryIcon,
  leveledStatusEffects: genLeveledStatus(pieceJson),
  description: parseDescription(pieceJson.description)
})

// Generate the set json
const fullSets = (recipes, bonuses, levelingFunctions) => {
  const genLeveledStatus = generateLeveledStatus(levelingFunctions);

  return Promise.all(fullSetDirectories().map((folder) => {
  return new Promise((resolve, reject) => {

    const containedPaths = fs.readdirSync(folder);

    const headFilePath = containedPaths.find((e) => e.endsWith(".head"));
    const chestFilePath =  containedPaths.find((e) => e.endsWith(".chest"));
    const legsFilePath =  containedPaths.find((e) => e.endsWith(".legs"));

    const headJson = readJson(`${folder}/${headFilePath}`);
    const chestJson = readJson(`${folder}/${chestFilePath}`);
    const legsJson = readJson(`${folder}/${legsFilePath}`);
    const setName = folder.split("/").pop();

    // Create the set directory
    mkdirp(`./temp/armors/${folder.split("armors/")[1]}`, (err) => err ? console.error("Error on create folder:", err) : "");

    const setBonusName = parseSetBonus(headJson, chestJson, legsJson);
    var setBonusEffect = setBonusName;

    // Check if set bonus end with number
    const match = /^(.+?)(\d+)$/.exec(setBonusName);
    if ( bonuses[setBonusName] === undefined && match != null ) {
      setBonusEffect = `${match[1]}effect${match[2]}`;

      // Edge case: xithricite set is named differently from the others
      // It's easier to hardcode it here, FIXME
    } else if (setBonusEffect === "xithricitesetbonus"){
      setBonusEffect = "xithriciteset";
    }

    const setBonus = setBonusEffect === undefined ? undefined : {
      id: setBonusName,
      label: bonuses[setBonusEffect].label,
      icon: bonuses[setBonusEffect].icon
    }

    return Promise.all([
      ArmorProcessor.processArmor({
        pants:   { image: `${folder}/${legsJson.maleFrames}`, colors: legsJson.colorOptions },
        bsleeve: { image: `${folder}/${chestJson.maleFrames.backSleeve}`, colors: chestJson.colorOptions },
        chest:   { image: `${folder}/${chestJson.maleFrames.body}`, colors: chestJson.colorOptions },
        fsleeve: { image: `${folder}/${chestJson.maleFrames.frontSleeve}`, colors: chestJson.colorOptions },
        head:    { image: `${folder}/${headJson.maleFrames}`, colors: headJson.colorOptions }
      }, `./temp/armors/${folder.split("armors/")[1]}/fullset.png`),
      ArmorProcessor.processIcons(`${folder}/${headJson.inventoryIcon.split(":")[0]}`, "head", `./temp/armors/${folder.split("armors/")[1]}/`),
      ArmorProcessor.processIcons(`${folder}/${chestJson.inventoryIcon.split(":")[0]}`, "chest", `./temp/armors/${folder.split("armors/")[1]}/`),
      ArmorProcessor.processIcons(`${folder}/${legsJson.inventoryIcon.split(":")[0]}`, "pants", `./temp/armors/${folder.split("armors/")[1]}/`),
    ]).then(() => {
      resolve({
        id: setName,
        name: parseSetName(headJson, chestJson, legsJson),
        imagesPath: `./temp/armors/${folder.split("armors/")[1]}/`,
        level: Math.min.apply(null, [headJson.level, chestJson.level, chestJson.level]),
        bonus: setBonus,
        head: parseArmorPiece(headJson, recipes, genLeveledStatus),
        chest: parseArmorPiece(chestJson, recipes, genLeveledStatus),
        pants: parseArmorPiece(legsJson, recipes, genLeveledStatus)
      });
    });
  });
}))
};

module.exports = {
  fullSets
};
