const { Events, ActivityType } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  async execute(client) {
    console.log(`Logged in as ${client.user.username}`);
    client.user.setActivity("a barbershop haircut that cost a quarter", { type: ActivityType.Custom });
  },
};
