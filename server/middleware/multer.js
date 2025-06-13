import multer from 'multer';

const storage = multer.memoryStorage(); // Store uploaded file in memory for ImageKit

const upload = multer({ storage });

export default upload;
