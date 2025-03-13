require('dotenv').config();
const TelegramBot = require("node-telegram-bot-api");
const schedule = require('node-schedule'); // Import node-schedule

// 🔥 Use the token from the environment variable
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// 🔥 Private or Public Channel ID from .env
const chatId = process.env.CHANNEL_ID;

// Prediction timings (India Time)
const predictionTimes = [
    '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
];

// Function to generate a prediction grid
const generatePrediction = () => {
    const grid = Array.from({ length: 4 }, () => Array(7).fill('🟩'));
    for (let col = 0; col < 4; col++) {
        const row = Math.floor(Math.random() * 4);
        grid[row][col] = '⚽';
    }
    return grid.map(row => row.join('')).join('\n');
};

// Function to send a prediction with buttons
const sendPrediction = async () => {
    const message = `ɢᴏᴀʟ ɢᴀᴍᴇ ᴘʀᴇᴅɪᴄᴛɪᴏɴ ⚽💣\n\nꜰɪᴇʟᴅ: ᴍᴇᴅɪᴜᴍ\nᴍɪɴᴇꜱ: 1💣\nɢᴏᴀʟ ᴏᴘᴇɴ: 4⚽\n\n${generatePrediction()}`;

    const buttons = {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🎮 51 Game Register", url: "https://www.team19.in/bestgame.html" }],
                [{ text: "🤝 Prediction Follow Process", url: "https://t.me/GoalGame_Prediction/355" }]
            ]
        }
    };

    await bot.sendMessage(chatId, message, buttons);

    // Send the extra post after 60 seconds
    setTimeout(() => {
        bot.copyMessage(chatId, '@Only_4_photos', 34);
    }, 60000);
};

// Scheduler for each prediction time
predictionTimes.forEach(time => {
    const [hour, minute] = time.split(':');

    // Pre-prediction post 3 minutes before
    schedule.scheduleJob({ hour: +hour, minute: +minute - 3 }, () => {
        bot.copyMessage(chatId, '@Only_4_photos', 33);
    });

    // Start prediction at the exact time
    schedule.scheduleJob({ hour: +hour, minute: +minute }, async () => {
        for (let i = 0; i < 20; i++) {
            await sendPrediction();
            await new Promise(res => setTimeout(res, 90000)); // Wait 90 seconds
        }

        // Post after predictions end
        bot.copyMessage(chatId, '@Only_4_photos', 35);
    });
});

console.log('✅ Goal Prediction Bot is running...');
