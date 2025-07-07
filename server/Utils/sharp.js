const sharp = require("sharp");

exports.resizeImages = async (files, width, height) => {
  let imageBuffers = [];
  await Promise.all(
    files.map(async (image) => {
      const buffer = await sharp(image.buffer)
        .resize(width, height)
        .toFormat("jpeg")
        .toBuffer();

      imageBuffers.push(buffer);
    })
  );
  return imageBuffers;
};
