#!/usr/bin/env node

var team = process.argv[2];

const fs = require("fs");
const spawn = require("child_process").spawn;

var data = fs.readFileSync("mlb-"+team+"-master.json", "utf8");
var players;

try {
    players  = JSON.parse(data);
} catch (e) {
    throw e;
}

var i = 0;
var callback = (c) => {
    console.log(players[i].slug);
    ++i;
    if (i < players.length) {
	const getter = spawn("./get_logs.py", [players[i].slug]);
	getter.on("close", callback);
    }
};

const getter = spawn("./get_logs.py", [players[i].slug]);
getter.on("close", callback);
