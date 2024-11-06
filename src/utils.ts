import path from "path";
import admin from "firebase-admin";

const PRIVATE_KEY = "project-fjsa1-firebase-adminsdk-6gtsk-7e984o2h2b.json";
const serviceAccountPath = path.join(__dirname, PRIVATE_KEY);

interface FcmTypeRequest {
  topic: string;
  title: string;
  body: string;
  image?: string;
}

interface FcmUserTypeRequest {
  token: string;
  title: string;
  body: string;
  image?: string;
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});

export async function FcmSendNotification({
  topic,
  title,
  body,
  image,
}: FcmTypeRequest) {
  const message = {
    topic,
    notification: {
      title,
      body,
      image,
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("notif: " + response);
    return response;
  } catch (error) {
    console.error("error: " + error);
    return error;
  }
}

export async function FcmSendNotificationUser({
  token,
  title,
  body,
  image,
}: FcmUserTypeRequest) {
  const message = {
    notification: {
      title,
      body,
      image,
    },
    token,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("notif: " + response);
    return response;
  } catch (error) {
    console.error("error: " + error);
    return error;
  }
}

export const responseSuccess = {
  success: true,
  msg: "Notifikasi berhasil terkirim.",
};

export const responseFailed = {
  success: false,
  msg: "Notifikasi gagal terkirim, silahkan cobalagi.",
};
