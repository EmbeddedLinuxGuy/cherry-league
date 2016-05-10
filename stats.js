#!/usr/bin/env node

var fs = require("fs");
var __ = require("lodash");

//var roster_file = process.argv[2];

var get_ops =  (slug) => {
    var data = fs.readFileSync(slug+"-game_logs.json", "utf8");
    var games;
    try {
	games = JSON.parse(data)[0].game_logs;
    } catch (e) {
	// XXX don't blow up on bad (client-originated) json
	throw e;
    }
//    return games[0].on_base_plus_slugging;
    // XXX not used

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
	    __.uniq(roster.map((e)=>e.t)).forEach((t)=>teams[t]=JSON.parse(fs.readFileSync("mlb-"+t+"-master.json", "utf8")));
	} catch (e) {
	    throw e;
	    process.exit(1);
	}

	var obj = {};
	roster.forEach((p) => {
	    var player = teams[p.t].filter((m)=>m.first_name.substr(0,1)+". "+m.last_name === p.n)[0];
	    if (player === undefined) console.log("NO MATCH FOR " + p.n);
	    obj[p.n] = get_ops(player.slug);
//	    else return { "name": p.n, "ops": get_ops(player.slug) };
	});
	return JSON.stringify(obj);
    }
};


