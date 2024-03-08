import express from "express";
import { changePassword, forgetPassword, login, saveRegister, updateRegisterData, verifyEmail, verifyOptByEmail } from "../Controller/authController.js";
import multer from "multer";
import path from "path";
const authRouter = express.Router();
const storage = multer.diskStorage(
    {
        destination: './src/Images',
        filename: (req, file, cb) => {
            return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
        }
    }
)
authRouter.use(express.static('src/Images'));
const upload = multer({ storage: storage });
authRouter.post("/register",upload.single('file'), saveRegister);
authRouter.post("/verifyemail/:token", verifyEmail);
authRouter.post("/login", login);
authRouter.post("/verify-otp",verifyOptByEmail);
authRouter.post("/forgetpassoword", forgetPassword);
authRouter.put("/change-password/:id", changePassword)
authRouter.put("/update/user/:id",upload.single('file'),updateRegisterData)
export default authRouter;