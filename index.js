var Botkit = require('botkit');

var controller = Botkit.slackbot({
  debug: false,
  require_delivery: true
  //include "log: false" to disable logging
  //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
});

// connect the bot to a stream of messages
/*controller.spawn({
  token: 'xoxb-133115798453-dpXeJMUksbPHPxd6BE6dYokw',
}).startRTM()

// give the bot something to listen for.
controller.hears('hello',['direct_message','direct_mention','mention'],function(bot,message) {

  bot.reply(message,'Hello yourself.');

});*/

controller.configureSlackApp({
  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret,
  redirectUri: 'http://localhost:80',
  scopes: ['bot']
});

controller.setupWebserver(process.env.port,function(err,webserver) {

  // set up web endpoints for oauth, receiving webhooks, etc.
  controller.createHomepageEndpoint(controller.webserver).createOauthEndpoints(controller.webserver, function(err, req, res) {
        if (err) {
            res.status(500).send('ERROR: ' + err);
        } else {
            res.send('Success!');
        }
    }).createWebhookEndpoints(controller.webserver);

});