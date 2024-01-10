const {Events, ActivityType} = require('discord.js');
const chalk = require('chalk');

async function updatePresence(client) {
    client.user.setPresence({
        activities: [
            {name: `un pokédex complet`, type: ActivityType.Watching}
        ],
        status: 'dnd'
    });
}

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        // Set Presence
        updatePresence(client);
        setInterval(() => updatePresence(client), 60000);

        console.log(chalk.green('SUCCESS:') + '\tPoké Find successfully started.');
    }
}