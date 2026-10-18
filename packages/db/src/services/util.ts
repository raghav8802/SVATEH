import crypto from "node:crypto";

/** Converts Mongoose lean docs (ObjectIds, Dates) into JSON-safe objects for React props. */
export const plain = <T>(x: T): T => JSON.parse(JSON.stringify(x));

export const isObjectId = (s: unknown): s is string => typeof s === "string" && /^[a-f0-9]{24}$/i.test(s);

export const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const randomToken = (bytes = 24) => crypto.randomBytes(bytes).toString("base64url");

export const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
