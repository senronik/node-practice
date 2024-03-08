import express from "express";
import { configDB } from "./ConfigureDb/configureDb.js";
import dotenv from 'dotenv';
import authRouter from "./src/Authentication/Router/authRouter.js";
import productRouter from "./src/Crud/Router/crudRouter.js";
import pdfRouter from "./src/PdfGenerator/Router/pdfRouter.js";
import cors from "cors"
dotenv.config({ silent: process.env.NODE_ENV === 'production' });
const PORT = process.env.PORT;
const app = express();
app.use(cors());
app.use(express.json());


app.use(authRouter);
app.use("/api/product", productRouter);
app.use(pdfRouter)

app.listen(PORT, () => {
        configDB();
        console.log(`Server is Running ${PORT}`);
})