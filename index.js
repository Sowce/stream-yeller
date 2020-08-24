const fetch = require("node-fetch");
const TwitchClient = require("twitch").default;

const { clientId, accessToken } = process.env;

const apiClient = TwitchClient.withClientCredentials(clientId, accessToken);

const getUserID = async (userName) =>
  await apiClient.helix.users.getUserByName(userName);

let userID = undefined;
let lastStreamState = false;

const isStreamLive = async (userName) => {
  if (!userID) userID = await getUserID(userName);
  return await apiClient.helix.streams.getStreamByUserId(userID);
};

const getGameName = async (gameId) => {
  return (await apiClient.helix.games.getGameById(gameId)).name;
};

const checkCurrentStreamStatus = async () => {
  console.log("🔍 Checking...");
  const streamState = await isStreamLive(process.env.streamName);

  if (!streamState) {
    console.log("💤 Stream Down");
    lastStreamState = false;
    return;
  }

  console.log("👍 Stream Up");
  if (!lastStreamState) {
    if (new Date() - new Date(streamState.started_at) > 300000) {
      console.log("👻 Too late to 🔔");
      lastStreamState = true;
      return;
    }

    console.log("🔔 Notify");
    lastStreamState = true;
    const streamData = streamState._data;
    const embedObject = {
      thumbnail: {
        url: streamData.channel.logo,
      },
      author: {
        url: `https://twitch.tv/${streamData.user_name}`,
        name: `https://twitch.tv/${streamData.user_name}`,
        icon_url: "http://i.imgur.com/yWN9032.png",
      },
      url: `https://twitch.tv/${streamData.user_name}`,
      description: `${streamData.user_name} just went live${
        parseInt(streamData.game_id)
          ? ` (${await getGameName(streamData.game_id)})`
          : ""
      }\n${streamData.title}`,
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

    // fetch(process.env.webhookUrl, {
    //   method: "POST",
    //   headers: {
    //     "content-type": "application/json",
    //   },
    //   body: JSON.stringify(postObject),
    // })
    //   .then(async () => {
    //     console.log("✔ Discord successfully notified");
    //   })
    //   .catch(console.error);
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
