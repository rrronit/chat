const asyncHandler = require("../Middleware/async_handler");
const verifiedUser = require("../Schema/verifiedSchema");
const sendToken = require("../Utils/JWTtoken");
const bcrypt = require("bcrypt");
const ErrorHandler = require("../Utils/ErrorHandler");
const jwt = require("jsonwebtoken");

const sendMail = require("../Utils/sendMail");

exports.registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  let user = await verifiedUser.findOne({ Email: email.toLowerCase() });

  if (user !== null) {
    return next(new ErrorHandler("User already Exist", 400));
  }

  hashedPassword = await bcrypt.hash(password, 10);

  user = await verifiedUser.create({
    Name: name,
    Email: email.toLowerCase(),
    Password: hashedPassword,
  });

  const OTP = Math.floor(Math.random() * 9000 + 1000);
  user.OTPVerification = OTP;
  user.OTPExpireTime = new Date(Date.now() + 600000);

  await user.save();

  try {
    await sendMail(email, OTP.toString());
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
  res.json({ success: true, message: "otp sent" });
});

exports.verifyOTP = asyncHandler(async (req, res, next) => {
  const { Email, OTP } = req.body;
  const user = await verifiedUser.findOne({
    Email: Email,
    Verified: false,
    OTPExpireTime: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("User not found", 500));
  }
  const OTPMatched = user.OTPVerification === parseInt(OTP);
  if (!OTPMatched) {
    return next(new ErrorHandler("OTP not matched", 404));
  }

  user.Verified = true;
  user.OTPExpireTime = undefined;
  user.OTPVerification = undefined;
  await user.save();
  sendToken(user, 201, res, req);
});

exports.sendOTP = asyncHandler(async (req, res, next) => {
  const Email = req.body.Email.toLowerCase();
  const OTP = Math.floor(Math.random() * 9000 + 1000);

  let user = await verifiedUser.findOne({ Email: Email.toLowerCase() });

  if (!user) {
    return next(new ErrorHandler("User not found", 500));
  }

  user.OTPVerification = OTP;
  user.OTPExpireTime = new Date(Date.now() + 600000);

  await user.save();

  try {
    await sendMail(Email, OTP.toString());
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
  res.json({ success: true, message: "otp sent" });
});

exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await verifiedUser
    .findOne({ Email: email.toLowerCase(), Verified: true })
    .select("+Password");
  if (!user) {
    return next(new ErrorHandler("Invalid User and Password", 404));
  }

  const comparePass = await bcrypt.compare(password, user.Password);

  if (!comparePass) {
    return next(new ErrorHandler("Invalid User and Password", 404));
  }
  sendToken(user, 201, res, req);
});

exports.logoutUser = asyncHandler(async (req, res, next) => {
  req.user = null;
  res
    .cookie("token", null, {
      expiresIn: Date.now(),
      httpOnly: true,
    })
    .status(201)

    .json({
      success: true,
      message: "logout successfully",
    });
});

exports.verifyUser = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("token not found", 500));
  }

  const id = jwt.verify(token, process.env.JWT_SECRET_KEY);
  if (!id) {
    return next(new ErrorHandler("token is wrong", 500));
  }

  const user = await verifiedUser.findById(id.id);
  if (!user) {
    return next(new ErrorHandler("User not found", 500));
  }

  res.status(201).json({
    success: true,
    user,
  });
});
