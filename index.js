const secret_token = require('./secrets');
const telegramBot = require('node-telegram-bot-api');
const fetch=require('node-fetch');

const token = secret_token.token;

const bot = new telegramBot(token, { polling: true });

bot.setMyCommands([
    { command: '/start', description: 'Welcome message' },
    { command: '/domain', description: 'Get information about a domain' }
]);

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome");
});

async function getAge(domainAddress) {
    const url = `https://whatsmydns.net/api/domain?q=${domainAddress}`;
    try {
        const response = await axios.get(url, {
            headers: { 'Content-Type': 'application/json', 'user-agent': 'Mozilla/5.0' },
            timeout: 5000 // 5-second timeout
        });

        const data = response.data;
        const creation = new Date(data.data.created);
        const updation = new Date(data.data.updated);
        const expiration = new Date(data.data.expires);

        const creationDate = creation.toLocaleDateString();
        const creationTime = creation.toLocaleTimeString();
        const updationDate = updation.toLocaleDateString();
        const updationTime = updation.toLocaleTimeString();
        const expirationDate = expiration.toLocaleDateString();
        const expirationTime = expiration.toLocaleTimeString();

        return {
            creationDate,
            creationTime,
            updationDate,
            updationTime,
            expirationDate,
            expirationTime
        };
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
