const TelegramBot = require('node-telegram-bot-api');
const token = '6879220518:AAGu7Wg8MLFAe5M9jhB8uZ9sRfGS0IRpHBM';
const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/start/, (msg) => {
    const chatID = msg.chat.id;
    const name = msg.from.first_name;
    bot.sendMessage(chatID, `Assalomu aleykum <b>${name}</b> botimizga xush kelibsiz! Iltimos telefon raqamingizni yuboring!`, {
        parse_mode: 'HTML',
        reply_markup: {
            keyboard: [
                [{
                    text: `📞 Kontakt yuborish 📞`,
                    request_contact: true,
                }]
            ],
            resize_keyboard: true
        }
    });
});

function generateDatePicker() {
    const daysInMonth = 31; // Change this based on the current month

    const keyboard = {
        reply_markup: {
            inline_keyboard: [],
        },
    };

    let row = [];
    for (let day = 1; day <= daysInMonth; day++) {
        row.push({
            text: `📅 ${day}`,
            callback_data: `date_${day}`,
        });

        // Add 7 buttons per row
        if (row.length === 7 || day === daysInMonth) {
            keyboard.reply_markup.inline_keyboard.push(row);
            row = [];
        }
    }

    return keyboard;
}

bot.on('date',(msg)=> {})

bot.on('contact', (msg) => {
    const chatID = msg.chat.id;
    const phoneNumber = msg.contact.phone_number;

    bot.sendMessage(chatID, `Telefon raqamingizni baham ko'rganingiz uchun tashakkur!Qaysi sanadagi darsjadvalini olishni xohlaysiz.`,{
        reply_markup: {
            keyboard: [
                [{
                    text: '📅 Sanani tanlang!',
                    request_date: true,
                }]
            ],
            resize_keyboard: true
        },
    });
});

bot.on('polling_error', (error) => {
    console.error(error);
});