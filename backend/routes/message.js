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
router.delete(
	"/clearChat/:chatId",
	authorization,
	wrapAsync(messageController.clearChat)
);
router.post(
	"/deleteMessage",
	authorization,
	wrapAsync(messageController.deleteMessage)
);
router.get("/:chatId", authorization, wrapAsync(messageController.allMessage));

module.exports = router;
