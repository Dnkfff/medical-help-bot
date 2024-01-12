'use strict';

const axios = require('axios');

// генерація фактів, які треба поповнювати за допомогою гугл таблички
// імплементувати з нейронкою
const getFact = async () => {
  const json = await axios(process.env.GOOGLE_SHEET);
  const data = json.data.feed.entry;
  const factStore = [];
  data.forEach(item => {
    factStore.push({
      row: item.gs$cell.row,
      col: item.gs$cell.col,
      val: item.gs$cell.inputValue,
    });
  });
  return factStore;
};

const getDose = async () => {
  const json = await axios(process.env.GOOGLE_SHEET);
  const data = json.data.feed.entry;
  const doseStore = [];
  data.forEach(item => {
    doseStore.push({
      row: item.gs$cell.row,
      col: item.gs$cell.col,
      val: item.gs$cell.inputValue,
    });
  });
  return doseStore;
};

function sendStartMessage(ctx, bot) {
  let startMessage = `Вітаю! Цей бот слугує особистим щоденником Дані,
                      в ньому записані всі аналізи та кількість таблеток яка
                      він випив протягом якогось часу`;
  if (ctx.from.username === 'ddynikov') {
    startMessage = 'Привіт хазяїн';
  } else if (ctx.from.username === 'tshemsedinov') {
    startMessage = `Ку викладач!
      То колись була моя курсова`;
  }
  bot.telegram.sendMessage(ctx.chat.id, startMessage,
    {
      'reply_markup': {
        'inline_keyboard': [
          [
            { text: 'Подивитись аналізи та/або дозування', 'callback_data': 'doc' }
          ],
          [
            { text: 'Якісь рандомні факти з медицини xD', 'callback_data': 'fact' }
          ],
        ]
      }
    });
}

module.exports = {
  getFact,
  getDose,
  sendStartMessage,
};
