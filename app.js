require("dotenv").config();
const { forEach } = require("lodash");
const { listenerCount } = require("node-telegram-bot-api");

const BotToken = process.env.BOT_TOKEN;
var TelegramBot = require("node-telegram-bot-api"),
  telegram = new TelegramBot(BotToken, { polling: true });

//initialise global user array
let chatTasklistMap = new Map();
let tasklist = [];
var user_array = [];
//scan array for user
function auth_usr(telegram_id) {
  for (var i = 0; i < user_array.length; i++) {
    if (user_array[i].tele_id === telegram_id) {
      return i;
    }
  }
  return 0;
}

// function to store following messages from user
telegram.nextMessage = {};
telegram.onNextMessage = (chatId, callback) => {
  let promise = new Promise((resolve) => {
    telegram.nextMessage[chatId] = { callback: callback, next: resolve };
  });
  return promise;
};

// telegram bot to listen to any incoming message
telegram.on("message", (message) => {
  let nextMsg = telegram.nextMessage[message.chat.id];
  if (nextMsg) {
    nextMsg.callback(message);
    nextMsg.next(message);
    telegram.nextMessage[message.chat.id] = undefined;
  }
});

// function to add new task item into task list
function newStress(telegramChatId, newTask) {
  //   if (chatTasklistMap.has(telegramChatId)) {
  tasklist.push(newTask);
  chatTasklistMap.set(telegramChatId, { tasklist: tasklist });
}

