const fs = require('fs');
const path = require('path');
const { uploadBufferToCloudinary } = require('../services/cloudinary');

async function uploadSiteIcon() {
    const iconPath = path.join(__dirname, '..', 'images', 'portfolio.png');
    const iconBuffer = fs.readFileSync(iconPath);

    const uploaded = await uploadBufferToCloudinary({
        buffer: iconBuffer,
        folder: 'portfolio/site-assets',
        originalName: process.env.CLOUDINARY_SITE_ICON_NAME || 'portfolio.png'
    });

    console.log(`Site icon uploaded to Cloudinary: ${uploaded.secureUrl}`);
    console.log('Store the returned secure URL in your site icon setting if you want to reuse it directly.');
}

uploadSiteIcon().catch((error) => {
    console.error('Failed to upload site icon:', error.message);
    process.exit(1);
});