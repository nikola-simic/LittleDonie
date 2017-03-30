var botbuilder = require('botbuilder');
var restify = require('restify');

// Setting up server - chat bot end point
var server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3978, function(err) {
	if(err) {
		console.err('Error during chat bot server initialization:' , err);
	} else {
		console.log('Chat bot server up and running');
	}
	
});

// Creating bot instance
var connector = new botbuilder.ChatConnector({
	appId: process.env.MICROSOFT_APP_ID,
	appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new botbuilder.UniversalBot(connector);
var userIntents = new botbuilder.IntentDialog();
bot.dialog('/', userIntents);

// Configuring bot to listen for server request
server.post('/api/messages', connector.listen());

userIntents.matchesAny([/^hello/i, /^hi/i, /^hey/i], '/welcomeUser').
			matches(/^goodbye/i, '/goodbye').
			matches(/^change name/i, '/changeName').
			matches(/^help/i, '/help').
			onDefault('/notUnderstand');

bot.dialog('/welcomeUser', [
	function(session, args, next) {
		if(!session.userData.name) {
			session.beginDialog('/meetUser');
		} else {
			next();
		}
		
	},
	function(session, result) {
		if(result && result.response) {
			session.userData.name = result.response;
		}
		session.send('Hello, %s! Nice to see you again!', session.userData.name);
		session.endDialog();
	}
]);

bot.dialog('/meetUser', [
	function(session) {
		botbuilder.Prompts.text(session, 'Hi! I am Little Donie, a tiny chat bot! :) What is your name?');
	},
	function(session, result) {
		session.endDialog(result);
	}
]);

bot.dialog('/goodbye', [
	function(session) {
		session.endDialog('Goodbye, %s! See you soon again!', session.userData.name);
	}
]);

bot.dialog('/changeName', [
	function(session) {
		botbuilder.Prompts.text(session, 'What name would you want to use?');
	},
	function(session, result) {
		if(result && result.response) {
			session.userData.name = result.response;
		} else {
			session.userData.name = 'Anonymous';
		}
		session.endDialog('Okay %s, I got it! :)', session.userData.name);
	}
]);

bot.dialog('/help', [
	function(session) {
		botbuilder.Prompts.text(session, 'How I can help you?');
	},
	function(session, result) {
		session.endDialog();
	}
]);

bot.dialog('/notUnderstand', [
	function(session) {
		session.endDialog('I don\'t understand');
	}
]);