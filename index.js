const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const token = '6879220518:AAGu7Wg8MLFAe5M9jhB8uZ9sRfGS0IRpHBM';
const bot = new TelegramBot(token, {polling: true});

function validated(number) {
    const pattern = /^\d{12}$/;

    return pattern.test(number);
}

function generateDatePicker(hemisId) {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(); // You may want to adjust this based on the current month

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
            callback_data: `${year}-${month}-${day}_${hemisId}`,
        });

        // Add 7 buttons per row
        if (row.length === 7 || day === daysInMonth) {
            keyboard.reply_markup.inline_keyboard.push(row);
            row = [];
        }
    }

    return keyboard;
}

function date() {
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(currentDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}


bot.onText(/\/start/, async (msg) => {
    const chatID = msg.chat.id;
    const name = msg.from.first_name;

    await bot.sendMessage(chatID, `Assalomu aleykum <b>${name}</b> botimizga xush kelibsiz! 😊`, {
        parse_mode: 'HTML',
    });
    await bot.sendMessage(chatID, "<b>Iltimos telefon raqamingizni yuboring! 📞</b>", {
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

bot.on('contact', async (msg) => {
   await bot.sendMessage(msg.chat.id, `Telefon raqamingizni baham ko'rganingiz uchun tashakkur! 😊`, {
        reply_markup: {
            remove_keyboard: true,
        },
    });
});

bot.on("message", async (msg) => {
    if (msg.text === '/start') return;
    const chatId = msg.chat.id;
    if(msg.contact) return await bot.sendMessage(chatId, `<b>Iltimos hemisdagi o'zgarmas kodingizni yuboring! 📝</b>`, {
        parse_mode: 'HTML',
    });

    if (validated(msg.text)) {
        await bot.sendMessage(msg.chat.id, `Hemis ID qabul qilindi ✅`, {
            parse_mode: 'HTML'
        });
        await bot.sendMessage(msg.chat.id, `Iltimos kunni tanlang 📆\nFaqat shu oy uchun ` + date(), generateDatePicker(msg.text));
        var text = '';
        text = `<b>Chorshanba kuni dars jadvali: ${date()}</b>
<b>---------------------------------------------------------</b>
<b>1 - juftlik 🟢</b>\n
<b>📘 S1-IQ-22</b>
<b>🏷 Ma'ruza</b>
<b>🚪 5/10</b>
<b>👨‍🏫 Salimov B.S</b>
<b>⏰ 13:30-14:50</b>\n
<b>---------------------------------------------------------</b>
<b>2 - juftlik 🟡</b>\n
<b>📘 S1-IQ-22</b>
<b>🏷 Amaliy</b>
<b>🚪 3/5</b>
<b>👨‍🏫 Salimov B.S</b>
<b>⏰ 15:00-16:20</b>\n
<b>---------------------------------------------------------</b>
<b>3 - juftlik</b>\n
<b>📘 S1-IQ-22</b> 
<b>🏷 Seminar</b>
<b>🚪 4/8</b>
<b>👨‍🏫 Salimov B.S</b>
<b>⏰ 16:30-17:50</b>\n
`
        await bot.sendMessage(msg.chat.id, text,{
                parse_mode: 'HTML'
            }
        );
    } else {
        await bot.sendMessage(msg.chat.id, `Iltimos faqat raqamlardan foydalaning.\nHemis ID 12 raqamdan iborat bo'lishi shart❗️❗️❗️`)
    }
});

bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    const date = data.split(' ')[0]
    const hemisId = data.split(' ')[1]
    // Send the selected date to your API backend
    try {
        const apiUrl = 'http://oxuoli.local/api/student/hemisID'; // Replace with your API URL
        const response = await axios.post(apiUrl, { hemisId });
        bot.sendMessage(chatId,
            `${date} Chorshanba kuni dars jadvali \n📘 ${response.data.data.group.name} \n🏷 Ma'ruza\n🚪 5/10👨‍🏫 Salimov B.S\n⏰ 13:30-14:50`,
            {
                parse_mode: 'HTML'
            }
        );
        console.log(response.data);
    } catch (error) {
        console.error(error.message);
    }
});

bot.on('polling_error', (error) => {
    console.error(error);
});