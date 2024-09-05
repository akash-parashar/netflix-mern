import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ENV_VARS } from "../config/envVars.js";

//making function protectRoute to check if user is valid and logged in by using jwt verify
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies["jwt-netflix"];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "unauthorized - no token provided" });
    }
    const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);

    if (!decoded) {
      return res
        .status(401)
        .json({ success: false, message: "unauthorized - invalid token" });
    }
    const user = await User.findById(decoded.userId).select("-password");
    //if not user
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "unauthorized - user not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
