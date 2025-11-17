// netlify/functions/pusher-update.js
const Pusher = require("pusher");

const requiredEnv = ["PUSHER_APP_ID", "PUSHER_KEY", "PUSHER_SECRET", "PUSHER_CLUSTER"];
requiredEnv.forEach((name) => {
  if (!process.env[name]) {
    throw new Error(`Missing env var ${name}`);
  }
});

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
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
