const _ = require('lodash');

const FileUtils = require('../utils/file');

const frackinJson = FileUtils.frackinJson;

const planetNamesJson = require('../../data/planet-names.json');
const planetaryTypes = require('../../data/planet-names.json');

// Required files
const celestial = frackinJson('celestial.config.patch');
const cockpitInterface = frackinJson('interface/cockpit/cockpit.config');
const terrestrialWorlds = frackinJson('terrestrial_worlds.config.patch');

const getPlanetName = (id) =>  (planetNamesJson[id] || frackinJson(`biomes/surface/${id}.biome`).friendlyName);

const threatLevels = terrestrialWorlds.filter((obj) => obj.path.indexOf('/planetTypes/') > -1 && obj.path.split('/').length === 3 )
                                .reduce((acc, cur, i) => {
                                  acc[cur.path.split('/')[2]] = cur.value.threatRange ? cur.value.threatRange[1] : 0;
                                  return acc;
                                }, {});

const planetaryTypesRaw = celestial.filter((obj) => ( obj.path.indexOf('planetaryTypes') > -1 || obj.path.indexOf('satelliteTypes') > -1 ) && obj.path[obj.path.length -1] !== '-');

planetaryTypesRaw.forEach((p) => {
  const name = p.path.split('/').slice(2)[0];
  planetaryTypes[name] = p.value.baseParameters.terrestrialType.map( (type) => ({
    id: type,
    name: getPlanetName(type),
    tier: threatLevels[type] || -1,
    image: `/interface/cockpit/planets/${type}.png`,
  }));
});


const systems = celestial.filter((obj) => obj.path.indexOf('systemTypes') > -1 ).map( (system) => {
  const planetaryTypesUnflatten = system.value.orbitRegions.map((orbit) => orbit.planetaryTypes.map((type) => type.item).concat(orbit.satelliteTypes.map((type) => type.item)));
  const planetaryTypesFlatten = [].concat.apply([], ([].concat.apply([], planetaryTypesUnflatten) // Flatten 2 times
                      .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicated regions
                      .map((p) => planetaryTypes[p] || p))) // Add planet names
                      .filter((val,idx,self) => idx === _.findIndex(self, (e) => (e.id === val.id))); // Remove duplicates



  return {
    id: system.value.baseParameters.typeName,
    name: cockpitInterface["starTypeNames"][system.value.baseParameters.typeName],
    image: system.value.baseParameters.image,
    variations: system.value.variationParameters.map((variation) => variation.description),
    planetaryTypes: planetaryTypesFlatten
  };
})

module.exports = systems;
