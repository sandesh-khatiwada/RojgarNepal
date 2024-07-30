import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'documents/'); // Ensure this directory exists or adjust path
  },
  filename: (req, file, cb) => {
    // Generate custom file names based on the form field name and the original file extension
    const fileExtension = path.extname(file.originalname);
    const fieldName = file.fieldname;
    let fileName;

    switch (fieldName) {
      case 'identity-doc':
        fileName = `${req.body.email}-identityDoc${fileExtension}`;
        break;
      case 'work-doc1':
        fileName = `${req.body.email}-workDoc1${fileExtension}`;
        break;
      case 'work-doc2':
        fileName = `${req.body.email}-workDoc2${fileExtension}`;
        break;
      default:
        fileName = `${Date.now()}-${file.originalname}`;
    }

    cb(null, fileName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'));
    }
  }
});

export default upload;
