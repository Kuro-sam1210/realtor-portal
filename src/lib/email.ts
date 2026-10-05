import { GROUP_NAME } from "@/lib/ui";

// Welcome mail sent after registration. Needs RESEND_API_KEY and MAIL_FROM;
// without them the portal still works and the send is skipped.
const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.MAIL_FROM;
const WHATSAPP_GROUP = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL;

export const isMailConfigured = Boolean(API_KEY && FROM);

function body({ fullName, cid, email, refLink }: { fullName: string; cid: string; email: string; refLink: string }) {
  // The reference mail also lists the password. We leave it out: passwords are
  // hashed, so we cannot read one back, and mailing it would expose the account.
  const lines = [
    `Dear ${fullName},`,
    `Welcome to ${GROUP_NAME}. Kindly find below your login details.`,
    `CID (USER ID): ${cid}`,
    `Email: ${email}`,
    `Sign in with the password you chose when you registered.`,
    `Your referral link is ${refLink}`,
  ];
  if (WHATSAPP_GROUP) {
    lines.push(`Kindly join our whatsapp group with the link below: ${WHATSAPP_GROUP}`);
  }
  return lines;
}

export async function sendWelcomeEmail(details: {
  fullName: string;
  cid: string;
  email: string;
  refLink: string;
}) {
  if (!isMailConfigured) return;

  const lines = body(details);
  const html = lines.map((line) => `<p>${line}</p>`).join("");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: details.email,
      subject: `Welcome ${GROUP_NAME}`,
      text: lines.join("\n\n"),
      html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Welcome mail failed: ${response.status} ${await response.text()}`);
  }
}
