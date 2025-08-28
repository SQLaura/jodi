const { Client, ActivityType, Events, Collection, GatewayIntentBits } = require("discord.js");
const fs = require("node:fs");
const client = new Client(
  {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  },
);

client.commands = new Collection();

function divider() {
  console.log();
  console.log("=".repeat(process.stdout.columns || 16));
  console.log();
}

divider();

const events = fs.readdirSync("./events/").filter(file => file.endsWith("js"));
let i = 0;
for (const eventFile of events) {
  const event = require(`./events/${eventFile}`);
  const eventName = eventFile.split(".")[0];
  console.log(`Loaded event: '${eventName}'`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  }
  else {
    client.on(event.name, (...args) => event.execute(...args));
  }
  i++;
}

console.log(`Loaded ${i} events successfully`);
divider();

i = 0;

const commands = fs.readdirSync("./commands/").filter(file => file.endsWith("js"));
for (const commandFile of commands) {
  const command = require(`./commands/${commandFile}`);
  const commandName = command.name;
  console.log(`Loaded command: '${commandName}'`);
  client.commands.set(commandName, command);
}

console.log(`Loaded ${i} commands successfully`);
divider();

client.once(Events.ClientReady, bot => {
  console.log(`Logged in as ${bot.user.username}`);
  client.user.setActivity("a barbershop haircut that cost a quarter", { type: ActivityType.Custom });
});

client.login(process.env.BOT_TOKEN);
