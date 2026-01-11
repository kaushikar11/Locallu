const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload profile picture to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} folder - Folder name in Cloudinary (e.g., 'locallu-dps')
 * @param {string} publicId - Public ID for the image (e.g., businessId or employeeId)
 * @param {string} mimetype - MIME type of the file
 * @returns {Promise<string>} - Public URL of the uploaded image
 */
const uploadProfilePicture = async (fileBuffer, folder, publicId, mimetype) => {
  try {
    // Convert buffer to base64 data URI for Cloudinary
    const base64Data = fileBuffer.toString('base64');
    const dataUri = `data:${mimetype};base64,${base64Data}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: folder,
      public_id: publicId,
      resource_type: 'image',
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ],
      overwrite: true
    });

    console.log('Cloudinary upload successful:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<void>}
 */
const deleteProfilePicture = async (publicId, folder) => {
  try {
    const fullPublicId = `${folder}/${publicId}`;
    const result = await cloudinary.uploader.destroy(fullPublicId);
    console.log('Cloudinary delete result:', result);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

module.exports = {
  uploadProfilePicture,
  deleteProfilePicture
};

