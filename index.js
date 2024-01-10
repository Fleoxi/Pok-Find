const { Client, REST, Collection, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const chalk = require('chalk');
require('dotenv').config();

// Create Discord client
const bot = new Client({intents: []});

// Instances
bot.commands = new Collection();
bot.models = [];

// Command Handler
const globalCommands = [];

const commandsDir = path.join(__dirname, 'commands');
const commandsFolders = fs.readdirSync(commandsDir);

console.log(chalk.blue('PROCESSING: ') + '\tStart command loading.');
for (const folder of commandsFolders) {
	const commands = path.join(commandsDir, folder);
	const commandsFiles = fs.readdirSync(commands).filter(file => file.endsWith('.js'));

	for (const file of commandsFiles) {
		const filePath = path.join(commands, file);
		const command = require(filePath);

		if ('data' in command && 'execute' in command) {
			globalCommands.push(command.data.toJSON());
			bot.commands.set(command.data.name, command);
		}
		else {
			console.log(chalk.yellow('WARNING: ') + `\tThe command ${filePath} is missing required property`);
		}
	}
}
console.log(chalk.green('SUCCESS: ') + '\tCommands loaded.');

// Event Handler
const events = path.join(__dirname, 'events');
const eventsFiles = fs.readdirSync(events).filter(file => file.endsWith('.js'));

console.log(chalk.blue('PROCESSING: ') + '\tStart events loading.');
for (const file of eventsFiles) {
	const filePath = path.join(events, file);
	const event = require(filePath);
	if (event.once) {
		bot.once(event.name, (...args) => event.execute(...args));
	}
	else {
		bot.on(event.name, (...args) => event.execute(...args));
	}
}
console.log(chalk.green('SUCCESS: ') + '\tEvents loaded.');

// Register commands
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
	console.log(chalk.blue('PROCESSING: ') + '\tSend commands to Discord API to be refreshed.');

	try {
		// Global Commands
		await rest.put(
			Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
			{ body: globalCommands },
		);
	}
	catch (error) {
		console.log(chalk.red('ERROR: ') + '\tAn error occured during refreshing applications commands:');
		console.error(error);
	}

	console.log(chalk.green('SUCCESS: ') + '\tCommands ready to be used.');
})();

// Login to Discord API
bot.login(process.env.DISCORD_TOKEN);

module.exports = bot;