const { Client, Events, Collection, GatewayIntentBits } = require("discord.js");
const fs = require("node:fs");
const client = new Client(
  {
    intents: [
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessages,
    ],
  },
);

client.commands = new Collection();

console.log("=".repeat(process.stdout.columns || 16));

fs.readdir("./events/", (err, files) => {
  if (err) return console.error;
  let i = 0;
  files.forEach(file => {
    if (!file.endsWith(".js")) return;

    const event = require(`./events/${file}`);
    const eventName = file.split(".")[0];
    console.log(`Loaded event: '${eventName}'`);
    client.on(eventName, event.bind(null, client));
    i++;
  });
  console.log();
  console.log(`Loaded ${i} events successfully`);
  console.log();
  console.log("=".repeat(process.stdout.columns || 16));
});

fs.readdir("./commands/", (err, files) => {
  let i = 0;
  files.forEach(file => {
    if (!file.endsWith(".js")) return;

    const command = require(`./commands/${file}`);
    const commandName = file.split(".")[0];
    console.log(`Loaded command: '${commandName}'`);
    client.commands.set(commandName, command);
    i++;
  });
  console.log();
  console.log(`Loaded ${i} commands successfully`);
  console.log();
  console.log("=".repeat(process.stdout.columns || 16));
});


client.once(Events.ClientReady, bot => {
  console.log(`Logged in as ${bot.user.username}`);
});

client.login(process.env.BOT_TOKEN);
