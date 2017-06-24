const _ = require('lodash');
const sha1File = require('sha1-file');

const FileUtils = require('../utils/file');

const frackinJson = FileUtils.frackinJson;
const frackinFile = FileUtils.frackinFile;
const starboundFile = FileUtils.starboundFile;

const getImageOrPlaceholder = (image, size, images, usedImages, thumb) => {
  const path = image;
  const sha1 = sha1File(path);
  thumb = thumb !== undefined ? thumb : true;
  if (images[sha1]) {
    return `[[${images[sha1].title}|${thumb ? 'thumb|' : ''}${size}]]`;
  } else {
    // Add the image to the list of used images
    usedImages.push(path);
    return `[[File:${path.replace(/\//g,"")}|${thumb ? 'thumb|' : ''}${size}]]`;
  }
}

const generateRecipe = (images, items, armors) => (item, usedImages) => {
  if (item.recipe) {
    return item.recipe.map((i) => {
      let icon = ""
      let description = ""

      if (items[i.item]) {
        icon = items[i.item].inventoryIcon.slice(1);
        description = items[i.item].shortdescription;
      } else {
        item = _.flatten(armors.map((a) => [
          Object.assign({}, a.head, {imagesPath: a.imagesPath}),
          Object.assign({}, a.chest, {imagesPath: a.imagesPath}),
          Object.assign({}, a.pants, {imagesPath: a.imagesPath}),
        ])).find((a) => a.id === i.item)

        // Turn icon.png:head into iconhead.png

        icon = item.imagesPath + item.icon.replace(".png","").replace("s:","") + ".png";
        description = item.name;
      }
      return `<p>${getImageOrPlaceholder(icon, "16x16px", images, usedImages)}${i.count} x ${description.replace(/(\^.*?\;)/g, "")}</p>`;
      //return `[[File:Cotton.png|thumb|16x16px]]${i.count} x ${description.replace(/(\^.*?\;)/g, "")}`;
    }).join(`\n`);
  } else{
    return "";
  }
}

const genMaxStat = (armor, stat) => (getStat(armor.chest, stat) + getStat(armor.head, stat) + getStat(armor.pants, stat)).toFixed(2);

const getStat = (json, stat) => {
  const eff = json.leveledStatusEffects.find((x) => x.stat === stat);
  return eff ? Number(eff.value.toFixed(2)) : 0;
}
const genTemplate = (data, items, images) => {
  const usedImages = [];
  const recipeFun = generateRecipe(images, items, data);

  const armorsByTier = data.reduce((acc, cur) => {
    acc[Number(cur.level)] = (acc[Number(cur.level)] || []).concat(cur);
    return acc;
  }, {})

  const text = Object.keys(armorsByTier).sort().filter((o) => o > 0).map((tier) => `

== Tier ${tier} ==

${armorsByTier[tier].map((armor) => (`

=== ${armor.name} ===

{| class="article-table"
! colspan="2" rowspan="2" | ${getImageOrPlaceholder(`${armor.imagesPath}fullset.png`, "86x86px", images, usedImages, false)}
!${getImageOrPlaceholder(`${starboundFile('interface/inventory/sword.png')}`, "30x30px", images, usedImages, false)}
!${getImageOrPlaceholder(`${starboundFile('interface/inventory/shield.png')}`, "30x30px", images, usedImages, false)}
!${getImageOrPlaceholder(`${starboundFile('interface/inventory/lightning.png')}`, "30x30px", images, usedImages, false)}
!${getImageOrPlaceholder(`${starboundFile('interface/inventory/heart.png')}`, "30x30px", images, usedImages, false)}
|-
|${genMaxStat(armor, 'powerMultiplier')} %
|${genMaxStat(armor, 'protection')}
|${genMaxStat(armor, 'maxEnergy')}
|${genMaxStat(armor, 'maxHealth')}
|-
|Bonuses
| colspan="5" |${armor.bonus ? armor.bonus.label : ""}
|-
| colspan="2" |${armor.head.name}
| colspan="2" |${armor.chest.name}
| colspan="2" |${armor.pants.name}
|-
| colspan="2" |
<div style="text-align: right">
${recipeFun(armor.head, usedImages)}
</div>
| colspan="2" |
<div style="text-align: right">
${recipeFun(armor.chest, usedImages)}
</div>
| colspan="2" |
<div style="text-align: right">
${recipeFun(armor.pants, usedImages)}
</div>
|-
|${getImageOrPlaceholder(`${starboundFile('interface/inventory/sword.png')}`, "30x30px", images, usedImages, false)}
|${getStat(armor.head, 'powerMultiplier')} %
|${getImageOrPlaceholder(`${starboundFile('interface/inventory/sword.png')}`, "30x30px", images, usedImages, false)}
|${getStat(armor.chest, 'powerMultiplier')} %
|${getImageOrPlaceholder(`${starboundFile('interface/inventory/sword.png')}`, "30x30px", images, usedImages, false)}
|${getStat(armor.pants, 'powerMultiplier')} %
|-
|${getImageOrPlaceholder(`${starboundFile('interface/inventory/shield.png')}`, "30x30px", images, usedImages, false)}
|${getStat(armor.head, 'protection')}
|${getImageOrPlaceholder(`${starboundFile('interface/inventory/shield.png')}`, "30x30px", images, usedImages, false)}
|${getStat(armor.chest, 'protection')}
|${getImageOrPlaceholder(`${starboundFile('interface/inventory/shield.png')}`, "30x30px", images, usedImages, false)}
|${getStat(armor.pants, 'protection')}
|-
|${getImageOrPlaceholder(`${starboundFile('interface/inventory/lightning.png')}`, "30x30px", images, usedImages, false)}
|${getStat(armor.head, 'maxEnergy')}
|${getImageOrPlaceholder(`${starboundFile('interface/inventory/lightning.png')}`, "30x30px", images, usedImages, false)}
|${getStat(armor.chest, 'maxEnergy')}
|${getImageOrPlaceholder(`${starboundFile('interface/inventory/lightning.png')}`, "30x30px", images, usedImages, false)}
|${getStat(armor.pants, 'maxEnergy')}
|-
|${getImageOrPlaceholder(`${starboundFile('interface/inventory/heart.png')}`, "30x30px", images, usedImages, false)}
|${getStat(armor.head, 'maxHealth')}
|${getImageOrPlaceholder(`${starboundFile('interface/inventory/heart.png')}`, "30x30px", images, usedImages, false)}
|${getStat(armor.chest, 'maxHealth')}
|${getImageOrPlaceholder(`${starboundFile('interface/inventory/heart.png')}`, "30x30px", images, usedImages, false)}
|${getStat(armor.pants, 'maxHealth')}
|}`)).join(`\n\n`)}`)

  return { usedImages: _.uniq(usedImages), text: `<div class="armor-list">\n${text}\n</div>` };
}

module.exports = genTemplate;
