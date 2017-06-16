module.exports = (data) => {

const removeDuplicates = (value, index, self) => self.indexOf(value) === index;
return data.filter(removeDuplicates).map((star) => {
	const planetsByTier = star.planetaryTypes.reduce((acc, cur, i) => {
		currentTier = acc[cur.tier] === undefined ? [cur] : [...acc[cur.tier], cur];
		acc[cur.tier] = currentTier;
		return acc;
	}, {});

	return `
{| class="article-table"
! rowspan="4" |
! colspan="3" | ${star.name}
|-
| colspan="3" rowspan="3" |
<div style="text-align: left">
Contains the following planets:
${Object.keys(planetsByTier).map((tier) => `* '''Tier ${tier}:''' ${planetsByTier[tier].map((planet) => `[[${planet.name}]]`).join(', ')}`).join(`\n`)}
</div>
|-
|-
|}
`
}).join(`\n`)};
