// const mongoose = require("mongoose");

// const messageSchema = mongoose.Schema(
// 	{
// 		sender: {
// 			type: mongoose.Schema.Types.ObjectId,
// 			ref: "User",
// 			required: true,
// 		},
// 		message: {
// 			type: String,
// 			required: true,
// 			trim: true,
// 		},
// 		chat: {
// 			type: mongoose.Schema.Types.ObjectId,
// 			ref: "Chat",
// 			required: true,
// 		},
// 	},
// 	{
// 		timestamps: true,
// 	}
// );

// const Message = mongoose.model("Message", messageSchema);

// module.exports = Message;


const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      trim: true,
      default: "", // ✅ text optional
    },

    file: {
      type: String, // ✅ image / pdf path
      default: null,
    },

    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

    seenBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      seenAt: {
        type: Date,
        default: Date.now,
      }
    }],
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
