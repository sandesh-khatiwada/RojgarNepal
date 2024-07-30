import nodemailer from "nodemailer";
import "dotenv/config";


const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_TRANSPORTER_PASS
    }
  });


  export default emailTransporter;