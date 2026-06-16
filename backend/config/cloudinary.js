import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const saveLocally = async (buffer, folder) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Format folder name for safe filename
  const cleanFolder = folder.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${cleanFolder}_${Date.now()}_${Math.round(Math.random() * 1E9)}.jpg`;
  const filePath = path.join(uploadsDir, filename);
  
  fs.writeFileSync(filePath, buffer);
  
  return {
    url: `/uploads/${filename}`,
    public_id: `local_${filename}`
  };
};

const uploadToCloudinary = async (filePath, folder = 'aura') => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'demo') {
    const buffer = fs.readFileSync(filePath);
    return saveLocally(buffer, folder);
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    });
    return { url: result.secure_url, public_id: result.public_id };
  } catch (error) {
    console.warn('Cloudinary upload failed, falling back to local storage:', error);
    const buffer = fs.readFileSync(filePath);
    return saveLocally(buffer, folder);
  }
};

const uploadStreamToCloudinary = (buffer, folder = 'aura') => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'demo') {
    return saveLocally(buffer, folder);
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => {
        if (error) {
          console.warn('Cloudinary upload stream failed, falling back to local storage:', error);
          saveLocally(buffer, folder).then(resolve).catch(reject);
        } else {
          resolve({ url: result.secure_url, public_id: result.public_id });
        }
      }
    );
    stream.end(buffer);
  });
};

const deleteFromCloudinary = async (public_id) => {
  if (public_id && public_id.startsWith('local_')) {
    const filename = public_id.replace('local_', '');
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return;
  }

  try {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'demo') {
      await cloudinary.uploader.destroy(public_id);
    }
  } catch (err) {
    console.error('Failed to delete from Cloudinary:', err);
  }
};

export { cloudinary, uploadToCloudinary, uploadStreamToCloudinary, deleteFromCloudinary };
// Trigger nodemon restart after freeing port 5000


