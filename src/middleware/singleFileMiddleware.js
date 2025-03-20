const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function singleFileMiddleware(req, res, next) {
  // Check for query parameters
  if (Object.keys(req.query).length > 0) {
    return res.status(400).json({ message: 'Query parameters not allowed' });
  }

  // Check for authorization headers
  if (req.get("Authorization") || req.get("authentication")) {
    return res.status(400).json({ message: 'Authorization headers not allowed' });
  }

  upload.single("profilePic")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ message: "Unexpected file field" });
      }
      console.error("Multer error:", err);
      return res.status(500).json({ message: "File upload error" });
    }
    next();
  });
}

module.exports = singleFileMiddleware;
