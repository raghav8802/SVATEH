/**
 * Creates (or resets the password of) an owner account.
 * Usage: pnpm create-admin --email you@svateh.com --password 'StrongPass123' --name "Your Name"
 */
import bcrypt from "bcryptjs";
import { connectDB, disconnectDB } from "../src/connect";
import { AdminUser } from "../src/models";

const arg = (k: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};

async function main() {
  const email = (arg("email") ?? process.env.ADMIN_EMAIL)?.toLowerCase().trim();
  const password = arg("password") ?? process.env.ADMIN_PASSWORD;
  const name = arg("name") ?? "Owner";
  if (!email || !password || password.length < 10) {
    throw new Error("Provide --email and a --password of at least 10 characters.");
  }
  await connectDB();
  const passwordHash = await bcrypt.hash(password, 12);
  await AdminUser.updateOne({ email }, { $set: { passwordHash, role: "owner", active: true }, $setOnInsert: { email, name } }, { upsert: true });
  console.log(`Owner account ready: ${email}`);
}

main()
  .catch((e) => {
    console.error(e.message ?? e);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
