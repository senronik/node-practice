import express from "express";
import { generatePDF } from "../Controller/pdfController.js";
const pdfRouter = express.Router();
pdfRouter.get("/pdf-generate/:id",generatePDF);
export default pdfRouter;