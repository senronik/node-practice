import { StatusCodes } from "http-status-codes";
import { registersModel } from "../Model/authModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import nodemailer from "nodemailer";
import { generateEmailTemplate } from "../../EmailTemplate/emailTemplate.js";
dotenv.config({ silent: process.env.NODE_ENV === 'production' });
const SECRET_KEY = process.env.SECRET_KEY;
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;
const GMAIL = process.env.GMAIL;
export async function saveRegister(req, res) {
    try {
        const userData = await registersModel.findOne({ email: req.body.email, role: req.body.role });
        if (userData) {
            res.status(StatusCodes.BAD_REQUEST).json("Email Already Register");
        }
        else {
            let file = ''
            if (req.file) {
                file = `${process.env.URL}/${req.file.filename}`;
                req.body['file'] = file;
            }
            const newpassword = bcrypt.hashSync(req.body.password, 12);
            req.body['password'] = newpassword;
            const data = new registersModel(req.body);
            const response = await data.save();
            const token = jwt.sign({ objId: response._id }, SECRET_KEY);
            const updtedData = await registersModel.findByIdAndUpdate(response._id, { isActive: token }, { new: true });
            const emailTemplate = await generateEmailTemplate(token, "Verify Email", "Please verify your email by clicking the link below:", "verifyemail");
            let transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: GMAIL,
                    pass: GMAIL_PASSWORD,
                },
            });
            let info = await transporter.sendMail({
                from: GMAIL,
                to: req.body.email,
                subject: "Verify Email",
                html: emailTemplate
            });
            console.log('Message sent: %s', info.messageId);
            res.status(StatusCodes.CREATED).json(updtedData);
        }
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Server Error' });
    }
}

//verify email
export async function verifyEmail(req, res) {
    try {
        const token = req.params.token
        const data = await registersModel.findOne({ isActive: token });
        console.log(data);
        await registersModel.findByIdAndUpdate(data._id, { isActive: 'active' }, { new: true });
        res.status(StatusCodes.OK).json("Email Verify");
    }
    catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("Registeration Error");

    }
}
export async function login(req, res) {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000);
        const data = await registersModel.findOne({ email: req.body.email, role: req.body.role });

        if (data.isActive === 'active') {
            if (bcrypt.compareSync(req.body.password, data.password)) {
                await registersModel.findByIdAndUpdate(data._id, { otp: otp })
                const token = jwt.sign({ objId: data._id }, SECRET_KEY, { expiresIn: '1h' });
                const emailTemplate = await generateEmailTemplate(token, "Verify Otp", otp, "verify-otp");
                let transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: GMAIL,
                        pass: GMAIL_PASSWORD,
                    },
                });
                let info = await transporter.sendMail({
                    from: GMAIL,
                    to: req.body.email,
                    subject: "Verify Otp",
                    html: emailTemplate
                });
                console.log('Message sent: %s', info.messageId);
                res.status(StatusCodes.OK).json("Send mail");
            }
            else {
                res.status(StatusCodes.BAD_REQUEST).json("Wrong Password")
            }
        }
        else {
            res.status(StatusCodes.BAD_REQUEST).json("Verify Your Account")
        }
    }
    catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("Internal Server Problem");
    }
}
export async function verifyOptByEmail(req, res) {
    try {
         const data = await registersModel.findOne({otp:req.body.otp});
         if(data.otp)
         {
            const token = jwt.sign({ objId: data._id }, SECRET_KEY, { expiresIn: '1h' });
            res.status(StatusCodes.OK).json({token:token,data});
         }
         else{
               res.status(StatusCodes.BAD_REQUEST).json("Wrong OTP")
         }
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("Internal Server Problem");

    }
}
//forgetPassword
export async function forgetPassword(req, res) {
    try {
        const data = await registersModel.findOne({ email: req.body.email });
        if (data) {
            const emailTemplate = await generateEmailTemplate(data._id, "CHange Password", "Please change your email by clicking the link below", "change-password");
            let transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: GMAIL,
                    pass: GMAIL_PASSWORD,
                },
            });
            let info = await transporter.sendMail({
                from: GMAIL,
                to: req.body.email,
                subject: "Change Password",
                html: emailTemplate
            });
            console.log('Message sent: %s', info.messageId);
            res.status(StatusCodes.OK).json("Mail Send");

        }
        else {
            res.status(StatusCodes.NOT_FOUND).json("user not found")
        }

    }
    catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("Internal Server Problem");
    }
}
//changePassword
export async function changePassword(req, res) {
    try {
        const id = req.params.id
        const newpassword = bcrypt.hashSync(req.body.password, 12);
        req.body['password'] = newpassword;
        await registersModel.findByIdAndUpdate(id, { password: req.body.password }, { new: true });
        res.status(StatusCodes.OK).json("Password Changed");

    }
    catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("Internal Server Problem");

    }
}
// Update User Data
export async function updateRegisterData(req, res) {
    try {
        const data = await registersModel.findOne({ email: req.body.email });
        // const newData = req.body;
        if (data.email) {
            if (data.isActive === 'active') {
                let file = ''
                if (req.file) {
                    file = `${process.env.URL}/${req.file.filename}`;
                    req.body['file'] = file;
                } 
                const newpassword = bcrypt.hashSync(req.body.password, 12);
                req.body['password'] = newpassword
                req.body['updatedDate'] = Date.now();
                const newData = req.body;
                const updtedData = await registersModel.findByIdAndUpdate(req.params.id, newData, { new: true });
                if (!updtedData) {
                    res.status(StatusCodes).json("Data not Found");
                }
                res.status(StatusCodes.OK).json(updtedData);
            }
            else {
                res.status(StatusCodes.BAD_REQUEST).json("User not")
            }
        }
        else {
            res.status(StatusCodes.BAD_REQUEST).json("User Not Found");
        }

    }
    catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("Internal Server Error");

    }
}



