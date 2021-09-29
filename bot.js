const fs = require('fs');
const tmi = require('tmi.js');
const config = require('./Data/config.json');

const opts = config; //This is the format for the config, as follows:
// "identity": {
//     "username": "",
//     "password": ""
// },
// "channels": [
//     ""
//   ],
// "options": {
//     "debug": true
// },
// "connection": {
//     "secure": true,
//     "reconnect": true
// },
//"prefix": ""

const client = new tmi.client(opts);
client.on('message', onMessage);
client.on('connected', onConnect);
client.on('message', logMessage);
client.connect();

function onMessage(target, context, msg, self)
{
    if(self) //If the message is from us, we just ignore it.
    {
        return;
    }

    const splitMessage = msg.trim().split(" ");
    
    if(!splitMessage.length)
    {
        return;
    }

    if(splitMessage[0][0] !== config.prefix) //Check if the first character of the message was our config defined prefix.
    {
        return;
    }

    const commandName = splitMessage[0].slice(1);

    switch(commandName.toLocaleLowerCase())
    {
        case 'ping':
            const tmi_sent_ts = Math.floor(parseInt(context['tmi-sent-ts']) / 1000);
            const now_ts = Math.floor(Date.now() / 1000)
            ping = now_ts - tmi_sent_ts;
            client.say(target, `pong! ${ping}ms`);
            break;

        case 'discord':
            client.say(target, `'Ere's a link to me shitey Discord server: https://discord.gg/F89zVvBUXr (pls join).`);
            break;
        
        default:

            break;
    }

    if(!(context['mod'] || context['username'] == target.substring(1))) // Target is returned as `#host_name` so we substring the first character('#') to leave us with the host name.
    {
        client.say(target, `Sorry ${context['username']}, but you don't have permission to run this command.`);
        return;
    }

    switch(commandName.toLocaleLowerCase())
    {     
        case 'ban':
            client.ban(target, splitMessage[1], splitMessage[2]);
            break;
        
        case 'unban':
            client.unban(target, splitMessage[1]);
            break;
        
        case 'slowmode': case "slow":
            var val = "0";

            if(splitMessage[1] === "spam")
            {
                val = "15";
            }

            if(splitMessage[1] == "off" || splitMessage[1] == "0")
            {
                client.slowoff(target);
                break;
            }

            val = splitMessage[1];
            client.slow(target, val);
            client.say(target, `Set the slowmode to ${val} seconds`);

            break;    

        case "clear": case "purge":
            client.clear(target);
            break;

        case "timeout": case "time":
            client.timeout(target, splitMessage[1], splitMessage[2], splitMessage[3]);
            client.say(target, `User ${splitMessage[1]} has been timed out for ${splitMessage[2]} seconds with reason: ${splitMessage[3]}`)
            break;
    }
}

function onConnect(addr, port)
{
    console.log(`Connected to ${addr} | ${port}`);
}

function logMessage(target, context, msg, self)
{
    var buildString = `[${target}] <-> ${context['username']} -> ${msg}`;
    console.log('\x1b[36m%s\x1b[0m', buildString);
    fs.exists('./Data/chatLog.txt', function(exists) {
        fs.appendFile('./Data/chatLog.txt', `${buildString}\n`, 'utf-8', function(err) {
            if(err)
            {
                console.error('\x1b[31m%s\x1b[0m', err); //Spooky Js console shit. 
            }
        });
    });
}

process.on('unhandledRejection', function (err) {
    console.error('\x1b[31m%s\x1b[0m', err);
    console.log("Node NOT Exiting...");
  });
  