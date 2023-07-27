const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const verifiedUserSchema = mongoose.Schema({
  Name: {
    type: String,
    required: [true, "Enter Name"],
  },
  Email: {
    type: String,
    required: [true, "Enter Email"],
    unique: true,
  },
  Password: {
    type: String,
    required: [true, "Enter Password"],
    select:false
  },
  
  OTPVerification: {
    type: Number,
  },
  OTPExpireTime: {
    type: Date,
  },
  Verified: {
    type: Boolean,
    default: false
  },
  Online:{
    type:Boolean,
    default:false
  }
});
verifiedUserSchema.methods.getJWTtoken = async function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY);
};

verifiedUserSchema.methods.comparePassword =()=> async function (password) {
  return await bcrypt.compare(this.Password, password);
};


module.exports = mongoose.model("verifiedUser", verifiedUserSchema);
