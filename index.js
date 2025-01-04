const secret_token=require('./secrets');
const telegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');


const token=secret_token.token;

const bot = new telegramBot(token, {polling: true});

//bot.setMyDescription("Welcome to the Domainteller bot. Send a domain name to get information about it.");

bot.setMyCommands([
    {command: '/start', description: 'Welcome message'},
    {command: '/domain', description: 'Get information about a domain'}
]);

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id,
         "Welcome");
});


async function getAge(domainAddress){

    try{
        let url=`https://whatsmydns.net/api/domain?q=${domainAddress}`;
        let res=await fetch(url,{signal: AbortSignal.timeout(5000),headers: {'Content-Type': 'application/json', 'user-agent': 'Mozilla/5.0'}});
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
    } catch(exc){
        return exc;
    }
}


bot.on(/^([a-zA-Z0-9-]+\.[a-zA-Z]{2,})$/,async (msg)=>{
    let domain=msg.text;
    try{
        let domainInfo=await getAge(domain);
        let message=`Domain: ${domain}\nCreation Date: ${domainInfo.creationDate} ${domainInfo.creationTime}\nUpdation Date: ${domainInfo.updationDate} ${domainInfo.updationTime}\nExpiration Date: ${domainInfo.expirationDate} ${domainInfo.expirationTime}`;
        bot.sendMessage(msg.chat.id, message);
    } catch(exc){
        bot.sendMessage(msg.chat.id, `exception occured`);
    }
});

// bot.on('message', (msg) => {
//     bot.sendMessage(msg.chat.id, `I'm sorry, that's not a valid domain name. Please try again.`);
// }); 