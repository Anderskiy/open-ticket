const discord = require('discord.js')
const bot = require('../../index')
const client = bot.client
const config = bot.config
const log = bot.errorLog.log
const l = bot.language
const storage = bot.storage
const tsconfig = bot.tsconfig

/**
 * 
 * @param {String} name 
 * @param {String} id 
 * @param {Number} rawprocesstime milliseconds
 * @param {discord.User} user 
 */
exports.beingprocessed = (name,id,rawprocesstime,user) => {

    const newtime = rawprocesstime

    const processtime = "<t:"+newtime.getTime().toString().substring(0,newtime.getTime().toString().length-3)+":R>"

    const embed = new discord.EmbedBuilder()
        .setTitle("🧾 Transcript")
        .setColor(config.main_color)
        .setAuthor({name:user.tag,iconURL:user.displayAvatarURL()})
        .setFooter({text:name})

        .setDescription("`This transcript is being processed...`\nPlease wait!\n\nEstimated time: "+processtime)

    return embed
}


/**
 * 
 * @param {String} name 
 * @param {String} id 
 * @param {String} url
 * @param {discord.User} user 
 */
exports.tsready = (name,id,url,user) => {
    const embed = new discord.EmbedBuilder()
        .setTitle("🧾 Transcript")
        .setColor(config.main_color)
        .setAuthor({name:user.tag,iconURL:user.displayAvatarURL()})
        .setFooter({text:name})
        .setURL(url)

        .setDescription("\nThe transcript is available [here]("+url+")\n")

    return embed
}

/**
 * 
 * @param {String} name 
 * @param {String} id 
 * @param {discord.User} user 
 * @param {undefined|String} err
 */
exports.tserror = (name,id,user,err) => {
    const embed = new discord.EmbedBuilder()
        .setTitle("❌ Transcript")
        .setColor(discord.Colors.Red)
        .setAuthor({name:user.tag,iconURL:user.displayAvatarURL()})
        .setFooter({text:name})

        const errDesc = (typeof err == "string") ? "\n"+err : ""

        embed.setDescription("Something went wrong while creating the HTML transcript.\n\n[possible reasons](https://docs.openticket.dj-dj.be/the-system/transcripts/transcript-errors)"+errDesc)
    
    return embed
}
