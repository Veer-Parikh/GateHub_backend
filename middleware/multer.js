const multer = require('multer');
const {v4 : uuidv4} = require('uuid')
const path = require('path')
const fs = require('fs')

// Resolve relative to this file (not the process CWD) and make sure it exists.
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,UPLOAD_DIR)
    },
    filename: function(req,file,cb){
        cb(null,`${uuidv4()}_${path.extname(file.originalname)}`);
    }
})

const filter = (req,file,cb) =>{
    const allowedTypes = ["image/jpeg","image/png","image/jpg","application/pdf"]

    if(allowedTypes.includes(file.mimetype)){
        cb(null,true)
    } else {
        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'))
    }
}

const uploadMiddleware = multer({
    storage,
    fileFilter: filter,
    limits: {
      fileSize: Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024),
      files: 1,
      fields: 20,
    },
  });


module.exports = uploadMiddleware
