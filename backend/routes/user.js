const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/user");
const wrapAsync = require("../middlewares/wrapAsync");
const { authorization } = require("../middlewares/authorization");
const upload = require("../config/multer");

router.get("/profile", authorization, wrapAsync(userControllers.getAuthUser));
router.get("/users", authorization, wrapAsync(userControllers.getAllUsers));
router.put("/profile", authorization, upload.single("profileImage"), wrapAsync(userControllers.updateProfile));

module.exports = router;
