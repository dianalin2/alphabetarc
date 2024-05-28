import express from "express";
import dotenv from "dotenv";
import apiRouter from "./api.js";

dotenv.config();

const app = express();

app.set("view engine", "ejs");

app.use("/api/v1", apiRouter);

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
