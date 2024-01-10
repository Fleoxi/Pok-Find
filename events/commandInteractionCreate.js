const {Events} = require('discord.js');
const chalk = require('chalk');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if(!interaction.isChatInputCommand()) return;
        const command = interaction.client.commands.get(interaction.commandName);

        if(!command) {
            return;
        }

        try {
            await command.execute(interaction);
        } catch(error) {
            console.log(chalk.red('ERROR: ') + `\tAn error occured during executing ${interaction.commandName}:`);
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({content: "Une erreur est survenue.\n```" + error + "```", ephemeral: true})
            } else {
                await interaction.reply({content: "Une erreur est survenue.\n```" + error + "```", ephemeral: true})
            }
        }
    }
}