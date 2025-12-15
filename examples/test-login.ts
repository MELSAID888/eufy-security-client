import "dotenv/config";
import { EufySecurity } from "eufy-security-client";
import { readline } from "node:readline/promises";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  const username = process.env.EUFY_USERNAME;
  const password = process.env.EUFY_PASSWORD;

  if (!username || !password) {
    console.error(
      "Missing EUFY_USERNAME or EUFY_PASSWORD in environment variables."
    );
    return;
  }

  const eufyClient = await EufySecurity.initialize({
    username,
    password,
    country: "US", // Or your country code
  });

  eufyClient.on("tfa request", async () => {
    const code = await rl.question("Enter 2FA code: ");
    await eufyClient.connect({ verifyCode: code });
  });

  eufyClient.on("connect", () => {
    console.log("Connected to Eufy!");
    eufyClient.close();
    rl.close();
  });

  eufyClient.on("connection error", (error: Error) => {
    console.error("Connection error:", error);
    eufyClient.close();
    rl.close();
  });

  await eufyClient.connect();
}

main();
