const prisma = require("../prismaConnection");

async function isRegistered(id) {
  return !!await prisma.user.findUnique({
    where: { id },
  });
}

function isWithinRange(stored, target, threadshold = 5) {
  const s = Number(stored);
  const t = Number(target);
  return t - threadshold <= s && s <= t + threadshold;
}

async function hasReminderEnabled(id, reminderName) {
  const reminders = await prisma.user.findUnique({
    where: { id },
    select: {
      drop_enabled: true,
      grab_enabled: true,
      series_enabled: true,
      quest_enabled: true,
    },
  });
  return !!reminders[`${reminderName}_enabled`];
}

async function anyRemindersEnabled(id) {
  const reminders = await prisma.user.findUnique({
    where: { id },
    select: {
      drop_enabled: true,
      grab_enabled: true,
      series_enabled: true,
      quest_enabled: true,
    },
  });
  return Object.values(reminders).some(i => i);
}

async function assignReminders(id, reminderName, time) {
  const user_data = await prisma.user.findUnique({
    where: { id },
  });
  const data = user_data[reminderName];
  if (!isWithinRange(data, time)) {
    // update the time in db if the new time is not in range of 5 seconds from old one
    user_data[reminderName] = String(time);
  }
  await prisma.user.update({
    where: { id },
    data: user_data,
  });
}

async function setChannel(id, channel) {
  await prisma.user.update({
    where: { id },
    data: { channel },
  });
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
