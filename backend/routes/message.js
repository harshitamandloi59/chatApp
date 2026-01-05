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
router.post(
	"/markSeen",
	authorization,
	wrapAsync(messageController.markMessageSeen)
);
router.get("/:chatId", authorization, wrapAsync(messageController.allMessage));

module.exports = router;
