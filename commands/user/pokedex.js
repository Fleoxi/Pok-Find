const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const {stripIndents} = require('common-tags');

module.exports = {
    category: "Utilisateur",
    data: new SlashCommandBuilder()
        .setName('pokemon')
        .setDescription("Permet d'avoir des informations sur un pokémon.")
        .addStringOption(option => 
            option
                .setName('pokemon')
                .setDescription('Nom du Pokémon')
                .setRequired(true)
        )
    ,
    async execute(interaction) {
        const pokemonName = interaction.options.getString('pokemon');
        const apiCall = await fetch(`${process.env.ENTRY_API}/pokemon/${pokemonName}`);
        
        if(apiCall.ok) {
            const data = await apiCall.json();
            
            if(data?.status === 404) {
                return interaction.reply({content: data.message ?? `Une erreur inconnue est survenue durant la requête API (Code ${data.status})`, ephemeral: true});
            }

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle(`ID ${data.pokedexId ?? 0} - ${data.name.fr ?? 'N/A'}`)
                .setAuthor({name: 'Poké Find'})
                .setThumbnail(data.sprites.regular)
                .setURL(`https://pixelmonmod.com/wiki/${data.name?.en}`)
                .setDescription(stripIndents`
                **Catégorie**: ${data.category ?? 'N/A'}
                **Génération**: ${data.generation ?? 'N/A'}
                **Taille**: ${data.height ?? 'N/A'}
                **Poids**: ${data.weight ?? 'N/A'}
                **Types d'Oeufs**: ${data.egg_groups?.join(', ') ?? 'Aucun'}
                `)
                .setFooter({text: 'Poké Find - Fièrement propulsé par Tyradex.tech'})
                .setTimestamp()
            ;

            embed.addFields({name: 'Type(s)', value: (data.types.map(type => type.name)).join(', '), inline: true});
            embed.addFields({name: 'Talent(s)', value: (data.talents.map(talent => talent.name)).join(', '), inline: true});
            embed.addFields({name: 'Statistiques', value: stripIndents`
                Santé: ${data.stats.hp}
                ATK: ${data.stats.atk}
                DEF: ${data.stats.def}
                ATK Spé: ${data.stats.spe_atk}
                DEF Spé: ${data.stats.spe_def}
                Vitesse: ${data.stats.vit}
            `, inline: true});
            embed.addFields({name: 'Résistance(s) et Faiblesse(s)', value: (data.resistances
                .filter(resistance => resistance.multiplier != 1)
                .map(resistance => `${resistance.multiplier > 1 && ':fearful: Redoute' || ':muscle: Résiste'} : ${resistance.name} (${resistance.multiplier * 100} %)`))
            .join('\n'), inline: false});

            if(data.evolution?.pre) {
                embed.addFields({name: 'Précédente(s) évolution(s)', value: (data.evolution.pre.map(evolution => `${evolution.name} : ${evolution.condition}`)).join('\n'), inline: false});
            }

            if(data.evolution?.next) {
                embed.addFields({name: 'Évolution(s) suivante(s)', value: (data.evolution.next.map(evolution => `${evolution.name} : ${evolution.condition}`)).join('\n'), inline: false});
            }

            return interaction.reply({embeds: [embed], ephemeral: true});
        } else {
            throw new Error(`Erreur lors de la requête API. Statut ${apiCall.status}`);
        }
    }
}