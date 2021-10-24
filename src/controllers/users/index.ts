import { Response, Request } from "express";
import { IUser } from "../../types/user";
import User from "../../models/user"

const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
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

    const user: IUser = new User({
      username: username,
    });

    const salt = await bcrypt.genSalt(10);
    // now we set user password to hashed password
    user.password = await bcrypt.hash(password, salt);

    user.save().then(
      (doc) => {
        // Generating Access and refresh token
        const token = jwt.sign(
          { user_id: doc._id, username },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "5min",
          }
        );

        const refreshToken = jwt.sign(
          { user_id: doc._id, username },
          process.env.JWT_SECRET_KEY
        );

        refreshTokens.push(refreshToken);

        res.status(201).json({
          user: doc,
          token: token,
          refresh: refreshToken
        });
      }
    );


  } catch (error) {
    throw error;
  }
};

export {registerUser};
