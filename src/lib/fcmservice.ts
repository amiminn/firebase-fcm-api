import admin from "firebase-admin";
import path from "path";

const PRIVATE_KEY =
  "fcm/flowworks-warehouse-firebase-adminsdk-fbsvc-8285ef3b03.json";
const serviceAccountPath = path.join(__dirname, PRIVATE_KEY);

interface FcmTypeRequest {
  topic: string;
  title: string;
  body: string;
  image?: string;
  data?: {};
}

interface FcmUserTypeRequest {
  token: string;
  title: string;
  body: string;
  image?: string;
  data?: {};
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});

export async function FcmSendNotification({
  topic,
  title,
  body,
  image,
  data,
}: FcmTypeRequest) {
  const message = {
    topic,
    notification: {
      title,
      body,
      image,
    },
    data,
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
  data,
}: FcmUserTypeRequest) {
  const message = {
    notification: {
      title,
      body,
      image,
    },
    token,
    data,
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
