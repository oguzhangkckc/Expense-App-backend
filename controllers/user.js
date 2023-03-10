const User = require("../models/user");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found, with the given email!",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Email/passwords does not match!" });
    }

    const token = createToken(user._id);
    res.status(200).json({ email, token });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while logging in the user" });
  }
};

exports.register = async (req, res) => {
  console.log(req.body);
  const { fullname, password, email } = req.body;

  if (!fullname || !password || !email) {
    return res
      .status(400)
      .json({ success: false, message: "Please fill all fields" });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  const exist = await User.findOne({ email: email });
  if (exist) {
    return res
      .status(400)
      .json({ success: false, message: "User already exists!" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    fullname: fullname,
    password: hashedPassword,
    email: email,
  });

  res.status(201).json(newUser);
};

exports.getProfile = async (req, res) => {
  
  const { id } = req.params;
  console.log(req.body);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ msg: "User id not found!" });
  }

  const user = await User.findById(id).populate("user",[ "fullname", "email"])

  if(!user) {
    return res.status(404).json({ msg: "User not found!" });
  }
  res.status(200).json(user);
};

exports.resetPassword = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found, with the given email!",
      });
    }
    
    const reset = await User.findOneAndReplace(user.password, password);
    if (!reset) {
      return res.status(400).json({
        success: false,
        message: "Password reset failed!",
      });
    }
    res.status(200).json({ email, reset });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while resetting password" });
  }
};



