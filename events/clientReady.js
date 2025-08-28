const { Events, ActivityType } = require("discord.js");
const cron = require("node-cron");
const { checkReminders } = require("../utils/reminder_helpers");

module.exports = {
  name: Events.ClientReady,
  async execute(client) {
    console.log(`Logged in as ${client.user.username}`);
    client.user.setActivity("a barbershop haircut that cost a quarter", { type: ActivityType.Custom });
    cron.schedule("*/5 * * * * *", () => {
      checkReminders(client);
    });
  },
};