//declare bot logic, on text event
telegram.on("text", (message) => {
  //listen for 'start' bot command
  if (message.text.toLowerCase().indexOf("/start") === 0) {
    var user_text = message.text.replace("/start ", "");
    if (user_text === "/start") {
      telegram.sendMessage(
        message.chat.id,
        "Hello, I see " +
          message.from.first_name +
          " requires some peer pressure to keep up with your work. Welcome! Everyone shall be pressured together!",
        {
          parse_mode: "Markdown",
        }
      );
    }
  }
  //listen for 'hello' bot command
  if (message.text.toLowerCase().indexOf("/hello") === 0) {
    var user_text = message.text.replace("/hello ", "");
    if (user_text === "/hello") {
      //then reply to the user with a message
      telegram.sendMessage(message.chat.id, "Hello " + message.from.first_name);
    }
  }

  //listen for 'pmMe' bot command
  if (message.text.toLowerCase().indexOf("/pmme") === 0) {
    //then reply to the user with a message
    telegram.sendMessage(
      message.from.id,
      "Hello, " + message.from.first_name + " you sneaky bastard."
    );
  }

  //listen for 'addStressor' bot command
  if (message.text.toLowerCase().indexOf("/addstressor") === 0) {
    //strip the command from the string, to get the user_text
    //var user_text = message.text.split("/addstress ");
    telegram
      .sendMessage(
        message.chat.id,
        "What new task would you like to stress everyone about?"
      )
      .then(() => {
        return telegram.onNextMessage(
          message.chat.id,
          (message) => (stressor = message.text)
        );
      })
      .then(() => {
        telegram.sendMessage(
          message.chat.id,
          "I've added a new task to stress everyone with! Now we can all stress about " +
            stressor +
            " together. How exciting!"
        );
      });
  }

  //listen for 'done' bot command
  if (message.text.toLowerCase().indexOf("/done") === 0) {
    //strip the command from the string, to get the user_text
    var user_text = message.text.slice(6);
    if (user_text === "") {
      telegram.sendMessage(message.from.id, "Which task are you done with?");
      //check if its a valid "index" number
    } else {
      var user_text = message.text;
      if (user_text > 0 && user_text <= tasklist.length) {
        var doneTask = tasklist[user_array - 1];
        telegram.sendMessage(
          message.from.id,
          "Everyone, " +
            message.from.first_name +
            " is done with " +
            doneTask.toString() +
            ". Better hurry up or you'll be the last to finish!"
        );
      }
    }
    //iterate through array to see what's stored
    //tasklist.forEach(item => console.log(item));
  }

  //listen for 'listStressors' bot command
  if (message.text.toLowerCase().indexOf("/liststressors") === 0) {
    let stressList = "";
    let i = 1;
    tasklist.forEach((stressor) => {
      stressList += i + ". " + stressor + "\n";
      i += 1;
      console.log(stressList);
    });
    telegram.sendMessage(
      message.chat.id,
      "These are the things you all have to stress about:\n" + stressList
    );
    //iterate through array to see what's stored
    //tasklist.forEach(item => console.log(item));
  }

  //listen for 'everyonesDone' bot command
  if (message.text.toLowerCase().indexOf("/everyonesdone") === 0) {
    //strip the command from the string, to get the user_text
    var user_text = message.text.slice(14);
    console.log(user_text);
    if (user_text === "") {
      telegram.sendMessage(message.from.id, "Which task are you done with?");

      //check if its a valid "index" number
    }
    if (user_text > 0 && user_text <= tasklist.length) {
      var doneTask = tasklist.splice(user_text - 1, 1);
      telegram.sendMessage(
        message.from.id,
        "Everyone, " +
          message.from.first_name +
          " is done with " +
          doneTask.toString() +
          ". Better hurry up or you'll be the last to finish!"
      );
    }
    //need try-catch/one more for non-valid "index" numbers?

    //iterate through array to see what's stored
    //tasklist.forEach(item => console.log(item));
    return;
  }

  telegram.onText(/\/commands/, (msg) => {
    telegram.sendMessage(
      msg.chat.id,
      "Here are all the commands that are currently available.",
      {
        reply_markup: {
          keyboard: [
            ["/start"],
            ["/pmMe"],
            ["/listStressors"],
            ["/addStressor"],
            ["/done"],
            ["/everyonesDone"],
          ],
          one_time_keyboard: true,
        },
      }
    );
  });

  //   //respond when user sends anything, not very safe, as you can imagine
  //   telegram.on("message", (message) => {
  //     //do something here, message is the variable that contains the JSON, say message.text, or message.photo, etc.
  //   });
  //receive image content
  telegram.on("photo", (message) => {
    telegram.sendMessage(
      message.from.id,
      "*Photograph Received*\nYou sent a photo to me.",
      { parse_mode: "Markdown" }
    );
  });
  //receive audio content
  telegram.on("audio", (message) => {
    telegram.sendMessage(
      message.from.id,
      "*Audio Received*\nYou sent audio to me.",
      { parse_mode: "Markdown" }
    );
  });
  //receive document content
  telegram.on("document", (message) => {
    telegram.sendMessage(
      message.from.id,
      "*Document Received*\nYou sent a document to me.",
      { parse_mode: "Markdown" }
    );
  });
  //receive sticker content
  telegram.on("sticker", (message) => {
    telegram.sendMessage(
      message.from.id,
      "*Sticker Received*\nYou sent a sticker to me.",
      { parse_mode: "Markdown" }
    );
  });
  //receive video content
  telegram.on("video", (message) => {
    telegram.sendMessage(
      message.from.id,
      "*Video Received*\nYou sent a video to me.",
      { parse_mode: "Markdown" }
    );
  });
  //receive voice content
  telegram.on("voice", (message) => {
    telegram.sendMessage(
      message.from.id,
      "*Voice Received*\nYou sent a voice to me.",
      { parse_mode: "Markdown" }
    );
  });
  //receive contact content
  telegram.on("contact", (message) => {
    telegram.sendMessage(
      message.from.id,
      "*Contact Received*\nYou sent a contact to me.",
      { parse_mode: "Markdown" }
    );
  });
  //receive location content
  telegram.on("location", (message) => {
    telegram.sendMessage(
      message.from.id,
      "*Location Received*\nYou sent a location to me.",
      { parse_mode: "Markdown" }
    );
  });
});

// const axios = require("axios");
// const Telegraf = require("telegraf"); // import telegraf lib
// require("dotenv").config();

// const bot = new Telegraf(process.env.BOT_TOKEN); // get the token from env variable
// bot.start((ctx) =>
//   ctx.reply(
//     "Hello, I see you require some peer pressure to keep up with your work. Welcome!"
//   )
// ); // display Welcome text when we start bot

// bot.help((ctx) =>
//   ctx.reply(
//     "This bot can perform the following commands:\n - /start to initialise\n - /help to view all commands available"
//   )
// );
// bot.command("hipster", Telegraf.reply("λ"));
// bot.hears("hi", (ctx) => ctx.reply("Hey there")); // listen and handle when user type hi text
// bot.catch((err, ctx) => {
//     console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
//   })
//   bot.start((ctx) => {
//     throw new Error('Example error')
//   })
//   bot.launch()

//how to control how the bot replies to users
//send to message.from.id to restrict messaging between the user and bot only
//send to message.chat.id to allow the bot to respond to any user via any group or channel
//initialise telegram bot
