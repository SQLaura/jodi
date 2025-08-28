const { Events, Message } = require("discord.js");
const constants = require("../constants.js");
const {
  isRegistered,
  assignReminders,
  toSeconds,
  anyRemindersEnabled,
  hasReminderEnabled,
  setChannel,
} = require("../utils/database_helpers.js");

const cooldownRegex = /.*\*\*`(Drop|Grab|Series)\s*.*\*\*(.*)\*\*/;
const timeRegex = /^(?:(?<minutes>\d+)m)?\s*(?:(?<seconds>\d+)s)?$/i;
const grabRegex = /.*\(`[!a-zA-Z0-9]+`\) \|.*/;

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

    if (!message.content.toLowerCase().startsWith("s")) return;

    if (!await isRegistered(message.author.id)) return;
    // only registered users will pass through here

    const command = message.content.split(" ")[0].toLowerCase();

    if (command === "scd") {
      await setChannel(message.author.id, message.channel.id);
      await sofiCooldownHandler(message);
    }
  },
};

/** @param { Message } message */
async function sofiHandler(message) {
  // grab message handler
  const mentions = message.mentions.parsedUsers;
  if (mentions.size == 0) return;

  const grabMatch = grabRegex.exec(message.content);
  if (!grabMatch) return;

  const user = mentions.first();
  if (!await isRegistered(user.id)) return;

  assignReminders(user.id, "grab", (Math.ceil(+Date.now() / 1000) + 4 * 60).toString());
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
