#!/usr/bin/env node

var fs = require("fs");

var team = "mlb-" + process.argv[2];
var ep = "players";
var page = 1;
var data;
var players = [];
var new_players;

new_players = JSON.parse(fs.readFileSync(team+"-"+ep+page+".json"))[0].players;
while (new_players.length > 0) {
    Array.prototype.push.apply(players, new_players.filter((e)=>e.active||e.name==="Jacoby Ellsbury"));
    ++page;
    try {
	new_players = JSON.parse(fs.readFileSync(team+"-"+ep+page+".json"))[0].players;
    }
    catch (e) {
	new_players = [];
    }
}
fs.open(team+"-master.json", "w+", (e, fd) => {
    if (e) throw e;
    fs.write(fd, JSON.stringify(players));
});
