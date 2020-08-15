const fetch = require("node-fetch");

let lastStreamState = false;

const checkCurrentStreamStatus = async () => {
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

  // Stream isn't live, reset lastStreamState and return
  if (!("stream" in requestData) || "error" in requestData) {
    lastStreamState = false;
    return;
  }

  // Stream is live, check if it just came up or if it already was before
  if (!lastStreamState) {
    // Stream just came up, notify the people
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
    const postObject = {
      username: "Squ1ddy's Personal Scream Person",
      avatar_url: "https://i.imgur.com/XJVQxKR.png",
      embeds: [embedObject],
    };

    fetch(process.env.webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        body: JSON.stringify(postObject),
      },
    });
  }
};

setInterval(checkCurrentStreamStatus, 60000);
