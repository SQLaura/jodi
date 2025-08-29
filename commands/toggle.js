const prisma = require("../prismaConnection");
const { EmbedBuilder } = require("discord.js");
const {
  cache,
  getUserCache,
} = require("../utils/cache_helpers");

module.exports = {
  name: "toggle",
  aliases: ["t", "set"],
  description: "do stuff bro",
  execute: async (msg, args) => {
    let userData = await getUserCache(msg.author.id);
    if (!userData) {
      userData = await prisma.user.upsert({
        where: { id: msg.author.id },
        update: {},
        create: { id: msg.author.id },
      });
    }
    let drop = userData.drop_enabled;
    let grab = userData.grab_enabled;
    let series = userData.series_enabled;
    let quest = userData.quest_enabled;
    let modified = false;

    if (args.length != 0) {
      modified = true;

      if (["drop", "grab", "series", "quest", "all", "d", "g", "s", "q", "a"].includes(args[0])) {
        switch (args[0][0]) {
        case "d":
          drop = !drop;
          break;

        case "g":
          grab = !grab;
          break;

        case "s":
          series = !series;
          break;

        case "q":
          quest = !quest;
          break;

        case "a":
          drop = !drop;
          grab = !grab;
          series = !series;
          quest = !quest;
          break;

        default:
          break;
        }

        userData.drop_enabled = drop;
        userData.grab_enabled = grab;
        userData.series_enabled = series;
        userData.quest_enabled = quest;

        await prisma.user.update({
          where: {
            id: msg.author.id,
          },
          data: userData,
        });
        cache.set(msg.author.id, userData);
      };
    }

    const embed = new EmbedBuilder();
    embed.setColor("#c7a5e3");
    const tick = "<:_:1408444816311844904>";
    const untick = "<:_:1408444803095461928>";
    let text = `
${drop ? tick : untick}: **\`DROP\`**
${grab ? tick : untick}: **\`GRAB\`**
${series ? tick : untick}: **\`SERIES\`**
${quest ? tick : untick}: **\`QUEST\`**
`;
    if (modified) {
      text += "-# make sure to run `scd` to get your stuff tracked";
    }
    embed.setDescription(text.trim());
    await msg.channel.send({
      embeds: [embed],
    });
  },
};
