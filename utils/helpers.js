const prisma = require("../prismaConnection");

async function isRegistered(id) {
  return !!await prisma.user.findUnique({
    where: { id },
  });
}

module.exports = {
  isRegistered,
};
