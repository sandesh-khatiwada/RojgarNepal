import multer from "multer";
import path from "path";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
    
const __dirname = dirname(fileURLToPath(import.meta.url));

import { userType,email } from "../routes/userRoute.js";


// Define storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
 
    cb(null,path.join(__dirname,"../uploads/"));

      
    },
    filename: function (req, file, cb) {
      cb(null, `${userType}-${email}`) // File name
    }
  })
  
  // Define custom file filter for image files
  const imageFilter = function (req, file, cb) {
    // Accept image files with jpg, jpeg, or png extensions
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
  
  // Initialize Multer with the storage and file filter configuration
  const upload = multer({ 
    storage: storage,
    fileFilter: imageFilter
  });




  export default upload;
