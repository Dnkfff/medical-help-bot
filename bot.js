'use strict';

const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);
const privateGroupID = process.env.GROUPID;
const axios = require('axios');

bot.use(async (ctx, next) => {
  if (ctx.updateSubTypes[0] === 'text') {
    bot.telegram.sendMessage(privateGroupID, ctx.from.username + ` написав: ${ctx.message.text}`);
  } else if (ctx.updateType === 'callback_query') {
    bot.telegram.sendMessage(privateGroupID, ctx.from.username + ' натиснув кнопку');
  } else {
    bot.telegram.sendMessage(privateGroupID, ctx.from.username + ` написав: ${ctx.updateSubTypes[0]}`);
  }
  next();
});

//start message logger
function sendStartMessage(ctx) {
  let startMessage = `Вітаю! Цей бот слугує особистим щоденником Дані,
                      в ньому записані всі аналізи та кількість таблеток яка
                      він випив протягом якогось часу`;
  if (ctx.from.username === 'ddynikov') {
    startMessage = 'Привіт хазяїн';
  }
  bot.telegram.sendMessage(ctx.chat.id, startMessage,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Я ендокренолог', callback_data: 'doc' }
          ],
          [
            { text: 'Я не лікар', callback_data: 'user' }
          ],
          [
            { text: 'інформація', callback_data: 'info' }
          ]
        ]
      }
    });
}

/* генерація видавання рандомних фактів за допомогою форіча 
 (probably error here xdddd)
 test this func
*/
const getData = async () => {
  const json = await axios(process.env.spreadsheets);
  const data = json.data.feed.entry;
  const factStore = [];
  data.forEach(item => {
    factStore.push({
      row: item.gs$cell.row,
      col: item.gs$cell.col,
      val: item.gs$cell.inputValue,
    });
  });
  return (factStore);
};

bot.action('doc', ctx => {
  const infoMessage = 'Дізнатись інформацію. Оберіть, що хочете дізнатись';
  ctx.deleteMessage();
  bot.telegram.sendMessage(ctx.chat.id, infoMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Попередні аналізи', callback_data: 'analyses' },
        ],
        [
          { text: 'Пігулки', callback_data: 'pills' },
        ],
        [
          { text: 'Повернутися в меню', callback_data: 'start' },
        ]
      ]
    }

  });

});

// bot.command('pills', ctx => {

// })

// bot.action('pills', ctx => {

// })

bot.action('analyses', ctx => {
  const infoMessage = 'Оберіть дату забору крові';
  ctx.deleteMessage();
  bot.telegram.sendMessage(ctx.chat.id, infoMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Гормони 22-05-2020', callback_data: 'gor1' },

        ],
        [
          { text: 'Гормони 01-04-2020', callback_data: 'gor2' },

        ],
        [
          { text: 'Гормони 30-10-2019', callback_data: 'gor3' },
        ],
        [
          { text: 'Гормони 29-08-2019', callback_data: 'gor4' },

        ],
        [
          { text: 'Повернутись назад', callback_data: 'doc' },
        ]
      ]
    }

  });

});

bot.action('user', ctx => {
  const infoMessage = 'Цей бот зберігає в собі дані аналізів.';
  ctx.deleteMessage();
  bot.telegram.sendMessage(ctx.chat.id, infoMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Рандомний факт', callback_data: 'fact' },
        ],
        [
          { text: 'Подивитись дослідження', callback_data: 'analyses' },
        ],
        [
          { text: 'Пігулки', callback_data: 'pills' },
        ],
        [
          { text: 'Повернутись назад', callback_data: 'start' },
        ]
      ]
    }
  });
});

bot.action('fact', async ctx => {
  const factStore = await getData();
  factStore.shift();
  const k = Math.floor(Math.random() * factStore.length);
  const fact = factStore[k];
  const message = `${fact.val}`;

  ctx.reply(message);
});

bot.command('update', async ctx => {
  try {
    ctx.reply('updated');
  } catch (err) {
    console.log(err);
    ctx.reply('ERROR');
  }
});

bot.command('start', ctx => {
  sendStartMessage(ctx);
});

bot.action('start', ctx => {
  ctx.deleteMessage();
  sendStartMessage(ctx);
});

/*об'єкт, який сторить в собі дати забору крові.
(в папці analyses вони підписани та за допомоги for loop код обробляє дані); */
const initial = {
  first: '22-05-20',
  second: '01-04-2020',
  third: '30-10-2019',
  fourth: '29-08-2019',
};

for (let i = 1; i <= 4; i++) {
  let date = initial.first;

  bot.action(`gor${i}`, ctx => {
    bot.telegram.sendPhoto(ctx.chat.id, {
      source: `analyses/gor${date}.jpg`
    });
  });
  if (i === 2) {
    date = initial.second;
  } else if (i === 3) {
    date = initial.third;
  } else if (i === 4) {
    date = initial.fourth;
  }
}

// bot.command('/info', (ctx) => {
//     ctx.reply('123')
// });

bot.telegram.setWebhook(`${process.env.BOT_URL}/bot${process.env.BOT_TOKEN}`);
bot.startWebhook(`/bot${process.env.BOT_TOKEN}`, null, process.env.PORT);
