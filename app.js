const { listenerCount } = require("node-telegram-bot-api");

require("dotenv").config();
const BotToken = process.env.BOT_TOKEN;
var TelegramBot = require("node-telegram-bot-api"),
  telegram = new TelegramBot(BotToken, { polling: true });
//declare user object

function telegram_user() {
  this.telegram_id = 0; //integer for storing the id
  this.telegram_username = null; //null for storing some string
  this.telegram_firstname = null;
  this.telegram_lastname = null;
  this.some_state = 0;
  this.some_other_state = 0;
  this.some_array = [];
  this.some_other_array = []; //yes you can store arrays in objects
  this.store_some_message = null;
}
//initialise global user array
let chatTasklistMap = new Map();
let tasklist = [];
var user_array = [];
user_array.push(new telegram_user()); //i just like to fill the [0] with a blank user
//scan array for user
function auth_usr(telegram_id) {
  for (var i = 0; i < user_array.length; i++) {
    if (user_array[i].tele_id === telegram_id) {
      return i;
    }
  }
  return 0;
}
function newStress(telegramChatId, newTask) {
  //   if (chatTasklistMap.has(telegramChatId)) {
    tasklist.push(newTask);
    chatTasklistMap.set(telegramChatId, { tasklist: tasklist });
}
//declare bot logic, on text event
telegram.on("text", (message) => {
  //instantiate new user state object
  //   if (auth_usr(message.from.id) === 0) {
  //     user_array.push(new telegram_user());
  //     user_array[user_array.length - 1].telegram_id = message.from.id;
  //     user_array[user_array.length - 1].telegram_username = message.from.username;
  //     user_array[user_array.length - 1].telegram_firstname =
  //       message.from.first_name;
  //     user_array[user_array.length - 1].telegram_lastname =
  //       message.from.last_name;
  //     telegram.sendMessage(message.from.id, "Welcome Message!", {
  //       parse_mode: "Markdown",
  //     });
  //     return;
  //   }
  //listen for a bot command
  if (message.text.toLowerCase().indexOf("/start") === 0) {
    //then change some state variable
    // user_array[auth_usr(message.chat.id)].some_state = 1;
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
    //do some other weird stuff
    return;
  }
  //listen for some other bot command
  if (message.text.toLowerCase().indexOf("/hello") === 0) {
    var user_text = message.text.replace("/hello ", "");
    if (user_text === "/hello") {
      //then reply to the user with a message
      telegram.sendMessage(message.chat.id, "Hello " + message.from.first_name);
      //do some other weird stuff
    }
    return;
  }

  //listen for some other bot command
  if (message.text.toLowerCase().indexOf("/pmme") === 0) {
    //then reply to the user with a message
    telegram.sendMessage(
      message.from.id,
      "Hello, " + message.from.first_name + " you sneaky bastard."
    );
    //do some other weird stuff
    return;
  }
  //listen for a command with some text at the end of it
  if (message.text.toLowerCase().indexOf("/addstress") === 0) {
    //strip the command from the string, to get the user_text
    //var user_text = message.text.split("/addstress ");
    var user_text = message.text.slice(11);
    if (user_text === "") {
        telegram.sendMessage(
          message.from.id, "What new task do you have to stress about?"
        );
    } else {
      newStress(message.from.id, user_text);
      telegram.sendMessage(
        message.from.id, "I've added the task"
      );
    }
    //iterate through array to see what's stored
    //tasklist.forEach(item => console.log(item));
    return;
  }

  if (message.text.toLowerCase().indexOf("/done") === 0) {
    //strip the command from the string, to get the user_text
    var user_text = message.text.slice(6);
    if (user_text === "") {
        telegram.sendMessage(
          message.from.id, "Which task are you done with?"
        );

    //check if its a valid "index" number
    }
      if(user_text > 0 && user_text <= tasklist.length) {
        var doneTask = tasklist[user_array - 1];
        telegram.sendMessage(
          message.from.id, "Everyone, " + message.from.first_name + " is done with "
          + doneTask.toString() + ". Better hurry up!"
        );
    }
    //iterate through array to see what's stored
    //tasklist.forEach(item => console.log(item));
    return;
  }

  //listen for a command with some text at the end of it
  if (message.text.toLowerCase().indexOf("/everyoneDone") === 0) {
    //strip the command from the string, to get the user_text
    var user_text = message.text.slice(14);
    console.log(user_text);
    if (user_text === "") {
        telegram.sendMessage(
          message.from.id, "Which task are you done with?"
        );

    //check if its a valid "index" number
    }
      if(user_text > 0 && user_text <= tasklist.length) {
        var doneTask = tasklist.splice(user_text - 1, 1);
        telegram.sendMessage(
          message.from.id, "Everyone, " + message.from.first_name + " is done with "
          + doneTask.toString() + ". Better hurry up!"
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
      "These are the commands that are currently available.",
      {
        reply_markup: {
          keyboard: [["/start"], ["/pmme"]],
          one_time_keyboard: true,
        },
      }
    );
  });

  //return a message to the user when some_state has been changed
  if (user_array[auth_usr(message.from.id)].some_state === 1) {
    //send this message privately
    telegram.sendMessage(message.from.id, "some_state has been changed to 1!", {
      parse_mode: "Markdown",
    });

    //or send it publicly, if user is interacting with this bot from a group / supergroup
    telegram.sendMessage(message.chat.id, "some_state has been changed to 1!", {
      parse_mode: "Markdown",
    });
    return;
  }
//some other event handlers for you to consider

//respond when user sends anything, not very safe, as you can imagine
telegram.on("message", (message) => {
  //do something here, message is the variable that contains the JSON, say message.text, or message.photo, etc.
});
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
});})

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
