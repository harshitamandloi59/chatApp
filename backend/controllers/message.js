// const Chat = require("../models/chat");
// const Message = require("../models/message");

// const createMessage = async (req, res) => {
// 	const { message, chatId } = req.body;
// 	if (message) {
// 		const newMessage = await Message.create({
// 			sender: req.user._id,
// 			message: message,
// 			chat: chatId,
// 		});
// 		const chat = await Chat.findByIdAndUpdate(chatId, {
// 			latestMessage: newMessage._id,
// 		});
// 		const fullMessage = await Message.findById(newMessage._id)
// 			.populate("sender", "-password")
// 			.populate({
// 				path: "chat",
// 				populate: { path: "users groupAdmin", select: "-password" },
// 			});
// 		return res.status(201).json({ data: fullMessage });
// 	} else {
// 		return res.status(400).json({ message: "Message not provide" });
// 	}
// };

// const allMessage = async (req, res) => {
// 	const chatId = req.params.chatId;
// 	const messages = await Message.find({ chat: chatId })
// 		.populate("sender", "-password")
// 		.populate("chat");
// 	return res.status(200).json({ data: messages });
// };
// const clearChat = async (req, res) => {
// 	const chatId = req.params.chatId;
// 	await Message.deleteMany({ chat: chatId });
// 	return res.status(200).json({ message: "success" });
// };

// module.exports = { createMessage, allMessage, clearChat };



const Chat = require("../models/chat");
const Message = require("../models/message");

const createMessage = async (req, res) => {
  console.log("🟢 CONTROLLER HIT");
  console.log("BODY =", req.body);
  console.log("FILE =", req.file);

  const { chatId, message } = req.body;

  // ❌ nothing sent
  if (!message && !req.file) {
    return res.status(400).json({ message: "Message or file required" });
  }

  // ✅ file path
  let filePath = null;
  if (req.file) {
    filePath = `/uploads/${req.file.filename}`;
  }

  // ✅ create message
  const newMessage = await Message.create({
    sender: req.user._id,
    message: message || "",
    chat: chatId,
    file: filePath,
  });

  // ✅ update latest message
  await Chat.findByIdAndUpdate(chatId, {
    latestMessage: newMessage._id,
  });

  // ✅ populate response
  const fullMessage = await Message.findById(newMessage._id)
    .populate("sender", "-password")
    .populate({
      path: "chat",
      populate: { path: "users groupAdmin", select: "-password" },
    });

  return res.status(201).json({ data: fullMessage });
};

const allMessage = async (req, res) => {
  const chatId = req.params.chatId;

  const messages = await Message.find({ chat: chatId })
    .populate("sender", "-password")
    .populate("chat");

  return res.status(200).json({ data: messages });
};

const clearChat = async (req, res) => {
  console.log("🟢 CLEAR CHAT HIT");
  console.log("CHAT ID =", req.params.chatId);
  
  try {
    const chatId = req.params.chatId;
    
    if (!chatId) {
      return res.status(400).json({ message: "Chat ID is required" });
    }
    
    const result = await Message.deleteMany({ chat: chatId });
    console.log("DELETED MESSAGES =", result.deletedCount);
    
    return res.status(200).json({ 
      message: "success",
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error("CLEAR CHAT ERROR =", error);
    return res.status(500).json({ message: "Failed to clear chat" });
  }
};

const deleteMessage = async (req, res) => {
  console.log("🟢 DELETE MESSAGE HIT");
  console.log("REQUEST BODY =", req.body);
  console.log("USER ID =", req.user._id);
  
  try {
    const { messageId } = req.body;
    
    if (!messageId) {
      return res.status(400).json({ message: "Message ID is required" });
    }
    
    // Find the message and check if user is the sender
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    // Check if user is the sender of the message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }
    
    // Delete the message
    await Message.findByIdAndDelete(messageId);
    console.log("MESSAGE DELETED =", messageId);
    
    return res.status(200).json({ 
      message: "success",
      deletedMessageId: messageId
    });
  } catch (error) {
    console.error("DELETE MESSAGE ERROR =", error);
    return res.status(500).json({ message: "Failed to delete message" });
  }
};

module.exports = { createMessage, allMessage, clearChat, deleteMessage };
