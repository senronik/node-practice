import { dirname, join } from 'path';
import ejs from "ejs";
import { fileURLToPath } from 'url'; 
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const emailTemplatePath = join(__dirname, '..', 'View', 'email.ejs');

export const generateEmailTemplate = async (data,subject,msg,url) => {
    try {
        return await ejs.renderFile(emailTemplatePath, {
            subject: { Subject: subject },
            message: { msg: msg },
            verificationLink: `${process.env.CLIENT_URL}/${url}?token=${encodeURIComponent(data)}`
        });
    } catch (error) {
        console.error("Error rendering email template:", error);
        throw error;
    }
};


