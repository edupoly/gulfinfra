import "server-only";

export async function sendOtpEmail(email: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_EMAIL_FROM;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Email delivery is not configured.");
    }
    console.info(`[GulfInfraHub development OTP] ${email}: ${code}`);
    return { delivered: false };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Your GulfInfraHub verification code",
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><h1 style="color:#0b1f3a">Verify your email</h1><p>Use this code to continue:</p><p style="font-size:32px;font-weight:800;letter-spacing:8px">${code}</p><p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p></div>`,
    }),
  });
  if (!response.ok) throw new Error("Unable to deliver verification email.");
  return { delivered: true };
}
