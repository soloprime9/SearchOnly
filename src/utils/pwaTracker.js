import { getApiBase } from "./apiConfig";

export const trackPWA =
async (type) => {

  try {

    const device =
      /Mobi|Android/i.test(
        navigator.userAgent
      )
        ? "Mobile"
        : "Desktop";

    const browser =
      navigator.userAgent;

    const os =
      navigator.platform;

    await fetch(
      `${getApiBase()}/api/pwa/track`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          type,
          browser,
          device,
          os,
        }),
      }
    );

  } catch (err) {
    console.log(err);
  }
};
