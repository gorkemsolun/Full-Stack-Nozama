const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

router.post('/register', async (req, res) => { 
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC).toString(),
    });

    try {
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(500).json(err);
    }
    console.log(savedUser);
});

router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({username: req.body.username});
        !user && res.status(401).json("Wrong username or password");
        const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC);
        const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
        originalPassword !== req.body.password && res.status(401).json("Wrong username or password");
        const accessToken = jwt.sign({
            id: user._id,
            idAdmin: user.isAdmin,
        }, 
        process.env.JWT_SEC,
        {expiresIn: "3d"});
        const {password,  ...others} = user._doc;
        res.status(200).json({...others, accessToken});
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;