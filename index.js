const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const token = '6358831520:AAGU2FJ9GxRxnw4h5aFi2pIgp6l3_YMtyw4';
const bot = new TelegramBot(token, {polling: true});

function validated(number) {
    const pattern = /^\d{12}$/;

    return pattern.test(number);
}

function date() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(currentDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
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
    const days = String(now.getDate()).padStart(2, '0');

    let row = [];
    for (let day = 1; day <= daysInMonth; day++) {
        if(day<10){
            row.push({
                text: day.toString(),
                callback_data: `${year}-${month}-0${day}_${hemisId}`,
            });
        }else {
            row.push({
                text: day.toString(),
                callback_data: `${year}-${month}-${day}_${hemisId}`,
            });
        }

        // Add 7 buttons per row
        if (row.length === 7 || day === daysInMonth) {
            keyboard.reply_markup.inline_keyboard.push(row);
            row = [];
        }
    }

    return keyboard;
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

    if(msg.text === '/info') return await bot.sendMessage(chatId, `Bu botdan faqat <b>OSIYO XALQARO UNVERSITETI 👨‍🎓👩‍🎓</b> talabalari foydalanishi mumkin!\nBot orqali talabalar dars jadvallarini olishlari mumkin!`, {
        parse_mode: 'HTML',
    });

    if (validated(msg.text)) {
        await bot.sendMessage(msg.chat.id, `Hemis ID qabul qilindi ✅`, {
            parse_mode: 'HTML'
        });
        await bot.sendMessage(msg.chat.id, `Iltimos kunni tanlang 📆\nFaqat shu oy uchun ` + date(), generateDatePicker(msg.text));

    } else {
        await bot.sendMessage(msg.chat.id, `Iltimos faqat raqamlardan foydalaning.\nHemis ID 12 raqamdan iborat bo'lishi shart❗️❗️❗️`)
    }
});

bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const hemisId = query.data.substr(11);
    const date = query.data.substr(0,10);
    var days = [
        "Yakshanba",
        "Dushanba",
        "Seshanba",
        "Chorshanba",
        "Payshanba",
        "Juma",
        "Shanba"
    ];
    // Send the selected date to your API backend
    try {
        const apiUrl = 'http://oxuoli.local/api/student/hemisID'; // Replace with your API URL
        const response = await axios.post(apiUrl, { date,hemisId });
        console.log(response.data,date)
       if(response.data.data != null){
           if(response.data.data.group != null){
               var text = `<b>${days[new Date(date).getDay()]} kuni dars jadvali: ${date}</b>\n
<b>---------------------------------------------------------</b>`;
               var schedule = response.data.data.group.schedule_full;
               for (let i=0; i<(schedule).length; i++){
                   text += `
<b>${schedule[i].lesson_pair.name} - juftlik 🟢</b>\n
<b>📘 ${schedule[i].subject.name}</b>
<b>📘 ${response.data.data.group.name}</b>
<b>🏷 ${schedule[i].training_type.name}</b>
<b>🚪 ${schedule[i].auditorium.name}</b>
<b>👨‍🏫 ${schedule[i].employee.name}</b>
<b>⏰ ${schedule[i].lesson_pair.start_time} - ${schedule[i].lesson_pair.end_time}</b>\n
<b>---------------------------------------------------------</b>`
               }
               await bot.sendMessage(chatId, text,{
                       parse_mode: 'HTML'
                   }
               );
           }else{
               await bot.sendMessage(chatId, `<b>Dars jadvali topilmadi 😕</b>`,{
                       parse_mode: 'HTML'
                   }
               );
           }
       }else{
           await bot.sendMessage(chatId, `<b>Bunday Hemis ID ga ega foydalanuvchi mavjud emas 🙅‍♂️</b>`,{
                   parse_mode: 'HTML'
               }
           );
       }

    } catch (error) {
        console.error(error.message);
    }
});

bot.on('polling_error', (error) => {
    console.error(error);
});