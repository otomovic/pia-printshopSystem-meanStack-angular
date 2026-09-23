import nodemailer from 'nodemailer';

export async function posaljiEmail(to: string, subject: string, text: string, attachments?: { filename: string, path: string }[]) {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
        console.log(`[email] Gmail nije podešen (GMAIL_USER / GMAIL_PASS env var) — preskačem slanje e-maila za: ${to} / ${subject}`);
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });

    try {
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to,
            subject,
            text,
            attachments
        });
    } catch (err) {
        console.log('[email] Slanje nije uspelo:', err);
    }
}
