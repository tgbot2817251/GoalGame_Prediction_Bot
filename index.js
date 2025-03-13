require('dotenv').config();
const TelegramBot = require("node-telegram-bot-api");
const schedule = require('node-schedule');

// Bot Token and Chat ID from .env
const token = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

const bot = new TelegramBot(token, { polling: true });

// Convert IST time to UTC (since Railway uses UTC time)
const convertISTtoUTC = (hour, minute) => {
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return {
        hour: date.getUTCHours(),
        minute: date.getUTCMinutes()
    };
};

// Prediction Timings (IST)
const predictionTimes = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

// Function to generate prediction grid
const generatePrediction = () => {
    const grid = Array.from({ length: 4 }, () => Array(7).fill('🟩'));
    for (let col = 0; col < 4; col++) {
        const row = Math.floor(Math.random() * 4);
        grid[row][col] = '⚽';
    }
    return grid.map(row => row.join('')).join('\n');
};

// Send Prediction Message
const sendPrediction = async () => {
    const message = `ɢᴏᴀʟ ɢᴀᴍᴇ ᴘʀᴇᴅɪᴄᴛɪᴏɴ ⚽💣\n\nꜰɪᴇʟᴅ: ᴍᴇᴅɪᴜᴍ\nᴍɪɴᴇꜱ: 1💣\nɢᴏᴀʟ ᴏᴘᴇɴ: 4⚽\n\n${generatePrediction()}`;

    const buttons = {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Best Game", url: "https://51game.com" }],
                [{ text: "Prediction Follow Process", url: "https://t.me/sachin" }]
            ]
        }
    };

    await bot.sendMessage(chatId, message, buttons);
    console.log("✅ Prediction message sent");

    // Send extra post after 60 seconds
    setTimeout(() => {
        bot.copyMessage(chatId, '@Only_4_photos', 34)
            .then(() => console.log("✅ Extra post (after prediction) sent"))
            .catch(err => console.error("❌ Error sending extra post:", err));
    }, 60000);
};

// Schedule for each prediction time
predictionTimes.forEach(time => {
    const [hour, minute] = time.split(':').map(Number);

    // Convert to UTC for Railway
    const predictionUTC = convertISTtoUTC(hour, minute);
    const prePredictionUTC = convertISTtoUTC(hour, minute - 3);

    // Pre-prediction Post (3 minutes before)
    schedule.scheduleJob({ hour: prePredictionUTC.hour, minute: prePredictionUTC.minute }, () => {
        bot.copyMessage(chatId, '@Only_4_photos', 33)
            .then(() => console.log("✅ Pre-prediction post sent"))
            .catch(err => console.error("❌ Error sending pre-prediction post:", err));
    });

    // Main Prediction
    schedule.scheduleJob({ hour: predictionUTC.hour, minute: predictionUTC.minute }, async () => {
        for (let i = 0; i < 20; i++) {
            await sendPrediction();
            await new Promise(res => setTimeout(res, 90000)); // 90 seconds delay
        }

        // Post after predictions end
        bot.copyMessage(chatId, '@Only_4_photos', 35)
            .then(() => console.log("✅ Post-prediction message sent"))
            .catch(err => console.error("❌ Error sending post-prediction message:", err));
    });
});

console.log('✅ Goal Prediction Bot is running...');
