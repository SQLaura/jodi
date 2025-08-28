const { TextChannel } = require("discord.js");
const prisma = require("../prismaConnection");
const {
  assignReminders,
} = require("./database_helpers");

async function checkReminders(client) {
  const currentTime = Math.ceil(+Date.now() / 1000);
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { drop_enabled: true },
        { grab_enabled: true },
        { series_enabled: true },
        { quest_enabled: true },
      ],
    },
  });
  for (const userData of users) {
    const userID = userData.id;
    const reminderTypes = Object.keys(userData).filter(s => s.endsWith("enabled"));
    const enabledReminderTypes = Object.entries(userData).filter(s => reminderTypes.includes(s[0]) && s[1]);
    const enabledReminders = enabledReminderTypes.map(s => s[0].split("_")[0]);
    for (const reminder of enabledReminders) {
      let reminderTime = userData[reminder];

      // already finished reminding
      if (reminderTime == "0") continue;

      reminderTime = +reminderTime;
      if (currentTime > reminderTime) {
        // reminder already finished, but it didn't update
        await assignReminders(userID, reminder, "0");
        continue;
      }

      if (currentTime + 5 >= reminderTime) {
        /** @type {TextChannel} */
        const channel = await client.channels.fetch(userData.channel);
        setTimeout(() => {
          channel.send(`<@${userID}> your **\`${reminder}\`** is ready!`);
          assignReminders(userID, reminder, "0");
        }, (reminderTime - currentTime) * 1000);
      }
    }
  }
}

module.exports = {
  checkReminders,
};
