const { default: mongoose } = require("mongoose");
const { chatList } = require("./message.method");

const Schema = mongoose.Schema;

const messageSchema = Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    seen: { type: Boolean, default: false },
    content: { type: String, required: false, default: '' },
    attachment: { type: Array, required: false },
    status: { type: Number, default: 1 }, 
    chat_id: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
  },
  { timestamps: true }
);

// Methods
messageSchema.statics.chatList = chatList;

module.exports.messageSchema = messageSchema;
