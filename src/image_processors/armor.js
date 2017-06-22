const FileUtils = require('../utils/file');
const Jimp = require('jimp')
const Promise = require('bluebird')

const frackinFile = FileUtils.frackinFile;

// Separate the icons file into each part icon
const processIcons = (icons, kind, finalPath) => {
  return new Promise(function(resolve, reject) {
    Jimp.read(frackinFile(icons))
        .then((icons) => {
          if (kind === 'head') {
            icons.crop(0, 0, 16, 16).write(`${finalPath}iconhead.png`);
          } else if (kind === 'chest') {
            icons.crop(16, 0, 16, 16).write(`${finalPath}iconchest.png`);
          } else if (kind === 'pants') {
            icons.crop(32, 0, 16, 16).write(`${finalPath}iconpants.png`);
          }
          return resolve();
        });
  });
}

// Replace the dummy colors for the correc ones
const replaceColors = (image, colorOptions) => {
  if (colorOptions &&  colorOptions[0]) {
		image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
			const red   = this.bitmap.data[ idx + 0 ];
			const green = this.bitmap.data[ idx + 1 ];
			const blue  = this.bitmap.data[ idx + 2 ];
			const alpha = this.bitmap.data[ idx + 3 ];

      Object.keys(colorOptions[0]).forEach((k) => {
        const src = Jimp.intToRGBA(parseInt(`0x${k}ff`))
        const dst = Jimp.intToRGBA(parseInt(`0x${colorOptions[0][k]}ff`))

        if (red === src.r && green === src.g && blue === src.b) {
          this.bitmap.data[ idx + 0 ] = dst.r;
          this.bitmap.data[ idx + 1 ] = dst.g;
          this.bitmap.data[ idx + 2 ] = dst.b;
        }
      });
		});
  }
  return image;
}

// Generate the fullSet png
const processArmor = (parts, finalPath) => {
  return new Promise(function(resolve, reject) {
    Promise.all([
      Jimp.read("./mannequin.png"),
      Jimp.read(frackinFile(parts.pants.image)),
      Jimp.read(frackinFile(parts.bsleeve.image)),
      Jimp.read(frackinFile(parts.chest.image)),
      Jimp.read(frackinFile(parts.fsleeve.image)),
      Jimp.read(frackinFile(parts.head.image))
    ]).then((images) => {
      images.forEach((i) => i.crop(43, 0, 43, 43));

      new Jimp(43, 43, (e, img) => console.error(e))
        .composite(replaceColors(images[0], parts.pants.colors), 0, 2)
        .composite(replaceColors(images[1], parts.pants.colors), 0, 0)
        .composite(replaceColors(images[2], parts.bsleeve.colors), 0, 0)
        .composite(replaceColors(images[3], parts.chest.colors), 0, 0)
        .composite(replaceColors(images[4], parts.fsleeve.colors), 0, 0)
        .composite(replaceColors(images[5], parts.head.colors), 0, 0)
        .write(finalPath)
      resolve();
    })
    .catch(reject);
  });
}

module.exports = {
  processArmor,
  processIcons
}
