// The Server IP should be in exports.server and the port should be in exports.port
exports.server = '107.161.19.92';
exports.port = 8000;

// The Server ID. Example for play.pokemonshowdown.com the server id will be "showdown"
exports.serverid = 'infinite';


// The Bots name should go in exports.nick and password in exports.pass
exports.nick = '1nside';
exports.pass = 'botofinferno';


// The rooms that should be joined. Joining Pokemon Showdown's Lobby isnt allowed at all..
exports.rooms = ['The Razor League','The Inferno League'];


// Any private rooms that should be joined.
exports.privaterooms = [];

// The character text should start with to be seen as a command.
// Note that using / and ! might be 'dangerous' since these are used in
// Showdown itself.
// Using only alphanumeric characters and spaces is not allowed.
exports.commandcharacter = '.';

// The default rank is the minimum rank that can use a command in a room when
// no rank is specified in settings.json
exports.defaultrank = '%';

// Whether this file should be watched for changes or not.
// If you change this option, the server has to be restarted in order for it to
// take effect.
exports.watchconfig = false;

// Secondary websocket protocols should be defined here, however, Showdown
// doesn't support that yet, so it's best to leave this empty.
exports.secprotocols = [];

// What should be logged?
// 0 = error, ok, info, debug, recv, send
// 1 = error, ok, info, debug, cmdr, send
// 2 = error, ok, info, debug (recommended for development)
// 3 = error, ok, info (recommended for production)
// 4 = error, ok
// 5 = error
exports.debuglevel = 3;

// Users who can use all commands regardless of their rank. Be very cautious
// with this, especially on servers other than main.
exports.excepts = [];

// Whitelisted users are those who the bot will not enforce moderation for.
exports.whitelist = [];

// Users in this list can use the regex autoban commands. Only add users who know how to write regular expressions and have your complete trust not to abuse the commands.
exports.regexautobanwhitelist = [];

/* Add a link to the help for the bot here. When there is a link here, .help and .guide
will link to it. */
exports.botguide = '';

//This allows the bot to log messages sent by main and send them to the console. Off by default.
exports.logmain = false;

//This allows the bot to log PMs sent to it in the console. Off by default.
exports.logpms = true;

//Here, you specify the avatar you want the bot to use. Nice and handy if you don't want it to constantly have the default avatar.
exports.avatarNumber = ['52'];

// Add a link to the git repository for the bot here for .git to link to.
exports.fork = 'http://github.com/1love-1life/Inferno-League-Bot';

// This allows the bot to act as an automated moderator. If enabled, the bot will
// mute users who send 6 lines or more in 6 or fewer seconds for 7 minutes. NOTE: THIS IS
// BY NO MEANS A PERFECT MODERATOR OR SCRIPT. It is a bot and so cannot think for itself or
// exercise moderator discretion. In addition, it currently uses a very simple method of 
// determining who to mute and so may miss people who should be muted, or mute those who 
// shouldn't. Use with caution.
exports.allowmute = true;

// The punishment values system allows you to customise how you want the bot to deal with
// rulebreakers. Spamming has a points value of 2, all caps has a points value of 1, etc.
exports.punishvals = {
	1: 'warn',
	2: 'mute',
	3: 'hourmute',
	4: 'roomban',
	5: 'ban'
};

//This key is used to deliver requests from Google Spreadsheets. Used by the wifi room.
exports.googleapikey = '';
