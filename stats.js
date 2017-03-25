#!/usr/bin/env node

var fs = require("fs");
var __ = require("lodash");
var data_dir = "data";

var all_games;

// populate with first and last game dates
var start = Date.now();
var end = Date.UTC(0,0); // a long time ago

var load_game_logs = () => {
    var dates = fs.readdirSync("game_logs/", "utf8");
    dates.forEach((f) => {
	var data = fs.readFileSync("game_logs/"+f, "utf8");
	var new_games = JSON.parse(data)[0];
	if (match = f.match(/^(\d{4}-\d\d-\d\d)-\d*\.json$/)) {
	    var date = new Date(match[1]);
	    if (date < start) { start = date; }
	    if (date > end) { end = date; }
	}
	if (all_games === undefined) {
	    all_games = new_games;
	} else {
	    for (p in new_games) {
		if (new_games.hasOwnProperty(p)) {
		    Array.prototype.push.apply(all_games[p], new_games[p]);
		}
	    }
	}
    });
};

var get_ops = (slug) => {
    var get_player_id = (slug) => {
	var p = all_games.players.filter((p)=>p.slug===slug);
	if (p.length === 0) {
	    console.log("Player not found: [" + slug + "]");
	    return 0;
	} else if (p.length === 1) {
	    return p[0].id;
	} else {
	    console.log("Found "+p.length+" player ids for [" + slug + "]");
//	    console.log(p.map((p)=>p.id));
	    return p[0].id;
	}
    };
    var player_id = get_player_id(slug);
    if (player_id === 0) { return 0; }
    var games = all_games.game_logs.filter((g)=>g.player_id===player_id);
    if (games.length === 0) {
	console.log("Found NO games for " + slug + ", " + player_id);
	return 0;
    }

    var totals = {};
    var hits = games.map((g)=>g.hits).reduce((a,b)=>a+b);
    var ab = games.map((g)=>g.at_bats).reduce((a,b)=>a+b);
    
//    totals["walks"] = games.map((g)=>g["walks"]).reduce((a,b)=>a+b);
//    totals["total_bases"] = games.map((g)=>g["total_bases"]).reduce((a,b)=>a+b);

    var t = {};
    ["walks", "total_bases", "hits", "at_bats",
     "sacrifice_flys", "hit_by_pitch"].forEach((s)=> {
	 t[s]=games.map((g)=>g[s]).reduce((a,b)=>a+b);
     });
    return (t["total_bases"]/t["at_bats"]
	    + (t["hits"]+t["walks"]+t["hit_by_pitch"])
	     / (t["at_bats"] + t["walks"]
		+ t["hit_by_pitch"]+t["sacrifice_flys"]));
    
    return hits / ab; // actually batting average
    //    return games[0].total_bases / games[0].at_bats; // actually SLG
};

module.exports = {
    fetch: (roster_file) => {
	var roster;
	var teams = {};
	try {
	    console.log("Parsing roster");
	    roster = JSON.parse(fs.readFileSync(roster_file));
	    console.log("ROSTER OK");
	} catch (e) {
	    // XXX fetch roster if needed?
	    console.log("ALERT roster not found or not JSON");
	    throw e;
	}

	load_game_logs();
	for (var p in all_games) {
	    if (all_games.hasOwnProperty(p)) {
		console.log(p);
		console.log(all_games[p].length);
	    }
	}
	var obj = {};
	roster.forEach((p) => {
	    var player = all_games.players.filter((m)=>m.first_name.substr(0,1)+". "+m.last_name === p.n)[0];
	    if (player === undefined) {
		console.log("NO MATCH FOR " + p.n);
		obj[p.n] = -1;
	    } else {
		obj[p.n] = get_ops(player.slug);
	    }
	});
	obj.start = start;
	obj.end = end;
	return JSON.stringify(obj);
    }
};
