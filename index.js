const fetch = require("node-fetch");

let lastStreamState = false;

const checkCurrentStreamStatus = async () => {
  console.log("Checking stream status...");
  const request = await fetch(
    `https://api.twitch.tv/kraken/streams/${process.env.followId}`,
    {
      headers: {
        Accept: "application/vnd.twitchtv.v5+json",
        "Client-ID": process.env.twitchId,
      },
    }
  );
  const requestData = await request.json();
  console.log(requestData);
  if (!requestData.stream || "error" in requestData) {
    console.log("Stream isn't live, reset lastStreamState and return");
    lastStreamState = false;
    return;
  }

  if (!lastStreamState) {
    console.log("Stream just came up, notify the people");
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
      .then(async (response) => {
        console.log(await response.json());
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
