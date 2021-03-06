import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { menuRoutes, userRoutes } from "./routes";
import authenticateJWT from "./middleware/middleware";

const app = express();

const PORT: string | number = process.env.PORT || 4500;

app.use(cors());
app.use(express.json());

app.use(userRoutes);

app.use(authenticateJWT);

app.use(menuRoutes);

const uri: string = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.raz9g.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
mongoose
  .connect(uri)
  .then(() =>
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    )
  )
  .catch((error) => {
    throw error;
  });
