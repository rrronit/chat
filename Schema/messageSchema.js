const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    senderID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "verifiedUser",
      required: [true, "enter sender detail"],
     
    },
    senderName:{
      type:String,
      required:[true,"enter username"]
    },

    message: {
      type: String,
      required: [true, "enter sender detail"],
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("messages", messageSchema);
