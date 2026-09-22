import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads base, equipment, and workers subdirectories exist
const baseUploadDir = path.join(process.cwd(), 'uploads');
const equipmentDir = path.join(baseUploadDir, 'equipment');
const workersDir = path.join(baseUploadDir, 'workers');
const jobsDir = path.join(baseUploadDir, 'jobs');

[baseUploadDir, equipmentDir, workersDir, jobsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Dynamic Storage Configuration based on Category
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const isWorkforce = 
      req.body.category === 'Agricultural Skilled Workforce' || 
      req.body.category === 'human_labor';

    const targetDir = isWorkforce ? workersDir : equipmentDir;
    cb(null, targetDir);
  },
  filename(req, file, cb) {
    const isWorkforce = 
      req.body.category === 'Agricultural Skilled Workforce' || 
      req.body.category === 'human_labor';

    const prefix = isWorkforce ? 'worker' : 'equipment';
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  }
});

// File type filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|avif/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

const jobPhotoStorage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, jobsDir);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `job-${uniqueSuffix}${ext}`);
  }
});

export const uploadJobPhoto = multer({
  storage: jobPhotoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});
