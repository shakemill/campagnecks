import nodemailer from "nodemailer";

type SendCredentialsParams = {
  to: string;
  firstName: string;
  campaignName: string;
  temporaryPassword: string;
};

export type SendCredentialsResult = {
  messageId: string;
  accepted: string[];
  rejected: string[];
};

export async function sendCredentialsEmail(
  params: SendCredentialsParams,
): Promise<SendCredentialsResult> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM ?? "no-reply@cks-manager.local";
  const allowInvalidTls = process.env.SMTP_ALLOW_INVALID_TLS === "true";

  if (!host || !user || !pass) {
    throw new Error("Configuration SMTP incomplete.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: !allowInvalidTls,
    },
  });

  const info = await transporter.sendMail({
    from,
    to: params.to,
    subject: `Identifiants campagne: ${params.campaignName}`,
    text: [
      `Bonjour ${params.firstName},`,
      "",
      `Votre compte d'acces pour la campagne "${params.campaignName}" est actif.`,
      `Mot de passe temporaire: ${params.temporaryPassword}`,
      "Vous devez modifier ce mot de passe a votre premiere connexion.",
    ].join("\n"),
  });

  return {
    messageId: info.messageId,
    accepted: info.accepted.map((entry) => String(entry)),
    rejected: info.rejected.map((entry) => String(entry)),
  };
}
