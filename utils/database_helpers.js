const prisma = require("../prismaConnection");
const {
  cache,
  getUserCache,
} = require("./cache_helpers");

async function isRegistered(id) {
  return cache.has(id);
}

function isWithinRange(stored, target, threadshold = 5) {
  const s = Number(stored);
  const t = Number(target);
  return t - threadshold <= s && s <= t + threadshold;
}

async function hasReminderEnabled(id, reminderName) {
  const userData = await getUserCache(id);
  return userData[`${reminderName}_enabled`];
}

async function anyRemindersEnabled(id) {
  const userData = await getUserCache(id);
  const {
    drop_enabled,
    grab_enabled,
    series_enabled,
    quest_enabled,
  } = userData;
  return [drop_enabled, grab_enabled, series_enabled, quest_enabled].some(Boolean);
}

async function assignReminders(id, reminderName, time) {
  const userData = await getUserCache(id);
  const reminderData = userData[reminderName];
  if (!isWithinRange(reminderData, time)) {
    // update the time in db if the new time is not in range of 5 seconds from old one
    userData[reminderName] = String(time);
  }
  await prisma.user.update({
    where: { id },
    data: userData,
  });
  await cache.set(id, userData);
}

async function setChannel(id, channel) {
  await prisma.user.update({
    where: { id },
    data: { channel },
  });
  const userData = cache.get(id);
  userData.channel = channel;
  cache.set(id, userData);
}

function toSeconds(minutes, seconds) {
  return (Number(minutes) * 60) + Number(seconds);
}

module.exports = {
  isRegistered,
  assignReminders,
  toSeconds,
  anyRemindersEnabled,
  hasReminderEnabled,
  setChannel,
};
