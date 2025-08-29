const NodeCache = require("node-cache");
const prisma = require("../prismaConnection");

const cache = new NodeCache({ stdTTL: 3600, checkperiod: 300 });

async function getUserCache(id) {
  let userData = null;
  if (!cache.has(id)) {
    userData = await prisma.user.findUnique({ where: { id } });
    cache.set(id, userData);
  }
  else {
    userData = cache.get(id);
  }
  return userData;
}

module.exports = {
  cache,
  getUserCache,
};
