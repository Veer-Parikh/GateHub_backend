const multer = require('multer');
const {v4 : uuidv4} = require('uuid')
const path = require('path')

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"../uploads")
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
        cb(null,false)
    }
}

const uploadMiddleware = multer({ 
    storage,
    fileFilter: filter,
  });


module.exports = uploadMiddleware