# usage

# prefetch team roster
team=tor
./get_logs.py $team
./team-filter.js $team
./dump-logs.js $team

# player logs can also be downloaded individually
name=jose-bautista
./get_logs.py mlb-$name

# cleanup
rm mlb-$team-players*.json

# for each player in the game roster, return ops
const stats = import("./stats");
const filename = make_filename();
// user needs to save roster.json to filename
const ops_table = stats.fetch(filename);
