import e, { Response, Request } from "express";
import { IUser } from "../../types/user";
import User from "../../models/user"
import { IMenu } from "../../types/menu";

const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const refreshTokens: string[] = [];

const registerUser = async (req: Request, res: Response): Promise<e.Response<any, Record<string, any>>> => {
  try {
    const { username, password} = req.body;
    if (!(username && password)) {
      return res.status(400).send("All inputs are required");
    }

    // Checking if the user already exists

    const oldUser = await User.findOne({ username });

    if (oldUser) {
      return res.status(400).send("User Already Exist. Please Login");
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
          { user_id: doc._id, username: username },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "5min",
          }
        );

        const refreshToken = jwt.sign(
          { user_id: doc._id, username: username },
          process.env.JWT_SECRET_KEY,
        );

        refreshTokens.push(refreshToken);

        return res.status(201).json({
          user: doc,
          token: token,
          refresh: refreshToken
        });
      }
    );

    return res.status(400).send('Unable to create user')

  } catch (error) {
    throw error;
  }
};

const loginUser = async (req: Request, res: Response): Promise<e.Response<any, Record<string, any>>> => {
  try {
    const { username, password} = req.body;
    if (!(username && password)) {
      return res.status(400).send("All inputs are required");
    }

    // Checking if the user exists

    const user: IUser | null = await User.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, username: username },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "5min",
        }
      );

      const refreshToken = jwt.sign(
        { user_id: user._id, username: username },
        process.env.JWT_SECRET_KEY
      );

      refreshTokens.push(refreshToken);

      // user
      return res.status(200).json({
        user: user,
        token: token,
        refresh: refreshToken
      });
    }

    return res.status(400).send('Invalid Credentials');

  } catch (error) {
    throw error;
  }
};

const retrieveToken = async (req: Request, res: Response): Promise<e.Response<any, Record<string, any>>> => {
  try {
    const { refresh } = req.body;
    if (!refresh) {
      return res.status(400).send("A refresh token is required");
    }

    if (!refreshTokens.includes(refresh)){
      return res.status(403).send("Refresh Invalid. Please login.");
    }

    jwt.verify(refresh,           process.env.JWT_SECRET_KEY,
      (err: Error, user: IUser) => {
      if (err) {
        return res.sendStatus(403);
      }

      const token = jwt.sign(
        { user_id: user._id, username: user.username },
        ")a(s3eihu+iir-_3@##ha$r$d4p5%!%e1==#b5jwif)z&kmm@7",
        {
          expiresIn: "5min",
        }
      );

      return res.status(201).send({
        token: token
      });
    });

    return res.status(400).send('Invalid Credentials');

  } catch (error) {
    throw error;
  }
};



export {registerUser, loginUser, retrieveToken};
