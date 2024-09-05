import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";

export async function signup(req, res) {
  try {
    const { email, password, username } = req.body;
    //checking if something is empty
    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ success: false, message: "all fields are required" });
    }
    //email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //checking email is correct or not
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "invalid email" });
    }
    //password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "password must be at least 6" });
    }
    //to check if user already exist
    const existingUserByEmail = await User.findOne({ email: email });

    if (existingUserByEmail) {
      return res
        .status(400)
        .json({ success: false, message: "email already exist" });
    }

    //to check existing user by username
    const existingUserByUsername = await User.findOne({ username: username });
    //hash password using bcrypt and make salt
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    if (existingUserByUsername) {
      return res
        .status(400)
        .json({ success: false, message: "username already exist" });
    }

    //randome image
    const PROFILE_PICS = ["/avatar1.png", "/avatar2.png", "/avatar3.png"];

    const image = PROFILE_PICS[Math.floor(Math.random() * PROFILE_PICS.length)];

    //making new user
    const newUser = new User({
      email,
      password: hashedPassword,
      username,
      image,
    });
    //using jwwt saving user

    generateTokenAndSetCookie(newUser._id, res);
    //save user
    await newUser.save();
    //sending res and removing password
    res.status(201).json({
      success: true,
      message: "user created successfully",
      user: {
        ...newUser._doc,
        password: "",
      },
    });
  } catch (error) {
    //if there is error in sign up
    console.log("Error in signup controller", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcryptjs.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      success: true,
      user: {
        ...user._doc,
        password: "",
      },
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
export async function logout(req, res) {
  try {
    res.clearCookie("jwt-netflix");
    res.status(200).json({ success: true, message: "logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function authCheck(req, res) {
  try {
    console.log("req.user:", req.user);
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    console.log("Error in authCheck controller", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
