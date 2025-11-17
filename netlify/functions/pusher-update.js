// netlify/functions/pusher-update.js
const Pusher = require("pusher");

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "2075303",
  key: process.env.PUSHER_KEY || "5f34f9c43667f7213afb",
  secret: process.env.PUSHER_SECRET || "bac0087f9722a2f6252b",
  cluster: process.env.PUSHER_CLUSTER || "ap1",
  useTLS: true,
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body || "{}");

    await pusher.trigger("scoreboard-channel", "update", data);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error("Pusher error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to push update" }),
    };
  }
};
