import { Response, Request, NextFunction } from "express";
import { IUser } from "../types/user";

const jwt = require('jsonwebtoken');


const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const [header, token] = authHeader.split(' ');

    if (!(header && token)) {
      return res.status(401).send("Authentication credentials are required.")
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err: Error, user: IUser) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

export default authenticateJWT;
