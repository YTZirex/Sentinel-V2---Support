const { Client } = require("discord.js");
const mongoose = require("mongoose");
const config = require("../../config.json");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    await mongoose.connect(config.mongoURI || "", {
      autoIndex: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    if (mongoose.connect) {
      console.log(`[DB] Connected\n`.green.bold);
    }

    console.log(`[BOT] Connected as ${client.user.username}.`.green.bold);
  },
};
