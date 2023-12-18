const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");

const { Guilds, GuildMembers, GuildMessages } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember, Channel} = Partials;

const { loadEvents } = require('./Handlers/eventHandler');
const { loadCommands } = require('./Handlers/commandHandler');


const client = new Client({
    intents: [Guilds, GuildMembers, GuildMessages],
    partials: [ User, Message, GuildMember, ThreadMember ],
});

const colors = require('colors')
colors.enable();

client.config = require('./config.json');
client.commands = new Collection()

client.login(client.config.token).then(() => {
    loadEvents(client);
    loadCommands(client);
});