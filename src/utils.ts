import { createHash } from "crypto";

const createSHA256Hash = (data: string) => {
  return createHash("sha256").update(data.trim(), "utf8").digest("hex");
};

export { createSHA256Hash };
