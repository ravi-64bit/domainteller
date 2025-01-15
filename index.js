const secrets = require('./secrets');
const telegramBot = require('node-telegram-bot-api');
//const fetch=require('node-fetch');

const token = secrets.token;
const api_key=secrets.api_key;

const bot = new telegramBot(token, { polling: true });

bot.setMyCommands([
    { command: '/start', description: 'Welcome message' },
    { command: '/domain', description: 'Get information about a domain' }
]);

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome");
});

bot.onText(/\/domain/, (msg) => {
    bot.sendMessage(msg.chat.id, "Please enter the domain name you want to query.");
});

async function getAge(domainAddress) {
    //new url = https://api.api-ninjas.com/v1/domain?domain=example.com
    const url = `https://api.api-ninjas.com/v1/domain?domain=${domainAddress}`;
    try {
        const response = await axios.get(url, {
            headers: { 'user-agent': 'Mozilla/5.0',
                'X-Api-Key': api_key},
                timeout: 5000 
        });

        const data = response.data;
        
        let dom=data.domain;
        let availibility=data.available;
        let creationDate = new Date(data.creation_date);
        let registrar=data.registrar;
        
        if(availibility){
            return creationDate;
        }
        else{
            return 'Domain not yet registered';
        }


    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch domain data or request timed out');
    }
}

// Handle domain query
bot.on(/^([a-zA-Z0-9-]+\.[a-zA-Z]{2,})$/, async (msg) => {
    const domain = msg.text;
    try {
        const domainInfo = await getAge(domain);
        const message = `
            Domain: ${domain}
            Creation Date: ${domainInfo.creationDate} ${domainInfo.creationTime}
            Updation Date: ${domainInfo.updationDate} ${domainInfo.updationTime}
            Expiration Date: ${domainInfo.expirationDate} ${domainInfo.expirationTime}
        `;
        bot.sendMessage(msg.chat.id, message);
    } catch (error) {
        bot.sendMessage(msg.chat.id, "Sorry, I couldn't fetch domain information. Please try again later.");
    }
});

// Default message handling (if it's not a valid domain)
bot.on('message', (msg) => {
    if (!/^([a-zA-Z0-9-]+\.[a-zA-Z]{2,})$/.test(msg.text)) {
        bot.sendMessage(msg.chat.id, "I'm sorry, that's not a valid domain name. Please try again.");
    }
});
