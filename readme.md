# usage

# fetch team roster
team=tor
./get_logs.py $team
./team-filter.js $team

# cleanup
rm mlb-$team-players*.json

# update lineup
mkdir -p teams/$team/.bak
mv -i teams/$team/$team.html teams/$team/.bak/
./teams.js $team

# for each player in the game roster, return ops
const stats = require("./stats");
const filename = make_filename();
// user needs to save roster.json to filename, eg
fs.writeFile(filename, JSON.stringify([
   {"n": "J. Bautista", "t": "tor"},
   {"n": "D. Ortiz", "t": "bos"}
]));
// {"J. Bautista": .8, "D. Ortiz": 1.11112 }
const ops_table = stats.fetch(filename);

# deprecated

# try to download logs for all players
./dump-logs.js $team

# player logs can also be downloaded individually
name=jose-bautista
./get_logs.py mlb-$name
