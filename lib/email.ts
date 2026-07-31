import "server-only";
import nodemailer from "nodemailer";

function gmailTransport() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");

  if (!gmailUser || !gmailAppPassword) {
    throw new Error("Email delivery is not configured.");
  }

  return {
    gmailUser,
    transporter: nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    }),
  };
}

export async function sendOtpEmail(
  email: string,
  code: string,
  options: { requireDelivery?: boolean } = {},
) {
  const from = process.env.AUTH_EMAIL_FROM || process.env.GMAIL_USER;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || !from) {
    if (options.requireDelivery) {
      throw new Error("Email delivery is not configured.");
    }
    console.info(`[GulfInfraHub development OTP] ${email}: ${code}`);
    return { delivered: false };
  }

  const { transporter } = gmailTransport();

  await transporter.sendMail({
    from,
    to: email,
    subject: "Your GulfInfraHub verification code",
    text: `Your GulfInfraHub verification code is ${code}. It expires in 10 minutes.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><h1 style="color:#0b1f3a">Verify your email</h1><p>Use this code to continue:</p><p style="font-size:32px;font-weight:800;letter-spacing:8px">${code}</p><p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p></div>`,
  });

  return { delivered: true };
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const { gmailUser, transporter } = gmailTransport();
  const from = process.env.AUTH_EMAIL_FROM || gmailUser;

  await transporter.sendMail({
    from,
    to: email,
    subject: "Reset your GulfInfraHub password",
    text: `Reset your GulfInfraHub password using this link: ${resetUrl}. The link expires in 30 minutes. If you did not request it, ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><h1 style="color:#0b1f3a">Reset your password</h1><p>Use the secure link below to choose a new password.</p><p><a href="${resetUrl}" style="display:inline-block;border-radius:10px;background:#fbbf24;color:#0b1f3a;padding:12px 20px;font-weight:800;text-decoration:none">Reset password</a></p><p>This link expires in 30 minutes and can only be used once.</p><p>If you did not request a password reset, you can safely ignore this email.</p></div>`,
  });
}
