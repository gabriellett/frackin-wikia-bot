const _ = require('lodash');

const getImageOrPlaceholder = (image, size, hashes, images) => {
  const path = image.substr(1);
  const sha1 = hashes[path];
  if (images[sha1]) {
    return `[[${images[sha1].title}|thumb|${size}]]`
  } else {
    return path.replace(/\//g,"")
  }
}

const genTemplate = (data, images, hashes) => {

  const usedImages = _.uniq(data.map((star) => star.image)).filter((i) => !images[hashes[i.substr(1)]])

  const text = data.map((star) => {
    const planetsByTier = star.planetaryTypes.reduce((acc, cur, i) => {
      currentTier = acc[cur.tier] === undefined ? [cur] : [...acc[cur.tier], cur];
      acc[cur.tier] = currentTier;
      return acc;
    }, {});

    return `
{| class="article-table"
! rowspan="4" | ${getImageOrPlaceholder(star.image, "85x85px", hashes, images)}
! colspan="3" | ${star.name}
|-
| colspan="3" rowspan="3" |
<div style="text-align: left">
Contains the following planets:
${Object.keys(planetsByTier).map((tier) => `* '''Tier ${tier}:''' ${_.uniq(planetsByTier[tier].map((planet) => `[[${planet.name}]]`)).join(', ')}`).join(`\n`)}
</div>
|-
|-
|}`}).join(`\n`);

  return { usedImages, text }
}

module.exports = genTemplate;
