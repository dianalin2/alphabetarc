import nodemailer from "nodemailer";
import fs from "fs";
import Handlebars from "handlebars";
import path from "path";

const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_SECURE = process.env.EMAIL_SECURE === "true";
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_SOURCE_PATH = 'templates/email.html';

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

const serverEmailTemplate = Handlebars.compile(fs.readFileSync(EMAIL_SOURCE_PATH, 'utf8'));

function sendServerEmail(from, to, subject, text) {
    return sendEmail(from, to, subject, text, serverEmailTemplate({
        subject,
        content: text
    }));
}

function newsletterIssueToText(newsletter) {
    return `${newsletter.title}, Issue ${newsletter.issues.length}\n\n` +
        newsletter.issues[newsletter.issues.length - 1].questions.map((question, index) =>
            `${index + 1}. ${question.question}\n`
                `   ${question.answers.map((answer) => `${answer.subscriber.nickname}: ${answer.answer}`).join('\n')}`
        ).join('\n');
}

function sendNewsletterIssue(newsletter, issue) {
    const emailTemplate = Handlebars.compile(fs.readFileSync(path.join('templates', newsletter.template), 'utf8'));
    const textNewsletterIssue = newsletterIssueToText(newsletter);

    const issueNumber = newsletter.issues.filter((issue) => issue.sent).length + 1;

    const renderedNewsletterIssue = emailTemplate({
        title: newsletter.title,
        issueNumber: issueNumber,
        questions: issue.questions,
    });

    for (const subscriber of newsletter.subscribers) {
        if (subscriber.startSubscribe > Date.now())
            continue;
        if (subscriber.endSubscribe && subscriber.endSubscribe < Date.now())
            continue;

        sendEmail(
            newsletter.title,
            subscriber.email,
            `newsletter.title, Issue ${newsletter.issues.length}`,
            textNewsletterIssue,
            renderedNewsletterIssue
        );
    }
}

export { sendServerEmail, sendNewsletterIssue };
