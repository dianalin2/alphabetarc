import nodemailer from "nodemailer";

const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_SECURE = process.env.EMAIL_SECURE === "true";
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

const emailTransporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_SECURE,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
    },
});

function sendEmail(from, to, subject, text, html) {
    if (!html)
        html = text;

    return emailTransporter.sendMail({
        from: {
            name: from,
            address: EMAIL_ADDRESS,
        },
        to,
        subject,
        text,
        html
    });
}

export { sendEmail };
