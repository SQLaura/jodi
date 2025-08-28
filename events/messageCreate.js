const { Events } = require("discord.js");
const constants = require("../constants.js");

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.id == constants.SOFI) {
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

    if (!isRegistered(message.author.id)) return;
  },
};
