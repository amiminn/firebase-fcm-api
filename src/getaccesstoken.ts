import { GoogleAuth } from "google-auth-library";
import path from "path";
import fs from "fs/promises";

const PRIVATE_KEY = "console-f5aa1-firebase-adminsdk-6gtun-7e984aeb2b.json";

const SCOPES = ["https://www.googleapis.com/auth/cloud-platform"];
const filePath = path.join(__dirname, "accesstoken.json");

export const fcmUrl =
  "https://fcm.googleapis.com/v1/projects/console-f5aa1/messages:send";

export const bearerToken = async () => {
  const accessTokenPath = path.resolve(__dirname, "accesstoken.json");
  const fileContent = await fs.readFile(accessTokenPath, "utf-8");
  const accessToken = JSON.parse(fileContent);

  return accessToken.token;
};

export async function getAccessToken() {
  try {
    const serviceAccountPath = path.join(__dirname, PRIVATE_KEY);
    const auth = new GoogleAuth({
      keyFile: serviceAccountPath,
      scopes: SCOPES,
    });

    const client = await auth.getClient();
    const accessTokenResponse = await client.getAccessToken();
    const token = accessTokenResponse.token;

    saveTokenToFile(token);
    return { token };
  } catch (error) {
    console.error("Error obtaining access token:", error);
    return null;
  }
}

async function saveTokenToFile(token: string | null | undefined) {
  try {
    const tokenData = { token };

    await fs.writeFile(filePath, JSON.stringify(tokenData, null, 2));
    console.log(`Token berhasil disimpan di ${filePath}`);
  } catch (error) {
    console.error("Error saving token to file:", error);
  }
}
