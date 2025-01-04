const secret_token=require('./secrets.json');
const token=secret_token.token;
const telegram = require('telegram-bot-api');
const sh=require('superheroes');


const bot=new telegram(token, {autoUpdate: true});

bot.setDescription("Welcome to the Domainteller bot. Send a domain name to get information about it.");

bot.setMyCommands([
    {command: '/start', description: 'Welcome message'},
    {command: '/domain', description: 'Get information about a domain'}
]);


async function getAge(domainAddress){
    let url=`https://whatsmydns.net/api/domain?q=${domainAddress}`;
    let res=await fetch(url);
    let data=await res.json();
    let creation=new Date(data.data.created);
    let updation=new Date(data.data.updated);
    let expiration=new Date(data.data.expires);
    let creationDate=creation.toLocateDateString();
    let creationTime=creation.toLocaleTimeString();
    let updationDate=updation.toLocateDateString();
    let updationTime=updation.toLocaleTimeString();
    let expirationDate=expiration.toLocateDateString();
    let expirationTime=expiration.toLocaleTimeString();

    return {
        creationDate,
        creationTime,
        updationDate,
        updationTime,
        expirationDate,
        expirationTime
    }
}

bot.on('/\/start/',(msg)=>{
    bot.sendMessage(msg.chat.id,`Welcome `);
});

bot.on(/^([a-zA-Z0-9-]+\.[a-zA-Z]{2,})$/,async (msg)=>{
    let domain=msg.text;
    let domainInfo=await getAge(domain);
    let message=`Domain: ${domain}\nCreation Date: ${domainInfo.creationDate} ${domainInfo.creationTime}\nUpdation Date: ${domainInfo.updationDate} ${domainInfo.updationTime}\nExpiration Date: ${domainInfo.expirationDate} ${domainInfo.expirationTime}`;
    bot.sendMessage(msg.chat.id, message);
});

bot.on('message', (msg) => {
    bot.sendMessage(msg.chat.id, `I'm sorry, that's not a valid domain name. Please try again.`);
});