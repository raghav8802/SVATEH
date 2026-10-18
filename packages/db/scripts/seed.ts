import { disconnectDB } from "../src/connect";
import { seedDatabase } from "../src/seed";

const force = process.argv.includes("--force");
seedDatabase({ force })
  .then((r) => console.log(r.message))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
