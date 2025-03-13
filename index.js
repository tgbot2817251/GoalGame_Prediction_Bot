require('dotenv').config();
const TelegramBot = require("node-telegram-bot-api");
const schedule = require('node-schedule');
const moment = require('moment-timezone');

// Bot token and channel ID
const token = process.env.BOT_TOKEN;
const chatId = process.env.CHANNEL_ID;
const bot = new TelegramBot(token, { polling: true });

// Prediction timings in IST
const predictionTimesIST = [
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

// Function to send the main prediction
const sendPrediction = async () => {
    const message = `ɢᴏᴀʟ ɢᴀᴍᴇ ᴘʀᴇᴅɪᴄᴛɪᴏɴ ⚽💣\n\nꜰɪᴇʟᴅ: ᴍᴇᴅɪᴜᴍ\nᴍɪɴᴇꜱ: 1💣\nɢᴏᴀʟ ᴏᴘᴇɴ: 4⚽\n\n${generatePrediction()}`;

    const buttons = {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🎮 Best Game Link", url: "https://www.team19.in/bestgame.html" }],
                [{ text: "🤝 Prediction Follow Process", url: "https://t.me/GoalGame_Prediction/395" }]
            ]
        }
    };

    await bot.sendMessage(chatId, message, buttons);
    
    // Extra post after 60 seconds
    setTimeout(() => {
        bot.copyMessage(chatId, '@Only_4_photos', 34);
        console.log("✅ Extra post sent after prediction.");
    }, 60000);
};

// Function to schedule jobs accurately
const scheduleJob = (hour, minute, callback, description) => {
    // Convert time to UTC for scheduling
    const timeInUTC = moment.tz({ hour, minute }, "Asia/Kolkata").utc();
    schedule.scheduleJob({ hour: timeInUTC.hour(), minute: timeInUTC.minute() }, callback);
    console.log(`✅ Scheduled ${description} at ${timeInUTC.format('HH:mm')} UTC (${hour}:${minute} IST)`);
};

// Loop to schedule all tasks
predictionTimesIST.forEach(time => {
    let [hour, minute] = time.split(':').map(Number);

    // Pre-prediction time calculation
    let preMinute = minute - 3;
    let preHour = hour;
    if (preMinute < 0) {
        preMinute += 60;
        preHour = (preHour - 1 + 24) % 24;
    }

    // Pre-prediction post
    scheduleJob(preHour, preMinute, () => {
        bot.copyMessage(chatId, '@Only_4_photos', 33);
        console.log(`⚠️ Pre-prediction post sent for ${time}`);
    }, `Pre-prediction for ${time}`);

    // Main prediction process
    scheduleJob(hour, minute, async () => {
        console.log(`🚀 Starting predictions for ${time}`);
        for (let i = 0; i < 20; i++) {
            await sendPrediction();
            await new Promise(res => setTimeout(res, 90000)); // Wait 90 seconds
        }

        // Post after predictions end
        bot.copyMessage(chatId, '@Only_4_photos', 35);
        console.log(`✅ Post-prediction message sent for ${time}`);
    }, `Main prediction for ${time}`);
});

console.log('✅ Goal Prediction Bot is running with accurate IST timing...');
