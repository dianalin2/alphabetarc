import express from "express";
import dotenv from "dotenv";
import apiRouter from "./api.js";

dotenv.config();

const app = express();

app.set("view engine", "ejs");

app.use("/api/v1", apiRouter);

app.use(express.static("client/build"));

app.get("*", (req, res) => {
    res.sendFile(__dirname + "/client/build/index.html");
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
