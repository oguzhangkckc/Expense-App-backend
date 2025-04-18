const express = require("express");
const { addImage, getImage } = require("../controllers/image");
const imageRouter = express.Router();
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + '.jpg')
    }
  });

const upload = multer({ storage: storage });

imageRouter.post("/add-image/:email", upload.single('image'), addImage);
imageRouter.get("/get-image/:email", upload.single('image'),getImage);


module.exports = imageRouter;
