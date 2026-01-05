const Chat = require("../models/chat");
const Message = require("../models/message");

const postChat = async (req, res) => {
	const { userId } = req.body;
	if (!userId) {
		return res.status(200).json({ message: "userId not provide" });
	}
	const existingChat = await Chat.find({
		isGroupChat: false,
		$and: [
			{ users: { $elemMatch: { $eq: req.user._id } } },
			{ users: { $elemMatch: { $eq: userId } } },
		],
	})
		.populate("users", "-password")
		.populate({
			path: "latestMessage",
			populate: {
				path: "sender",
				select: "-password",
			},
		});

	if (existingChat.length == 0) {
		const chatName = "Messenger";
		const isGroupChat = false;
		const users = [req.user._id, userId];
		const chat = await Chat.create({
			chatName,
			isGroupChat,
			users,
		});
		const chatAll = await Chat.findOne({ _id: chat._id }).populate(
			"users",
			"-password"
		);
		return res.status(200).json({ data: chatAll });
	} else {
		const chat = existingChat[0];
		return res.status(200).json({ data: chat });
	}
};
const getChat = async (req, res) => {
	const chat = await Chat.find({
		users: { $elemMatch: { $eq: req.user._id } },
	})
		.sort({ updatedAt: -1 })
		.populate("users", "-password")
		.populate({
			path: "latestMessage",
			populate: {
				path: "sender",
				select: "-password",
			},
		})
		.populate("groupAdmin", "-password");
	return res.status(200).json({ data: chat });
};
const createGroup = async (req, res) => {
	console.log("🟢 CREATE GROUP HIT");
	console.log("BODY =", req.body);
	console.log("FILE =", req.file);

	if (!req.body.users || !req.body.name) {
		return res.status(400).json({ message: "users and name not provide" });
	}
	
	let users;
	try {
		users = typeof req.body.users === 'string' ? JSON.parse(req.body.users) : req.body.users;
	} catch (error) {
		return res.status(400).json({ message: "Invalid users format" });
	}
	
	if (users.length < 2) {
		return res.status(400).json({ message: "min 2 users required for group" });
	}
	
	users.push(req.user._id);
	
	// Handle group image
	let groupImagePath = null;
	if (req.file) {
		groupImagePath = `/uploads/${req.file.filename}`;
	}
	
	const groupChat = await Chat.create({
		chatName: req.body.name,
		isGroupChat: true,
		users: users,
		groupAdmin: req.user._id,
		groupImage: groupImagePath,
	});
	
	const groups = await Chat.findOne({ _id: groupChat._id })
		.populate("users", "-password")
		.populate("groupAdmin", "-password");
		
	res.status(200).json({ data: groups });
};
const deleteGroup = async (req, res) => {
	console.log("🟢 DELETE GROUP HIT");
	console.log("CHAT ID =", req.params.chatId);
	console.log("USER ID =", req.user._id);
	
	try {
		const chatId = req.params.chatId;
		
		if (!chatId) {
			return res.status(400).json({ message: "Chat ID is required" });
		}
		
		// Check if chat exists and user has permission
		const chat = await Chat.findById(chatId);
		if (!chat) {
			return res.status(404).json({ message: "Chat not found" });
		}
		
		// For group chats, check if user is admin
		if (chat.isGroupChat && chat.groupAdmin.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: "Only group admin can delete group" });
		}
		
		// For individual chats, check if user is part of the chat
		if (!chat.isGroupChat && !chat.users.includes(req.user._id)) {
			return res.status(403).json({ message: "You are not part of this chat" });
		}
		
		// Delete all messages first
		const messageResult = await Message.deleteMany({ chat: chatId });
		console.log("DELETED MESSAGES =", messageResult.deletedCount);
		
		// Delete the chat
		const chatResult = await Chat.deleteOne({ _id: chatId });
		console.log("DELETED CHAT =", chatResult.deletedCount);
		
		return res.status(200).json({ 
			message: "success",
			deletedMessages: messageResult.deletedCount,
			deletedChat: chatResult.deletedCount
		});
	} catch (error) {
		console.error("DELETE GROUP ERROR =", error);
		return res.status(500).json({ message: "Failed to delete chat" });
	}
};
const renameGroup = async (req, res) => {
	const { name, chatId } = req.body;
	if (!name || !chatId) {
		return res.status(200).json({ message: "name and chatId not provide" });
	}
	const chat = await Chat.findByIdAndUpdate(
		chatId,
		{ chatName: name },
		{ new: true }
	)
		.populate("users", "-password")
		.populate("groupAdmin", "-password");
	if (!chat) {
		return res.status(200).json({ message: "chat not found" });
	} else {
		return res.status(200).json({ data: chat });
	}
};
const removeFromGroup = async (req, res) => {
	const { chatId, userId } = req.body;
	if (!chatId || !userId) {
		return res
			.status(200)
			.json({ message: "chatId and userId not provide" });
	}
	const chat = await Chat.findByIdAndUpdate(
		chatId,
		{ $pull: { users: userId } },
		{ new: true }
	)
		.populate("users", "-password")
		.populate("groupAdmin", "-password");
	if (!chat) {
		return res.status(200).json({ message: "chat not found" });
	} else {
		return res.status(200).json({ data: chat });
	}
};
const addToGroup = async (req, res) => {
	const { chatId, userId } = req.body;
	if (!chatId || !userId) {
		return res
			.status(200)
			.json({ message: "chatId and userId not provide" });
	}
	const chat = await Chat.findByIdAndUpdate(
		chatId,
		{ $push: { users: userId } },
		{ new: true }
	)
		.populate("users", "-password")
		.populate("groupAdmin", "-password");
	if (!chat) {
		return res.status(200).json({ message: "chat not found" });
	} else {
		return res.status(200).json({ data: chat });
	}
};

const updateGroupImage = async (req, res) => {
	console.log("🟢 UPDATE GROUP IMAGE HIT");
	console.log("BODY =", req.body);
	console.log("FILE =", req.file);

	const { chatId } = req.body;
	
	if (!chatId) {
		return res.status(400).json({ message: "chatId not provided" });
	}

	if (!req.file) {
		return res.status(400).json({ message: "No image file provided" });
	}

	// Check if user is admin of the group
	const chat = await Chat.findById(chatId);
	if (!chat) {
		return res.status(404).json({ message: "Chat not found" });
	}

	if (chat.groupAdmin.toString() !== req.user._id.toString()) {
		return res.status(403).json({ message: "Only group admin can update group image" });
	}

	// Update group image
	const groupImagePath = `/uploads/${req.file.filename}`;
	
	const updatedChat = await Chat.findByIdAndUpdate(
		chatId,
		{ groupImage: groupImagePath },
		{ new: true }
	)
		.populate("users", "-password")
		.populate("groupAdmin", "-password");

	if (!updatedChat) {
		return res.status(404).json({ message: "Chat not found" });
	}

	res.status(200).json({ 
		message: "Group image updated successfully",
		data: updatedChat 
	});
};

module.exports = {
	postChat,
	getChat,
	createGroup,
	deleteGroup,
	renameGroup,
	removeFromGroup,
	addToGroup,
	updateGroupImage,
};
