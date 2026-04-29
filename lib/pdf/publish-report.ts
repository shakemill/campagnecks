import { put } from "@vercel/blob";

const PLACEHOLDER_BLOB_TOKEN = "vercel_blob_rw_token";

export async function publishReportPdf(recordId: string, pdfBytes: Uint8Array): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token || token === PLACEHOLDER_BLOB_TOKEN) {
    return `local://report/${recordId}`;
  }

  try {
    const blob = await put(`cks-manager/reports/${recordId}.pdf`, Buffer.from(pdfBytes), {
      token,
      access: "public",
      contentType: "application/pdf",
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    return blob.url;
  } catch (error) {
    console.warn("Blob report publish failed, fallback local report.", error);
    return `local://report/${recordId}`;
  }
}
