interface sendNotificationType {
  topic: string;
  title: string;
  body: string;
  image?: string;
}

export function sendNotificationPayload({
  topic,
  title,
  body,
  image,
}: sendNotificationType) {
  return {
    message: {
      topic,
      notification: {
        title,
        body,
      },
      android: {
        notification: {
          image,
        },
      },
      apns: {
        payload: {
          aps: {
            "mutable-content": 1,
          },
        },
        fcm_options: {
          image,
        },
      },
      webpush: {
        headers: {
          image,
        },
      },
    },
  };
}

interface sendNotificationUserType {
  deviceToken: string;
  title: string;
  body: string;
  image?: string;
}

export function sendNotificationUserPayload({
  deviceToken,
  title,
  body,
  image,
}: sendNotificationUserType) {
  return {
    message: {
      token: deviceToken,
      notification: {
        title,
        body,
      },
      android: {
        notification: {
          image,
        },
      },
      apns: {
        payload: {
          aps: {
            "mutable-content": 1,
          },
        },
        fcm_options: {
          image,
        },
      },
      webpush: {
        headers: {
          image,
        },
      },
    },
  };
}
