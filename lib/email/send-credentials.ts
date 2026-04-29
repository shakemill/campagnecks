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
  const appBaseUrl =
    process.env.APP_BASE_URL ??
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const loginUrl = `${appBaseUrl.replace(/\/$/, "")}/login`;

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
      "",
      `Lien de connexion: ${loginUrl}`,
    ].join("\n"),
    html: `
      <div style="font-family: Inter, Arial, sans-serif; color: #2c2c2c; line-height: 1.6;">
        <h2 style="margin: 0 0 12px; color: #525252;">Connexion campagne MCV</h2>
        <p>Bonjour <strong>${params.firstName}</strong>,</p>
        <p>Votre compte d'acces pour la campagne <strong>${params.campaignName}</strong> est actif.</p>
        <p>
          Mot de passe temporaire: <strong>${params.temporaryPassword}</strong><br />
          Vous devez modifier ce mot de passe a votre premiere connexion.
        </p>
        <p style="margin: 20px 0;">
          <a
            href="${loginUrl}"
            style="background: #cd3b86; color: #ffffff; text-decoration: none; padding: 10px 14px; border-radius: 8px; font-weight: 600;"
          >
            Se connecter
          </a>
        </p>
        <p style="font-size: 12px; color: #666;">Si le bouton ne fonctionne pas, copiez ce lien: ${loginUrl}</p>
      </div>
    `,
  });

  return {
    messageId: info.messageId,
    accepted: info.accepted.map((entry) => String(entry)),
    rejected: info.rejected.map((entry) => String(entry)),
  };
}
