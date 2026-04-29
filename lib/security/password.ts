import bcrypt from "bcryptjs";

const TEMP_PASSWORD_LENGTH = 10;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

export async function hashPassword(rawPassword: string): Promise<string> {
  return bcrypt.hash(rawPassword, 10);
}

export async function verifyPassword(rawPassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(rawPassword, hash);
}

export function generateTemporaryPassword(): string {
  const randomValues = crypto.getRandomValues(new Uint32Array(TEMP_PASSWORD_LENGTH));
  return Array.from(randomValues)
    .map((value) => ALPHABET[value % ALPHABET.length])
    .join("");
}
