import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

export const jwtIssuer = process.env.JWT_ISSUER ? process.env.JWT_ISSUER : 'stpeter';

export const confirmEmailOnRegistration = process.env.CONFIRM_EMAIL_ON_REGISTRATION === 'true';

export const SERVER_PORT = process.env.PORT || 3000;

export const siteAdminEmail = process.env.SITE_ADMIN_EMAIL ? process.env.SITE_ADMIN_EMAIL : 'admin@stpeter.lan'
export const passwordResetEmailSubject = process.env.PASSWORD_RESET_EMAIL_SUBJECT ?
    process.env.PASSWORD_RESET_EMAIL_SUBJECT : 'Password Reset Request';
export const emailConfirmationSubject = process.env.EMAIL_CONFIRMATION_SUBJECT ?
    process.env.EMAIL_CONFIRMATION_SUBJECT : 'Email confirmation';

export const mailer = nodemailer.createTransport({
    pool: true,
    host: process.env.SMTP_HOST ? process.env.SMTP_HOST : 'localhost',
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 2500,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
});


export const saltRounds = 10;
export const jwtSecret = process.env.JWT_SECRET || 'jwt-secret-key-to-be-replaced';
export const passwordResetUrl = process.env.PASSWORD_RESET_URL ?
    process.env.PASSWORD_RESET_URL :
    `http://localhost:${SERVER_PORT}/recover?token=`;

export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

export const comparePassword = async (plainPassword: string, hashedPassword: string) => {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    return match;
}

export const isAcceptedEmailAddress = (email: string) => {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(email);
}

export const isStrongPassword = (password: string) => {
    if(password?.length > 16) return true;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
}

export const isAcceptedDisplayName = (name: string) => {
    return !!name  && /^[a-zA-Z0-9]{3,}$/.test(name)
}

export const html2text = (html: string) => {
    let plainText = html.replace(/\n/g, '');
    plainText = plainText.replace(/<\/p>/g, '\n');
    plainText = plainText.replace(/<[^>]+>/g, '');
    plainText = plainText.trim()
    return plainText.split('\n').map((line) => line.trim()).join('\n');
}

export const sendPasswordResetEmail = async (to: string, resetToken: string) => {

    const htmlTemplatePath = path.join(
        path.dirname(__filename), 'templates/password-reset.html');
    const textTemplatePath = path.join(
        path.dirname(__filename), 'templates/password-reset.txt');

    let htmlTemplate = fs.readFileSync(htmlTemplatePath, 'utf8');
    htmlTemplate = htmlTemplate.replace(/PASSWORD_RESET_LINK/g, `${passwordResetUrl}${resetToken}`);
    let txtTemplate = fs.readFileSync(textTemplatePath, 'utf8');
    txtTemplate = txtTemplate.replace(/PASSWORD_RESET_LINK/g, `${passwordResetUrl}${resetToken}`);

    await mailer.sendMail({
        from: siteAdminEmail,
        to,
        subject: passwordResetEmailSubject,
        text: txtTemplate,
        html: htmlTemplate
    });

}

export const sendConfirmationEmail = async (to: string, confirmToken: string) => {

    const htmlTemplatePath = path.join(
        path.dirname(__filename), 'templates/email-confirm.html');
    const textTemplatePath = path.join(
        path.dirname(__filename), 'templates/email-confirm.txt');

    let htmlTemplate = fs.readFileSync(htmlTemplatePath, 'utf8');
    htmlTemplate = htmlTemplate.replace(/EMAIL_CONFIRMATION_URL/g, `${passwordResetUrl}${confirmToken}`);
    let txtTemplate = fs.readFileSync(textTemplatePath, 'utf8');
    txtTemplate = txtTemplate.replace(/EMAIL_CONFIRMATION_URL/g, `${passwordResetUrl}${confirmToken}`);

    mailer.sendMail({
        from: siteAdminEmail,
        to,
        subject: emailConfirmationSubject,
        text: txtTemplate,
        html: htmlTemplate
    });

}

export function unix(){
    return Math.floor(Date.now() / 1000)
}

export function days(count:number){
    return count * 24 * 60 * 60;
}