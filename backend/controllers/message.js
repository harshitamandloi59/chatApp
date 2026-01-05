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
  const userId = req.user._id;

  const messages = await Message.find({ 
    chat: chatId,
    hiddenFor: { $ne: userId } // Exclude messages hidden for current user
  })
    .populate("sender", "-password")
    .populate("chat")
    .populate("seenBy.user", "firstName lastName");

  return res.status(200).json({ data: messages });
};

const clearChat = async (req, res) => {
  console.log("🟢 CLEAR CHAT HIT");
  console.log("CHAT ID =", req.params.chatId);
  console.log("USER ID =", req.user._id);
  
  try {
    const chatId = req.params.chatId;
    
    if (!chatId) {
      return res.status(400).json({ message: "Chat ID is required" });
    }
    
    // Hide messages for current user instead of deleting them
    const result = await Message.updateMany(
      { 
        chat: chatId,
        hiddenFor: { $ne: req.user._id } // Only update if not already hidden for this user
      },
      { 
        $push: { hiddenFor: req.user._id }
      }
    );
    
    console.log("MESSAGES HIDDEN FOR USER =", result.modifiedCount);
    
    return res.status(200).json({ 
      message: "success",
      hiddenCount: result.modifiedCount
    });
  } catch (error) {
    console.error("CLEAR CHAT ERROR =", error);
    return res.status(500).json({ message: "Failed to clear chat" });
  }
};

const deleteMessage = async (req, res) => {
  
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
    
    return res.status(200).json({ 
      message: "success",
      deletedMessageId: messageId
    });
  } catch (error) {
    console.error("DELETE MESSAGE ERROR =", error);
    return res.status(500).json({ message: "Failed to delete message" });
  }
};

const markMessageSeen = async (req, res) => {
  console.log("🟢 MARK MESSAGE SEEN HIT");
  console.log("REQUEST BODY =", req.body);
  console.log("USER ID =", req.user._id);
  
  try {
    const { messageIds } = req.body; // Array of message IDs
    
    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({ message: "Message IDs array is required" });
    }
    
    // Update multiple messages to mark as seen by current user
    const result = await Message.updateMany(
      { 
        _id: { $in: messageIds },
        "seenBy.user": { $ne: req.user._id } // Only if not already seen by this user
      },
      { 
        $push: { 
          seenBy: { 
            user: req.user._id, 
            seenAt: new Date() 
          } 
        } 
      }
    );
    
    console.log("MESSAGES MARKED AS SEEN =", result.modifiedCount);
    
    return res.status(200).json({ 
      message: "success",
      markedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("MARK MESSAGE SEEN ERROR =", error);
    return res.status(500).json({ message: "Failed to mark messages as seen" });
  }
};

module.exports = { createMessage, allMessage, clearChat, deleteMessage, markMessageSeen };
