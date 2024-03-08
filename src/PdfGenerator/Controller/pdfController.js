import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs'
import ejs from "ejs"
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { productsModel } from '../../Crud/Model/crudModel.js';
import mongoose from 'mongoose';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pdfTemplatePath = path.join(__dirname, '../../View/pdfTemplate.ejs');
export async function generatePDF(req, res) {
    try {
        const Id = new mongoose.Types.ObjectId(req.params.id);
        const data = await productsModel.aggregate([
            {
                $match: { _id: Id }
            },
            {
                $lookup: {
                    from: 'productsimgmodels',
                    localField: '_id',
                    foreignField: 'productId',
                    as: 'images'
                }
            }
        ]);
        
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const templateContent = fs.readFileSync(pdfTemplatePath, 'utf8');
        const renderedHtml = await ejs.render(templateContent, { data });
        await page.setContent(renderedHtml);
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true
        });
        await browser.close();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="pdfTemplate.pdf"');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        return res.status(500).send('Error generating PDF: ' + error.message);
    }
}
