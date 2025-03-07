const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

// Dynamic storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const  {productCategory}  = req.body; // Assuming the product category is sent in the request body
        const uploadPath = path.join(__dirname, "public/images", productCategory);
        
        // Ensure the directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true }); // Create directory if it doesn't exist
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        crypto.randomBytes(12, (err, bytes) => {
            if (err) return cb(err); // Handle error
            const fn = bytes.toString("hex") + path.extname(file.originalname);
            cb(null, fn);
        });
    }
});

const upload = multer({ storage });

// Export the upload middleware
module.exports = upload;
