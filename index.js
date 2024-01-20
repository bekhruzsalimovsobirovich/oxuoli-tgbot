const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const token = '6879220518:AAGu7Wg8MLFAe5M9jhB8uZ9sRfGS0IRpHBM';
const bot = new TelegramBot(token, {polling: true});

function validated(number) {
    const pattern = /^\d{12}$/;

    return pattern.test(number);
}

function generateDatePicker() {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate(); // You may want to adjust this based on the current month

    const keyboard = {
        reply_markup: {
            inline_keyboard: [],
        },
    };
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(now.getDate()).padStart(2, '0');

    // const formattedDate = `${year}-${month}-${day}`;

    let row = [];
    for (let day = 1; day <= daysInMonth; day++) {
        row.push({
            text: day.toString(),
            callback_data: `${year}-${month}-${day}`,
        });

        // Add 7 buttons per row
        if (row.length === 7 || day === daysInMonth) {
            keyboard.reply_markup.inline_keyboard.push(row);
            row = [];
        }
    }

    return keyboard;
}


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

    bot.on('contact', (msg) => {
        bot.sendMessage(msg.chat.id, `Telefon raqamingizni baham ko'rganingiz uchun tashakkur! Iltimos hemisdagi o'zgarmas kodingizni yuboring!.`, {
            reply_markup: {
                remove_keyboard: true,
            },
        });
        bot.on('message', (msg) => {
            const currentDate = new Date();

            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
            const day = String(currentDate.getDate()).padStart(2, '0');

            const formattedDate = `${year}-${month}-${day}`;
            if (validated(msg.text)) {
                const hemis_id = msg.text;
                bot.sendMessage(msg.chat.id, `Hemis ID qabul qilindi ✅`);
                bot.sendMessage(msg.chat.id, `Iltimos kunni tanlang: ` +formattedDate,generateDatePicker());
                bot.on('callback_query', async (query) => {
                    const chatId = query.message.chat.id;
                    const date = query.data;

                    // Send the selected date to your API backend
                    try {
                        const apiUrl = 'http://oxuoli.local/api/student/hemisID'; // Replace with your API URL
                        const response = await axios.post(apiUrl, { hemis_id, date});
                        bot.sendMessage(chatId, `${date} Chorshanba kuni dars jadvali \n📘 ${response.data.data.group.name} \n`,{
                            parse_mode: 'HTML'
                        });
                        console.log(response.data);
                    } catch (error) {
                        console.error(error.message);
                    }
                });
            } else {
                bot.sendMessage(msg.chat.id, `Iltimos faqat raqamlardan foydalaning. Hemis id 12 raqamdan iborat bo'lishi shart❗️❗️❗️`)
            }
        });
    });
});

// bot.on('callback_query', async (query) => {
//     const chatId = query.message.chat.id;
//     const date = query.data.replace('date_', '');
//
//     bot.sendMessage(chatId, `You selected the date: ${date}`);
//
//     // Send the selected date to your API backend
//     try {
//         const apiUrl = 'http://oxuoli.local/api/student/hemisID'; // Replace with your API URL
//         const response = await axios.post(apiUrl, { date });
//
//         console.log('Backend API response:', response.data);
//     } catch (error) {
//         console.error('Error sending data to the backend API:', error.message);
//     }
// });


bot.on('polling_error', (error) => {
    console.error(error);
});