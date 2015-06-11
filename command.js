/**
 * This is the file where the bot commands are located
 *
 * @license MIT license
 */
const MESSAGES_TIME_OUT = 7 * 24 * 60 * 60 * 1000;

var http = require('http');
var sys = require('sys');

//Bug Fixes in trivia....maybe??

var triviaSign = false;
var triviaroom;
var triviatime;
var triviaanswer;
var triviaques;
var triviapoints = []; // This empty array stores the points for trivia gained by users
var triviaQuestions = ['This Pokemon apperead in the Sky of Unova region when Ash first landed there','zekrom'

];   // Add questions in the space provided :D 


exports.commands = {
	/**
	 * Help commands
	 *
	 * These commands are here to provide information about the bot.
	 */
	about: function (arg, by, room) {
		var text = this.hasRank(by, '#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		this.say(room, text + "The Inferno League bot **1nside** coded by 1love 1life and scpinion forked from PS bot by TalkTakesTime");
	},
	help: 'guide',
	guide: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		if (config.botguide) {
			text += 'A guide on how to use this bot can be found here: ' + config.botguide;
		} else {
			text += 'There is no guide for this bot. PM 1love 1life for any questions related to Bot';
		}
		this.say(room, text);
	},

	/** These are the commands which can be used by high ranked user although u can make it to be used for regular users also
	  but i will not advise it :p **/

	reload: function (arg, by, room) {
		if (config.excepts.indexOf(toId(by)) === -1)  
			if(!this.hasRank(by , '#~')) return false;
		try {
			this.uncacheTree('./commands.js');
			Commands = require('./commands.js').commands;
			this.say(room, 'Commands reloaded and are now up to date');
			console.log(by + ' reloaded the bot.');
		} catch (e) {
			error('failed to reload: ' + sys.inspect(e));
		}
	},
	custom: function(arg, by, room) {
		if (!this.hasRank(by, '#~')) return false;
		
		if (arg.indexOf('[') === 0 && arg.indexOf(']') > -1) {
			var tarRoom = arg.slice(1, arg.indexOf(']'));
			arg = arg.substr(arg.indexOf(']') + 1).trim();
		}
		this.say(tarRoom || room, arg);
	},
	say: function (arg, by, room) {
		if (!this.hasRank(by, '&@%+#')) return false;
		if (arg.indexOf('[') === 0 && arg.indexOf(']') > -1) {
			var tarRoom = arg.slice(1, arg.indexOf(']'));
			arg = arg.substr(arg.indexOf(']') + 1).trim();
		}
		this.say(tarRoom || room, arg);
	},
	js: function (arg, by, room) {
		if (config.excepts.indexOf(toId(by)) === -1) return false;
		try {
			var result = eval(arg.trim());
			this.say(room, JSON.stringify(result));
		} catch (e) {
			this.say(room, e.name + ": " + e.message);
		}
	},
	uptime: function (arg, by, room) {
		var text = config.excepts.indexOf(toId(by)) < 0 ? '**Uptime of Bot:** ' : '**Uptime of Bot:** ';
		var divisors = [52, 7, 24, 60, 60];
		var units = ['week', 'day', 'hour', 'minute', 'second'];
		var buffer = [];
		var uptime = ~~(process.uptime());
		do {
			var divisor = divisors.pop();
			var unit = uptime % divisor;
			buffer.push(unit > 1 ? unit + ' ' + units.pop() + 's' : unit + ' ' + units.pop());
			uptime = ~~(uptime / divisor);
		} while (uptime);

		switch (buffer.length) {
		case 5:
			text += buffer[4] + ', ';
			/* falls through */
		case 4:
			text += buffer[3] + ', ';
			/* falls through */
		case 3:
			text += buffer[2] + ', ' + buffer[1] + ', and ' + buffer[0];
			break;
		case 2:
			text += buffer[1] + ' and ' + buffer[0];
			break;
		case 1:
			text += buffer[0];
			break;
		}

		this.say(room, text);
	},

//Room Commands , can be used by users with ranks %,@,&,#,~

	settings: 'set',
	set: function (arg, by, room) {
		if (!this.hasRank(by, '%@&#~') || room.charAt(0) === ',') return false;

		var settable = {
			say: 1,
			joke: 1,
			choose: 1,
			usagestats: 1,
			buzz: 1,
			'8ball': 1,
			survivor: 1,
			games: 1,
			wifi: 1,
			monotype: 1,
			autoban: 1,
			happy: 1,
			guia: 1,
			studio: 1,
			'switch': 1,
			banword: 1
		};
		var modOpts = {
			flooding: 1,
			caps: 1,
			stretching: 1,
			bannedwords: 1
		};
		
		var opts = arg.split(',');
		var cmd = toId(opts[0]);
		if (cmd === 'mod' || cmd === 'm' || cmd === 'modding') {
			if (!opts[1] || !toId(opts[1]) || !(toId(opts[1]) in modOpts)) return this.say(room, 'Incorrect command: correct syntax is ' + config.commandcharacter + 'set mod, [' +
				Object.keys(modOpts).join('/') + '](, [on/off])');

			if (!this.settings['modding']) this.settings['modding'] = {};
			if (!this.settings['modding'][room]) this.settings['modding'][room] = {};
			if (opts[2] && toId(opts[2])) {
				if (!this.hasRank(by, '#&~')) return false;
				if (!(toId(opts[2]) in {on: 1, off: 1}))  return this.say(room, 'Incorrect command: correct syntax is ' + config.commandcharacter + 'set mod, [' +
					Object.keys(modOpts).join('/') + '](, [on/off])');
				if (toId(opts[2]) === 'off') {
					this.settings['modding'][room][toId(opts[1])] = 0;
				} else {
					delete this.settings['modding'][room][toId(opts[1])];
				}
				this.writeSettings();
				this.say(room, 'Moderation for ' + toId(opts[1]) + ' in this room is now ' + toId(opts[2]).toUpperCase() + '.');
				return;
			} else {
				this.say(room, 'Moderation for ' + toId(opts[1]) + ' in this room is currently ' +
					(this.settings['modding'][room][toId(opts[1])] === 0 ? 'OFF' : 'ON') + '.');
				return;
			}
		} else {
			if (!Commands[cmd]) return this.say(room, config.commandcharacter + '' + opts[0] + ' is not a valid command.');
			var failsafe = 0;
			while (!(cmd in settable)) {
				if (typeof Commands[cmd] === 'string') {
					cmd = Commands[cmd];
				} else if (typeof Commands[cmd] === 'function') {
					if (cmd in settable) {
						break;
					} else {
						this.say(room, 'The settings for ' + config.commandcharacter + '' + opts[0] + ' cannot be changed.');
						return;
					}
				} else {
					this.say(room, 'Something went wrong, PM 1love 1life for help');
					return;
				}
				failsafe++;
				if (failsafe > 5) {
					this.say(room, 'The command "' + config.commandcharacter + '' + opts[0] + '" could not be found.');
					return;
				}
			}

			var settingsLevels = {
				off: false,
				disable: false,
				'false': false,
				'+': '+',
				'%': '%',
				'@': '@',
				'&': '&',
				'#': '#',
				'~': '~',
				on: true,
				enable: true,
				'true': true
			};
			if (!opts[1] || !opts[1].trim()) {
				var msg = '';
				if (!this.settings[cmd] || (!this.settings[cmd][room] && this.settings[cmd][room] !== false)) {
					msg = '' + config.commandcharacter + '' + cmd + ' is available for users of rank ' + ((cmd === 'autoban' || cmd === 'banword') ? '#' : config.defaultrank) + ' and above.';
				} else if (this.settings[cmd][room] in settingsLevels) {
					msg = '' + config.commandcharacter + '' + cmd + ' is available for users of rank ' + this.settings[cmd][room] + ' and above.';
				} else if (this.settings[cmd][room] === true) {
					msg = '' + config.commandcharacter + '' + cmd + ' is available for all users in this room.';
				} else if (this.settings[cmd][room] === false) {
					msg = '' + config.commandcharacter + '' + cmd + ' is not available for use in this room.';
				}
				this.say(room, msg);
				return;
			} else {
				if (!this.hasRank(by, '#&~')) return false;
				var newRank = opts[1].trim();
				if (!(newRank in settingsLevels)) return this.say(room, 'Unknown option: "' + newRank + '". Valid settings are: off/disable/false, +, %, @, &, #, ~, on/enable/true.');
				if (!this.settings[cmd]) this.settings[cmd] = {};
				this.settings[cmd][room] = settingsLevels[newRank];
				this.writeSettings();
				this.say(room, 'The command ' + config.commandcharacter + '' + cmd + ' is now ' +
					(settingsLevels[newRank] === newRank ? ' available for users of rank ' + newRank + ' and above.' :
					(this.settings[cmd][room] ? 'available for all users in this room.' : 'unavailable for use in this room.')))
			}
		}
	},
	blacklist: 'autoban',
	ban: 'autoban',
	ab: 'autoban',
	autoban: function (arg, by, room) {
		if (!this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		if (!this.hasRank(this.ranks[room] || ' ', '@&#~')) return this.say(room, config.nick + ' requires rank of @ or higher to (un)blacklist.');

		arg = arg.split(',');
		var added = [];
		var illegalNick = [];
		var alreadyAdded = [];
		if (!arg.length || (arg.length === 1 && !arg[0].trim().length)) return this.say(room, 'You must specify at least one user to blacklist.');
		for (var i = 0; i < arg.length; i++) {
			var tarUser = toId(arg[i]);
			if (tarUser.length < 1 || tarUser.length > 18) {
				illegalNick.push(tarUser);
				continue;
			}
			if (!this.blacklistUser(tarUser, room)) {
				alreadyAdded.push(tarUser);
				continue;
			}
			this.say(room, '/roomban ' + tarUser + ', Blacklisted user');
			this.say(room, '/modnote ' + tarUser + ' was added to the blacklist by ' + by + '.');
			added.push(tarUser);
		}

		var text = '';
		if (added.length) {
			text += 'User(s) "' + added.join('", "') + '" added to blacklist successfully. ';
			this.writeSettings();
		}
		if (alreadyAdded.length) text += 'User(s) "' + alreadyAdded.join('", "') + '" already present in blacklist. ';
		if (illegalNick.length) text += 'All ' + (text.length ? 'other ' : '') + 'users had illegal nicks and were not blacklisted.';
		this.say(room, text);
	},
	unblacklist: 'unautoban',
	unban: 'unautoban',
	unab: 'unautoban',
	unautoban: function (arg, by, room) {
		if (!this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		if (!this.hasRank(this.ranks[room] || ' ', '@&#~')) return this.say(room, config.nick + ' requires rank of @ or higher to (un)blacklist.');

		arg = arg.split(',');
		var removed = [];
		var notRemoved = [];
		if (!arg.length || (arg.length === 1 && !arg[0].trim().length)) return this.say(room, 'You must specify at least one user to unblacklist.');
		for (var i = 0; i < arg.length; i++) {
			var tarUser = toId(arg[i]);
			if (tarUser.length < 1 || tarUser.length > 18) {
				notRemoved.push(tarUser);
				continue;
			}
			if (!this.unblacklistUser(tarUser, room)) {
				notRemoved.push(tarUser);
				continue;
			}
			this.say(room, '/roomunban ' + tarUser);
			removed.push(tarUser);
		}

		var text = '';
		if (removed.length) {
			text += 'User(s) "' + removed.join('", "') + '" removed from blacklist successfully. ';
			this.writeSettings();
		}
		if (notRemoved.length) text += (text.length ? 'No other ' : 'No ') + 'specified users were present in the blacklist.';
		this.say(room, text);
	},
	rab: 'regexautoban',
	regexautoban: function (arg, by, room) {
		if (config.regexautobanwhitelist.indexOf(toId(by)) < 0 || !this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		if (!this.hasRank(this.ranks[room] || ' ', '@&#~')) return this.say(room, config.nick + ' requires rank of @ or higher to (un)blacklist.');
		if (!arg) return this.say(room, 'You must specify a regular expression to (un)blacklist.');

		try {
			new RegExp(arg, 'i');
		} catch (e) {
			return this.say(room, e.message);
		}

		arg = '/' + arg + '/i';
		if (!this.blacklistUser(arg, room)) return this.say(room, '/' + arg + ' is already present in the blacklist.');

		this.writeSettings();
		this.say(room, '/' + arg + ' was added to the blacklist successfully.');
	},
	unrab: 'unregexautoban',
	unregexautoban: function (arg, by, room) {
		if (config.regexautobanwhitelist.indexOf(toId(by)) < 0 || !this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		if (!this.hasRank(this.ranks[room] || ' ', '@&#~')) return this.say(room, config.nick + ' requires rank of @ or higher to (un)blacklist.');
		if (!arg) return this.say(room, 'You must specify a regular expression to (un)blacklist.');

		arg = '/' + arg.replace(/\\\\/g, '\\') + '/i';
		if (!this.unblacklistUser(arg, room)) return this.say(room,'/' + arg + ' is not present in the blacklist.');

		this.writeSettings();
		this.say(room, '/' + arg + ' was removed from the blacklist successfully.');
	},
	viewbans: 'viewblacklist',
	vab: 'viewblacklist',
	viewautobans: 'viewblacklist',
	viewblacklist: function (arg, by, room) {
		if (!this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;

		var text = '';
		if (!this.settings.blacklist || !this.settings.blacklist[room]) {
			text = 'No users are blacklisted in this room.';
		} else {
			if (arg.length) {
				var nick = toId(arg);
				if (nick.length < 1 || nick.length > 18) {
					text = 'Invalid nickname: "' + nick + '".';
				} else {
					text = 'User "' + nick + '" is currently ' + (nick in this.settings.blacklist[room] ? '' : 'not ') + 'blacklisted in ' + room + '.';
				}
			} else {
				var nickList = Object.keys(this.settings.blacklist[room]);
				if (!nickList.length) return this.say(room, '/pm ' + by + ', No users are blacklisted in this room.');
				this.uploadToHastebin('The following users are banned in ' + room + ':\n\n' + nickList.join('\n'), function (link) {
					this.say(room, "/pm " + by + ", Blacklist for room " + room + ": " + link);
				}.bind(this));
				return;
			}
		}
		this.say(room, '/pm ' + by + ', ' + text);
	},
	banphrase: 'banword',
	banword: function (arg, by, room) {
		if (!this.canUse('banword', room, by)) return false;
		if (!this.settings.bannedphrases) this.settings.bannedphrases = {};
		arg = arg.trim().toLowerCase();
		if (!arg) return false;
		var tarRoom = room;

		if (room.charAt(0) === ',') {
			if (!this.hasRank(by, '~')) return false;
			tarRoom = 'global';
		}

		if (!this.settings.bannedphrases[tarRoom]) this.settings.bannedphrases[tarRoom] = {};
		if (arg in this.settings.bannedphrases[tarRoom]) return this.say(room, "Phrase \"" + arg + "\" is already banned.");
		this.settings.bannedphrases[tarRoom][arg] = 1;
		this.writeSettings();
		this.say(room, "Phrase \"" + arg + "\" is now banned.");
	},
	unbanphrase: 'unbanword',
	unbanword: function (arg, by, room) {
		if (!this.canUse('banword', room, by)) return false;
		arg = arg.trim().toLowerCase();
		if (!arg) return false;
		var tarRoom = room;

		if (room.charAt(0) === ',') {
			if (!this.hasRank(by, '~')) return false;
			tarRoom = 'global';
		}

		if (!this.settings.bannedphrases || !this.settings.bannedphrases[tarRoom] || !(arg in this.settings.bannedphrases[tarRoom])) 
			return this.say(room, "Phrase \"" + arg + "\" is not currently banned.");
		delete this.settings.bannedphrases[tarRoom][arg];
		if (!Object.size(this.settings.bannedphrases[tarRoom])) delete this.settings.bannedphrases[tarRoom];
		if (!Object.size(this.settings.bannedphrases)) delete this.settings.bannedphrases;
		this.writeSettings();
		this.say(room, "Phrase \"" + arg + "\" is no longer banned.");
	},
	viewbannedphrases: 'viewbannedwords',
	vbw: 'viewbannedwords',
	viewbannedwords: function (arg, by, room) {
		if (!this.canUse('banword', room, by)) return false;
		arg = arg.trim().toLowerCase();
		var tarRoom = room;

		if (room.charAt(0) === ',')  {
			if (!room === 'theinfernoleague')
			if (!this.hasRank(by, '#&@%+~')) return false;
			tarRoom = 'global';
		}

		var text = "";
		if (!this.settings.bannedphrases || !this.settings.bannedphrases[tarRoom]) {
			text = "No phrases are banned in this room.";
		} else {
			if (arg.length) {
				text = "The phrase \"" + arg + "\" is currently " + (arg in this.settings.bannedphrases[tarRoom] ? "" : "not ") + "banned " +
					(room.charAt(0) === ',' ? "globally" : "in " + room) + ".";
			} else {
				var banList = Object.keys(this.settings.bannedphrases[tarRoom]);
				if (!banList.length) return this.say(room, "No phrases are banned in this room.");
				this.uploadToHastebin("The following phrases are banned " + (room.charAt(0) === ',' ? "globally" : "in " + room) + ":\n\n" + banList.join('\n'), function (link) {
					this.say(room, (room.charAt(0) === '' ? "" : "") + "Banned Phrases " + (room.charAt(0) === ',' ? "globally" : "in " + room) + ": " + link);
				}.bind(this));
				return;
			}
		}
		this.say(room, text);
	},

//Custom Room commands. However seen command is still buggy

	seen: function (arg, by, room) { 
		var text = (room.charAt(0) === ',' ? '' : '' + by + ' ');
		arg = toId(arg);
		if (!arg || arg.length > 18) return this.say(room, text + 'Invalid username.');
		if (arg === toId(by)) {
			text += ', Look in the mirror instead of asking me....';
		} else if (arg === toId(config.nick)) {
			text += ', ya idiot, you need to get checked up!!!!';
		} else if (!this.chatData[arg] || !this.chatData[arg].seenAt) {
			text += ' ,The user ' + arg + ' has never been seen.';
		} else {
			text += arg + ' was last seen ' + this.getTimeAgo(this.chatData[arg].seenAt) + ' ago' + (
				this.chatData[arg].lastSeen ? ', ' + this.chatData[arg].lastSeen : '.');
		}
		this.say(room, text);
	},

	site: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		this.say(room, text + "Our Website can be found here: infiniteinfernoleague.weebly.com");
	},
	//A very nice command of Writing bot by SirDonovan and Axebane :D
	time: function (arg, by, room) {
        var today = new Date(); 
        var dd = today.getDate(); 
        var mm = today.getMonth()+1; 
        var yyyy = today.getFullYear();
        var hr = today.getHours();
        var mi = today.getMinutes();
        var se = today.getSeconds();
        if (mm === 1) { this.mmm = "January"; var sea = "winter"};
        if (mm === 2) { this.mmm = "Febuary"; var sea = "winter"};
        if (mm === 3) { this.mmm = "March"; var sea = "spring"};
        if (mm === 4) { this.mmm = "April"; var sea = "spring"};
        if (mm === 5) { this.mmm = "May"; var sea = "spring"};
        if (mm === 6) { this.mmm = "June"; var sea = "summer"};
        if (mm === 7) { this.mmm = "July"; var sea = "summer"};
        if (mm === 8) { this.mmm = "August"; var sea = "summer"};
        if (mm === 9) { this.mmm = "September"; var sea = "autumn"};
        if (mm === 10) { this.mmm = "October"; var sea = "autumn"};
        if (mm === 11) { this.mmm = "November"; var sea = "autumn"};
        if (mm === 12) { this.mmm = "December"; var sea = "winter"};
        if (dd === 1) { this.ddd = "first" };
        if (dd === 2) { this.ddd = "second" };
        if (dd === 3) { this.ddd = "third" };
        if (dd === 4) { this.ddd = "forth" };
        if (dd === 5) { this.ddd = "fifth" };
        if (dd === 6) { this.ddd = "sixth" };
        if (dd === 7) { this.ddd = "seventh" };
        if (dd === 8) { this.ddd = "eighth" };
        if (dd === 9) { this.ddd = "nineth" };
        if (dd === 10) { this.ddd = "tenth" };
        if (dd === 11) { this.ddd = "eleventh" };
        if (dd === 12) { this.ddd = "twelfth" };
        if (dd === 13) { this.ddd = "thirteenth" };
        if (dd === 14) { this.ddd = "forteenth" };
        if (dd === 15) { this.ddd = "fifteenth" };
        if (dd === 16) { this.ddd = "sixteenth" };
        if (dd === 17) { this.ddd = "seventeenth" };
        if (dd === 18) { this.ddd = "eighteenth" };
        if (dd === 19) { this.ddd = "nineteenth" };
        if (dd === 20) { this.ddd = "twentieth" };
        if (dd === 21) { this.ddd = "twenty-first" };
        if (dd === 22) { this.ddd = "twenty-second" };
        if (dd === 23) { this.ddd = "twenty-third" };
        if (dd === 24) { this.ddd = "twenty-forth" };
        if (dd === 25) { this.ddd = "twenty-fifth" };
        if (dd === 26) { this.ddd = "twenty-sixth" };
        if (dd === 27) { this.ddd = "twenty-seventh" };
        if (dd === 28) { this.ddd = "twenty-eighth" };
        if (dd === 29) { this.ddd = "twenty-nineth" };
        if (dd === 30) { this.ddd = "thirtieth" };
        if (dd === 31) { this.ddd = "thirty-first" };
        //And one more, just for good luck.
        if (dd === 32) { this.ddd = "thirty-second" };
        var AMorPM = "AM"
        if (hr === 12) AMorPM = "PM"
        if (hr === 24) { hr = 12; AMorPm = "AM" };
        if (hr > 12) {
            if (hr === 13) { hr = 1 };
            if (hr === 14) { hr = 2 };
            if (hr === 15) { hr = 3 };
            if (hr === 16) { hr = 4 };
            if (hr === 17) { hr = 5 };
            if (hr === 18) { hr = 6 };
            if (hr === 19) { hr = 7 };
            if (hr === 20) { hr = 8 };
            if (hr === 21) { hr = 9 };
            if (hr === 22) { hr = 10 };
            if (hr === 23) { hr = 11 };
            AMorPM = "PM";
        };
        if (dd<10) { dd = "0" + dd }; 
        if (mm<10) { mm = "0" + mm };
        if (mi<10) { mi = "0" + mi };
        if (se<10) { se = "0" + se };
        var theDay = today.getDay(); 
        if (theDay === 0) { this.theDay = "Sunday" }; 
        if (theDay === 1) { this.theDay = "Monday" }; 
        if (theDay === 2) { this.theDay = "Tuesday" };
        if (theDay === 3) { this.theDay = "Wednesday" };
        if (theDay === 4) { this.theDay = "Thursday" };
        if (theDay === 5) { this.theDay = "Friday" };
        if (theDay === 6) { this.theDay = "Saturday"};
        var today = hr + ":" + mi + ":" + se + " " + AMorPM + ", " + mm + '/' + dd + '/' + yyyy + ', the ' + this.ddd + " of the " + sea + " month of " + this.mmm + ', ' + yyyy + ' (' + this.theDay + ')';
        this.say(room, "The current time is: " + today);
	},
	
	//Inferno LEague Divisions. You can rename these commands to make your own custom commands
	divisionou: 'ou',
	ou: 'ou',
	ou: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		this.say(room, text + "**Inferno OU Division(Heat)**: Jayner ,  ");
	},
	nu: function (arg, by, room) {
		var text = this.hasRank(by, '%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		this.say(room, text + '**Inferno NU Division(Flame)**: ');
	},
	ru: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		this.say(room, text + '**Inferno RU division(Burn)**: ');
	},
	divisionuu: 'uu',
	uu: 'uu',
	uu: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		this.say(room, text + '**Inferno UU Division(Lava)**: ');
	},
	ubers: function (arg, by, room) {
		var text = this.hasRank(by, '+%@#&~') || room.charAt(0) === ',' ? '' : '/pm ' + by + ', ';
		this.say(room, text + '**Inferno Ubers division(Blaze)**: ');
	},

//Trying to Fix this command a bit. A bit buggy but works fine
	announce: function (arg, by, room) {
		if (!this.hasRank(by, '%@#&~')) return false;
		arg = toId(arg);
		if (arg === 'off') {
			if (this.buzzer) clearInterval(this.buzzer);
			return this.say(room, 'Announcements have been disabled.');
		} else if (arg === 'on') {
			var self = this;
			this.buzzer = setInterval(function() {
				var tips = ["Don't forget to allow people to comment on your work when it's done! Click 'Share', and set permissions accordingly.",
					"We like to play writing games, too! Click 'Activities' in our room introduction (the fancy box you saw when you joined) to see what games are available!",
					"Looking for feedback? Ask writers for an R/R, or a 'review for review'. It's a win-win for both parties!",
					"Questions on the (+) voice rank? Read our Voice Guidelines at http://bit.do/pswritingvoiceguidlines for more information.",
					"Confused as to the time? Wanting to punch timezones in the face? Look no further, for I have a fancy ``time`` command! Try it out!",
					"Would you like to host your work on our cloud drive? Ask a staff member about getting your own folder!",
					"Be sure to keep your work's presentation up to par, or AxeBane will hunt you down! Or, you could ask one of our staff to take a look and check it for you, but that's boring.",
					"Hey, you. Yes, you! Do __you__ want to improve the room? If you answered 'no', then go sit in the naughty corner. If you said 'yes', on the other hand, then go ahead and click the shiny 'submit and idea' button in the roominto!",
					"Want to play a writing game? Ask one of our friendly staff to host one, or if you think you're up to it, try hosting yourself! It's a great way to gain a good reputation!",
					"Every week we hold a Pokemon Showdown! Sunday Scribing contest. Participants are to write a story or a poem, depending on which week it is, based on the topic announced on Saturday. They have the whole of Sunday to write it. For more info, visit http://goo.gl/Ay6U5N",
					"Today's Word of the Day is: " + this.settings.wotd.word + ". Its definition is: " + this.settings.wotd.definition,
					"Need help getting started on a story? Try out the ``;idea`` command! Or, if you need to be a little more specific, try things like ``;randchar`` or ``;randscene``. You'll be writing in no time!",
					"Did you know that we have an official place to share music? It's a great place to listen to something whilst writing, perhaps even gaining some inspiration! Of course, you could also just hang out there and chat. Interested? Good! Head on over to https://plug.dj/pokemon-showdown-writing-room",
					"Need a quick way to access our Community Drive? Type ``;drive``!",
					"Psst... You. Yeah, you! Did you know that you can send messages to your scribing buddies just by using the ``;mail`` command? It works, even when they're offline! :o",
					"Need some love? Try using the ``esupport`` command. I promise I won't bite. <3"
				];
				var num = Math.floor((Math.random() * tips.length));
				self.say(room, tips[num]);
			}, 60*60*1000);
		}
	},

// Mail related commands. Good commands because it also work when user is offline

	mail: 'message',
	msg: 'message',
	message: function (arg, by, room) {
		if (this.settings.messageBlacklist && this.settings.messageBlacklist[toId(by)]) return false;
		if (room.charAt(0) !== ',' && !this.canUse('message', room, by)) return this.say(room, '/pm ' + by + ', Messaging is not enabled in this room for your rank, please send mail through PM');
		var text = (room.charAt(0) === ',' ? '' : '/pm ' + by + ', ');
		arg = arg.split(',');
		if (!arg[0] || !arg[1]) return this.say(room, text + 'Please use the following format: ";mail user, message"');
		var user = toId(arg[0]);
		if (user === toId(config.nick)) return this.say(room, text + 'Oh, dear. You do know you can just tell me these things up-front, right?');
		var message = arg.slice(1).join(',').trim();
		if (message.length > 215) return this.say(room, text + 'Your message cannot exceed 215 characters');
		if (user.length > 18) return this.say(room, text + 'That\'s not a real username! It\'s too long! >:I');
		if (!this.messages[user]) this.messages[user] = [];
		if (this.messages[user].length >= 5) return this.say(room, text + arg[0] + '\'s inbox is full.');
		var mail = {
			from: by.substr(1),
			text: message,
			time: Date.now()
		}
		this.messages[user].push(mail);
		this.writeMessages();
		this.say(room, text + 'Your message has been sent to ' + arg[0] + '.');
	},
	checkmail: 'readmessages',
	readmail: 'readmessages',
	readmessages: function (arg, by, room) {
		var text = (room.charAt(0) === ',' ? '' : '/pm ' + by + ', ');
		var user = toId(by);
		if (!this.messages[user]) return this.say(room, text + 'Your inbox is empty.');
		for (var i = 0; i < this.messages[user].length; i++) {
			this.say(room, text + this.getTimeAgo(this.messages[user][i].time) + " ago, " + this.messages[user][i].from + " said: " + this.messages[user][i].text);
		}
		delete this.messages[user];
		this.writeMessages();
	},
	clearmail: 'clearmessages',
	clearmessages: function (arg, by, room) {
		if (!this.hasRank(by, '#&~')) return false;
		if (!arg) return this.say(room, 'Specify whose mail to clear or \'all\' to clear all mail.');
		if (!this.messages) return this.say(room, 'The message file is empty.');
		if (arg === 'all') {
			this.messages = {};
			this.writeMessages();
			this.say(room, 'All messages have been cleared.');
		} else if (arg === 'time') {
			for (var user in this.messages) {
				var messages = this.messages[user].slice(0);
				for (var i = 0; i < messages.length; i++) {
					if (messages[i].time < (Date.now() - MESSAGES_TIME_OUT)) this.messages[user].splice(this.messages[user].indexOf(messages[i]), 1);
				}
			}
			this.writeMessages();
			this.say(room, 'Messages older than one week have been cleared.');
		} else {
			var user = toId(arg);
			if (!this.messages[user]) return this.say(room, arg + ' does not have any pending messages.');
			delete this.messages[user];
			this.writeMessages();
			this.say(room, 'Messages for ' + arg + ' have been cleared.');
		}
	},
	countmessages: 'countmail',
	countmail: function (arg, by, room) {
		if (!this.hasRank(by, '#&~')) return false;
		if (!this.messages) this.say(room, 'The message file is empty');
		var messageCount = 0;
		var oldestMessage = Date.now();
		for (var user in this.messages) {
			for (var i = 0; i < this.messages[user].length; i++) {
				if (this.messages[user][i].time < oldestMessage) oldestMessage = this.messages[user][i].time;
				messageCount++;
			}
		}
		//convert oldestMessage to days
		var day = Math.floor((Date.now() - oldestMessage) / (24 * 60 * 60 * 1000));
		this.say(room, 'There are currently **' + messageCount + '** pending messages. ' + (messageCount ? 'The oldest message ' + (!day ? 'was left today.' : 'is __' + day + '__ days old.') : ''));
	},
	upl: 'messageblacklist',
	unpoeticlicense: 'messageblacklist',
	messageblacklist: function (arg, by, room) {
		if (!this.hasRank(by, '@#&~')) return false;
		if (!arg) return this.say(room, 'Please specify which user(s) to blacklist from the message system');
		var users = arg.split(', ');
		var errors = [];
		if (!this.settings.messageBlacklist) this.settings.messageBlacklist = {};
		for (var i = 0; i < users.length; i++) {
			var user = toId(users[i]);
			if (this.settings.messageBlacklist[user]) {
				errors.push(users[i]);
				users.splice(i, 1);
				continue;
			}
			this.settings.messageBlacklist[user] = 1;
		}
		this.writeSettings();
		if (errors.length) this.say(room, errors.join(', ') + ' is already on the message blacklist');
		if (users.length) this.say(room, '/modnote ' + users.join(', ') + ' added to the message blacklist by ' + by.substr(1));
	},
	vmb: 'viewmessageblacklist',
	viewmessageblacklist: function (arg, by, room) {
		if (!this.hasRank(by, '@#&~')) return false;
		if (!this.settings.messageBlacklist) return this.say(room, 'No users are blacklisted from the message system');
		var messageBlacklist = Object.keys(this.settings.messageBlacklist);
		this.uploadToHastebin(room, by, "The following users are blacklisted from the message system:\n\n" + messageBlacklist.join('\n'));
	},

	
	// Tournament command. Add tiers you want and ENJOY!!!
	tour: function(arg, by, room) {
		if (config.serverid !== 'eos' && room !== 'theinfernoleague'
				&& room.charAt(0) !== ',' && config.members.map(toId).indexOf(toId(by)) < 0) return false;
		if (room.charAt(0) === ',') room = 'theinfernoleague';
	

		if(arg === 'nu')
		 {
		 	this.say(room, "/tour new " + arg + ",elimination")
		 
		 }
		 else if(arg === 'ou')
		 {
		 	this.say(room, "/tour new " + arg + ",elimination")
		 }
		 else if(arg === 'ubers')
		 {
		 	this.say(room, "/tour new " + arg + ",elimination")
		 }
		
		 else
		 {
		 	this.say(room,"**ERROR**: Invalid Tournament Tier")
		 
		 }


	},
	start: function(arg, by, room) {
		if (config.serverid !== 'frost' && room !== 'theinfernoleague'
				&& room.charAt(0) !== ',' && config.members.map(toId).indexOf(toId(by)) < 0) return false;
		if (room.charAt(0) === ',') room = 'theinfernoleague';
	
		 
		if(arg === 'randombattle' || arg === 'cc1v1' || arg === 'challengecup')
		{
			this.say(room,"/wall Good Luck to all players. Battles can be joined in this tournament due to randomly generated teams.")
		this.say(room, "/tour start " )
		this.say(room, "/tour setautodq 2" )
		this.say(room, "/tour startautodq 2" )
		}
		else if(arg === 'ou' || arg === 'nu'  || arg === 'ru'  ||  arg === 'pu' || arg === 'fu' || arg === 'ubers' || arg === 'balancedhackmons' || arg === 'monotype' || arg === 'lc')
		{
			this.say(room, "/tour start " )
			 this.say(room, "/wall Good Luck To all players. **Peeping into other battles while still in tournament is called Scouting and will result in immediate disqualification of player doing so**") 
		this.say(room, "/tour setautodq 2" )
		this.say(room, "/tour startautodq 2" )
		}
		else
		{
			this.say(room,"/wall No a Valid Tour start command. Try **.start [tier]**")
		}
	},
	
	//Trivia commands are HERE :D
	triviapoints: function(arg, by, room){
		if(!triviaON) return false;
		if(!this.hasRank(by, '%#@~'))return false;
		var text = 'Points so far: '
		for (var i = 0; i < triviaPoints.length; i++){
			text += '' + triviaPoints[i] + ': ';
			text += '**'triviaPoints[i + 1] + '** points, ';
			i++
		}
		this.say(room, text);
	},
        trivia: function(arg, by, room){
		if(room.charAt(',') === 0)return false;
		if(!this.hasRank(by, '%@#~')) return false;
		if(triviaON){this.say( room, '**ERROR**: A trivia game cannot be started, as it is going on in another room.'); return false;}
		triviaSign = true;
		triviaRoom = room;
                triviaans = '';
		triviapoints = [];
		this.say( room, '/wall Hosting a game of **Pokemon Trivia** First to 10 points wins!  use \.ta or \.triviaanswer to submit your answer\. First user to get **10** Points will win the Game. GOOD LUCK');
		triviatime = setInterval( function() {
                        if(triviaans){this.say(room, '**TIMES UP**);}
			var TQN = 2*(Math.floor(triviaQuestions.length*Math.random()/2))
			triviaques = triviaQuestions[TQN];
			triviaans = triviaQuestions[TQN+ 1];
			this.say( room, '**Question**: ' + triviaQ ); 
		}.bind(this), 17000);
		
	},
	ta: 'triviaanswer',
	triviaanswer: function(arg, by, room){
		if(room !== triviaroom) return false;
		if (!arg) return false;
		arg = toId(arg);
		var user = toId(by);

		if(arg === triviaans){
			if (triviapoints.indexOf(user) > -1){
				triviaA = '';
				triviapoints[triviapoints.indexOf(user) + 1] = triviapoints[triviapoints.indexOf(user) + 1] + 1;
				if (triviapoints[triviapoints.indexOf(user) + 1] >= 10) {
					clearInterval(triviatime);
					this.say( room, '/wall **Congratulations** to **' + by + '** for winning the game of Pokemon Trivia!');
					this.say(room,'/wall You have been awarded with 5 Points and your scores have been recorded. You can check your score in next Bot Update');
					triviaSign = false;
					return false;
				}
				this.say(room, '**' + by.slice(1, by.length) + '** got the right answer and advances to **' + triviaPoints[triviaPoints.indexOf(user) + 1] + '** points!');
			} else {
				triviaA = '';
				triviapoints[triviapoints.length] = user;
				triviapoints[triviapoints.length] = 1;
				this.say(room, '**' + by.slice(1, by.length) + '** got the right answer and advances to **' + triviaPoints[triviaPoints.indexOf(user) + 1] + '** point!');
			}
		}
	},
	triviaend: function(arg, by, room){
		if(room !== triviaroom)return false;
		if(!triviaSign) return false;
		if(!this.hasRank(by, '%@#~'))return false;
		clearInterval(triviaTimer);
		this.say(room, 'The game of Pokemon trivia has been ended.');
		triviaSign = false;
	},
};


//Bot Still under updations. PM 1love 1life for any kind of helps

