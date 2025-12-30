const express = require("express");
const router = express.Router();
const wrapAsync = require("../middlewares/wrapAsync");
const { authorization } = require("../middlewares/authorization");
const messageController = require("../controllers/message");
const upload = require("../config/multer");
router.post(
  "/",
  authorization,
  upload.single("file"),
  (req, res, next) => {
    console.log("📩 MESSAGE ROUTE HIT");
    next();
  },
  wrapAsync(messageController.createMessage)
);
router.get("/:chatId", authorization, wrapAsync(messageController.allMessage));
router.get(
	"/clearChat/:chatId",
	authorization,
	wrapAsync(messageController.clearChat)
);

module.exports = router;
