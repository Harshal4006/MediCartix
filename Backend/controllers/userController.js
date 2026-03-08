import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";


// Create Token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
};


// REGISTER USER

const registerUser = async (req, res) => {

    const { name, email, password } = req.body;

    try {

        if (!name || !email || !password) {
            return res.json({
                success:false,
                message:"All Fields Required"
            });
        }

        const exist = await userModel.findOne({ email });

        if (exist) {
            return res.json({
                success:false,
                message:"User Already Exists"
            });
        }

        if (!validator.isEmail(email)) {
            return res.json({
                success:false,
                message:"Invalid Email"
            });
        }

        if (password.length < 8) {
            return res.json({
                success:false,
                message:"Password Must Be 8 Characters"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        });

        const user = await newUser.save();

        const token = createToken(user._id);

        res.json({
            success:true,
            token
        });

    } catch (error) {
        console.log(error);
        res.json({ success:false, message:"Error" });
    }
};


// LOGIN USER 

const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success:false,
                message:"User Not Found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success:false,
                message:"Invalid Credentials"
            });
        }

        const token = createToken(user._id);

        return res.status(200).json({
            success:true,
            token
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Server Error"
        });
    }
};

export { registerUser, loginUser };