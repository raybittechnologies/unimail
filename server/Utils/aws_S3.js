const { S3Client, ListBucketsCommand, S3 } = require("@aws-sdk/client-s3");

const s3 = new S3({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

exports.uploadProfile = async (file) => {
  const buffer = file[0].buffer;

  const uploadParams = {
    Bucket: "jyotishwanii",
    Key: `profile${Date.now()}.png`,
    Body: buffer,
    ContentType: "image/png",
    // ACL: "public-read",
  };

  try {
    await s3.putObject(uploadParams);

    const urlSnap = uploadParams.Key;

    return urlSnap;
  } catch (error) {
    console.error("Error uploading data: ", error);
  }
};

exports.uploadFile = async (file) => {
  const fileExtension = file[0].originalname.split(".").pop(); // Extract the file extension
  const mimeTypes = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };

  if (!mimeTypes[fileExtension]) {
    throw new Error("Invalid file type. Only PDF and DOCX are allowed.");
  }

  const buffer = file[0].buffer;

  const uploadParams = {
    Bucket: "jyotishwanii",
    Key: `resume-${Date.now()}.${fileExtension}`,
    Body: buffer,
    ContentType: mimeTypes[fileExtension],
  };

  try {
    await s3.putObject(uploadParams);

    const urlSnap = `${uploadParams.Key}`;

    return urlSnap;
  } catch (error) {
    console.error("Error uploading data: ", error);
    throw error;
  }
};

exports.deleteFile = async (fileKey) => {
  const deleteParams = {
    Bucket: "jyotishwanii",
    Key: fileKey,
  };

  try {
    await s3.deleteObject(deleteParams);
    console.log(`File deleted successfully: ${fileKey}`);
    return { success: true, message: `File deleted: ${fileKey}` };
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error(`Failed to delete file: ${fileKey}`);
  }
};

exports.uploadImages = async (files) => {
  let imageUris = [];
  try {
    await Promise.all(
      files.map(async (image) => {
        const uploadParams = {
          Bucket: "jyotishwanii",
          Key: `image${Date.now()}.png`,
          Body: image.buffer,
          ContentType: "image/png",
        };

        await s3.putObject(uploadParams);

        imageUris.push(`${process.env.S3_BASE_URI}/${uploadParams.Key}`);
      })
    );

    return imageUris;
  } catch (error) {
    console.error("Error uploading data: ", error);

    return null;
  }
};
