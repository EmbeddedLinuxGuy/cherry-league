#!/usr/bin/env node

var fs = require("fs");
var __ = require("lodash");
var data_dir = "data";

var all_games;

var load_game_logs = () => {
    var dates = ["2016-05-06", "2016-05-07", "2016-05-08"];
    for (var d=0; d < dates.length; ++d) {
	for (var i=1; i < 20; ++i) {
	    var data;
	    try {
		data = fs.readFileSync("data/" +
				       dates[d] + "-" + i + ".json",
				       "utf8");
	    } catch (e) {
		console.log("   found [" + (i-1) +"] pages.");
		break;
	    }

	    var new_games = JSON.parse(data)[0];
	    if (all_games === undefined) {
		all_games = new_games;
	    } else {
		for (p in new_games) {
		    if (new_games.hasOwnProperty(p)) {
			Array.prototype.push.apply(all_games[p], new_games[p]);
		    }
		}
	    }
	}
    }
};

var get_ops = (slug) => {
    if (all_games === undefined) {
	load_game_logs();
	for (var p in all_games) {
	    if (all_games.hasOwnProperty(p)) {
		console.log(p);
		console.log(all_games[p].length);
	    }
	}
    }

    var get_player_id = (slug) => {
	var p = all_games.players.filter((p)=>p.slug===slug);
	if (p.length === 0) {
	    console.log("Player not found: [" + slug + "]");
	    return 0;
	} else if (p.length === 1) {
	    return p[0].id;
	} else {
	    console.log("Found "+p.length+" player ids for [" + slug + "]");
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

	    __.uniq(roster.map((e)=>e.t)).forEach((t)=>teams[t]=JSON.parse(fs.readFileSync(data_dir+"/"+"mlb-"+t+"-master.json", "utf8")));
	} catch (e) {
	    console.log("ALERT mlb-$TEAM-master.json not found");
	    throw e;
	    process.exit(1);
	}

	var obj = {};
	roster.forEach((p) => {
	    var player = teams[p.t].filter((m)=>m.first_name.substr(0,1)+". "+m.last_name === p.n)[0];
	    if (player === undefined) {
		console.log("NO MATCH FOR " + p.n);
		obj[p.n] = -1;
	    } else {
		obj[p.n] = get_ops(player.slug);
	    }
	});
	return JSON.stringify(obj);
    }
};
