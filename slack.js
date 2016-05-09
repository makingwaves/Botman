const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const  RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;

const log4js = require('log4js');
const log = log4js.getLogger('botto');

const token = process.env.SLACK_API_TOKEN || 'xoxb-41366375990-TLhI4NfEBwZhFfu6YgD1gQsy';

var rtm = new RtmClient(token, {logLevel: 'debug'});
rtm.start();

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  log.info(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
})

rtm.on(RTM_EVENTS.MESSAGE, function (message) {
  // Listens to all `message` events from the team
  
  rtm.sendMessage('Hva mener du egentlig med ' + message.text, message.channel, function messageSent() {
    // optionally, you can supply a callback to execute once the message has been sent
  });
});

rtm.on(RTM_EVENTS.CHANNEL_CREATED, function (message) {
  // Listens to all `channel_created` events from the team
});


// you need to wait for the client to fully connect before you can send messages
rtm.on(RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED, function () {
  // This will send the message 'this is a test message' to the channel identified by id 'C0CHZA86Q'
  rtm.sendMessage('this is a test message', 'C0CHZA86Q', function messageSent() {
    // optionally, you can supply a callback to execute once the message has been sent
  });
});
/*
// usgin wit api 
var wit = require('node-wit');

var ACCESS_TOKEN = "YOUR WIT ACCESS TOKEN HERE";
wit.captureTextIntent(ACCESS_TOKEN, "What's the weather in Melbourne?", function (err, res) {
    console.log("Response from Wit for text input: ");
    if (err) console.log("Error: ", err);
    console.log(JSON.stringify(res, null, " "));
});
*/