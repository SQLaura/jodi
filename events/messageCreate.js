const { Events } = require("discord.js");
const constants = require("../constants.js");
const {
  isRegistered,
  assignReminders,
  toSeconds,
  anyRemindersEnabled,
  hasReminderEnabled,
} = require("../utils/database_helpers.js");

const cooldownRegex = /.*\*\*`(Drop|Grab|Series)\s*.*\*\*(.*)\*\*/;
const timeRegex = /^(?:(?<minutes>\d+)m)?\s*(?:(?<seconds>\d+)s)?$/i;

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.id == constants.SOFI) {
      sofiHandler(message);
      return;
    }

    if (message.author.bot) return;

    if (message.content.toLowerCase().startsWith(constants.PREFIX)) {
      const msg_split = message.content.split(" ");
      const commandName = msg_split[0].slice(2);
      const args = msg_split.slice(1);
      const command = message.client.commands.get(commandName) || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
      if (!command) return;

      await command.execute(message, args);
    };

    if (!await isRegistered(message.author.id)) return;
    // only registered users will pass through here

    if (message.content.split(" ")[0] == "scd") {
      await sofiCooldownHandler(message);
    }
  },
};

function sofiHandler(message) {
  // this is for grab message
  console.log("im sofing it so hard");
  return;
}


async function sofiCooldownHandler(message) {
  // return if user doesn't have any reminders enabled
  if (!await anyRemindersEnabled(message.author.id)) return;

  const filter = m =>
    m.author.id == constants.SOFI &&
    m.embeds.length > 0 && m.embeds[0].author &&
      m.embeds[0].author.name.includes(message.author.username);
  const collector = message.channel.createMessageCollector({ filter, time: 5000 });

  collector.on("collect", async (m) => {
    const desc = m.embeds[0].description;
    for (const line of desc.split("\n")) {
      const match = cooldownRegex.exec(line);
      if (!match) continue;

      const reminderName = match[1].toLowerCase();
      if (!await hasReminderEnabled(message.author.id, reminderName)) continue;

      const reminder = match[2];
      const timeMatch = timeRegex.exec(reminder);
      if (!timeMatch) {
        await assignReminders(message.author.id, reminderName, "0");
      }
      else {
        const minutes = timeMatch.groups.minutes || "0";
        const seconds = timeMatch.groups.seconds || "0";
        const reminderTime = Math.ceil(+Date.now() / 1000) + toSeconds(minutes, seconds);
        await assignReminders(message.author.id, reminderName, reminderTime.toString());
      }

    }
  });

  collector.on("end", collected => {
    if (!collected.size) return;
  });
}
