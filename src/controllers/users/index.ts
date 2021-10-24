import { Response, Request } from "express";
import { IUser } from "../../types/user";
import User from "../../models/user"
import { IMenu } from "../../types/menu";
import Menu from "../../models/menu";

const bcrypt = require('bcrypt');
const refreshTokens = [];

const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password} = req.body;
    if (!(username && password)) {
      res.status(400).send("All inputs are required");
    }

    // Checking if the user already exists

    const oldUser = await User.findOne({ username });

    if (oldUser) {
      res.status(400).send("User Already Exist. Please Login");
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const user: IUser = new User({
      username: username,
      password: encryptedPassword
    });

    const newUser: IUser = await user.save();

    // Generating Access and refresh token
    const token = jwt.sign(
      { user_id: newUser._id, username },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "5min",
      }
    );

    const refreshToken = jwt.sign(
      { user_id: newUser._id, username },
      process.env.JWT_SECRET_KEY
    );

    refreshTokens.push(refreshToken);

    res.status(201).json({
      user: newUser,
      token: token,
      refresh: refreshToken
    });
  } catch (error) {
    throw error;
  }
};

export {registerUser};
