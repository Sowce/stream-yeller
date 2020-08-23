const { default: TwitchClient } = require("twitch");
const fetch = require("node-fetch");

const { clientId, accessToken } = process.env;
const apiClient = new TwitchClient.withCredentials(clientId, accessToken);

const getUserID = async (userName) =>
  await apiClient.helix.users.getUserByName(userName);

let userID = undefined;
let lastStreamState = false;

const isStreamLive = async (userName) => {
  if (!userID) userID = await getUserID(userName);
  return await apiClient.helix.streams.getStreamByUserId(userID);
};

const checkCurrentStreamStatus = async () => {
  console.log("🔍 Checking...");
  const streamState = await isStreamLive(process.env.streamName);

  if (!streamState) {
    console.log("💤 Stream Down");
    lastStreamState = false;
    return;
  }

  if (!lastStreamState) {
    if (new Date() - new Date(streamState.created_at) > 300000) {
      console.log("👻 Too late to 🔔");
      lastStreamState = true;
      return;
    }

    console.log("🔔 Stream Up");
    lastStreamState = true;
    const streamData = requestData.stream;
    const embedObject = {
      thumbnail: {
        url: streamData.channel.logo,
      },
      author: {
        url: streamData.channel.url,
        name: streamData.channel.url,
        icon_url: "http://i.imgur.com/yWN9032.png",
      },
      url: streamData.channel.url,
      description: `${streamData.channel.display_name} just went live${
        streamData.game ? ` (${streamData.game})` : ""
      }\n${streamData.channel.status}`,
      color: 6570404,
    };

    let postObject = {
      embeds: [embedObject],
    };

    if (process.env.message) {
      postObject = { ...postObject, content: process.env.message };
    }

    if (process.env.username) {
      postObject = { ...postObject, username: process.env.username };
    }

    if (process.env.avatarUrl) {
      postObject = { ...postObject, avatar_url: process.env.avatarUrl };
    }

    fetch(process.env.webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(postObject),
    })
      .then(async () => {
        console.log("✔ Discord successfully notified");
      })
      .catch(console.error);
  }
};

let checkDelay = 150000;

let parsedEnvDelay = parseInt(process.env.checkDelay);
if (!isNaN(parsedEnvDelay)) {
  if (parsedEnvDelay < 60) {
    console.error("⛔ checkDelay being under 60 seconds is unreasonable");
    checkDelay = 60000;
  } else if (parsedEnvDelay > 600) {
    console.warn("⚠ checkDelay is set to more than 10 minutes");
    checkDelay = parseInt(process.env.checkDelay) * 1000;
  } else {
    checkDelay = parseInt(process.env.checkDelay) * 1000;
  }
} else {
  console.warn(
    "⚠ couldn't convert checkDelay to a number, defaulted to 2 minutes 30 seconds"
  );
}

setInterval(checkCurrentStreamStatus, checkDelay);
checkCurrentStreamStatus();
