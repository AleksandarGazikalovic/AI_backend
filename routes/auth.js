const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

//Register
router.post("/register", async (req, res) => {
  try {
    console.log(req.body);
    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json("Email is already in use.");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const dirPath = "./public/";

    const filePath = path.join(dirPath, "user.json");
    fs.writeFileSync(filePath, JSON.stringify(user, null, 2), "utf-8");

    res.status(200).json("success");
  } catch (err) {
    console.log(err);
    res.status(500).json("An error occurred during registration.");
  }
});

//Login
router.post("/login", async (req, res) => {
  try {
    console.log(req.body);
    // find user
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json("User not found");
    }

    // compare password
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      return res.status(400).json("Wrong password");
    }

    // send response
    res.status(200).json("success");
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
