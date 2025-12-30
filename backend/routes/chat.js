const express = require("express");
const router = express.Router();
const wrapAsync = require("../middlewares/wrapAsync");
const { authorization } = require("../middlewares/authorization");
const chatController = require("../controllers/chat");
const upload = require("../config/multer");

router.post("/", authorization, wrapAsync(chatController.postChat));
router.get("/", authorization, wrapAsync(chatController.getChat));

router.post("/group", authorization, upload.single("groupImage"), wrapAsync(chatController.createGroup));
router.post("/updateGroupImage", authorization, upload.single("groupImage"), wrapAsync(chatController.updateGroupImage));
router.delete(
	"/deleteGroup/:chatId",
	authorization,
	wrapAsync(chatController.deleteGroup)
);
router.post("/rename", authorization, wrapAsync(chatController.renameGroup));
router.post(
	"/groupremove",
	authorization,
	wrapAsync(chatController.removeFromGroup)
);
router.post("/groupadd", authorization, wrapAsync(chatController.addToGroup));

module.exports = router;
