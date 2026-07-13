const crypto = require('crypto');
const path = require('path');
const cloudinary = require('cloudinary').v2;

function assertCloudinaryConfigured() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const missing = [];

    if (!cloudName) missing.push('CLOUDINARY_CLOUD_NAME');
    if (!apiKey) missing.push('CLOUDINARY_API_KEY');
    if (!apiSecret) missing.push('CLOUDINARY_API_SECRET');

    if (missing.length > 0) {
        throw new Error(`Cloudinary is not configured: missing ${missing.join(', ')}`);
    }

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true
    });
}

function buildPublicId(folder, originalName) {
    const extension = path.extname(originalName || '').toLowerCase();
    const baseName = path.basename(originalName || 'image', extension).replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    return `${folder}/${baseName || 'image'}-${uniqueSuffix}`;
}

async function uploadBufferToCloudinary({ buffer, folder, originalName }) {
    assertCloudinaryConfigured();
    const publicId = buildPublicId(folder, originalName);

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: path.basename(publicId),
                overwrite: true,
                resource_type: 'image'
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve({
                    publicId: result.public_id,
                    secureUrl: result.secure_url
                });
            }
        );

        uploadStream.end(buffer);
    });
}

function getCloudinaryAssetUrl(publicId) {
    assertCloudinaryConfigured();
    return cloudinary.url(publicId, {
        secure: true,
        resource_type: 'image'
    });
}

module.exports = {
    buildPublicId,
    getCloudinaryAssetUrl,
    uploadBufferToCloudinary
};