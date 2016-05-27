#!/usr/bin/env python2

from stattlepy import Stattleship
import json
import sys

if len(sys.argv) < 2 or len(sys.argv) > 3:
    print "Usage: get_logs.py {team|mlb-player-name|date D}; args provided: " + str(len(sys.argv))
    sys.exit(1)
slug = sys.argv[1]

print slug

with open(".token", "r") as infile:
    token = infile.read()
    
s = Stattleship()
Token = s.set_token(token)

data_dir = "data/"

if "mlb-" in slug:
    ep = "game_logs"
    Output = s.ss_get_results(sport="baseball", league="mlb", ep=ep, player_id=slug)
    with open(data_dir+slug+"-"+ep+".json", "w") as outfile:
        json.dump(Output, outfile)
elif "date" == slug:
    ep = "game_logs"
    date = sys.argv[2]
    print date
    page = 1
    Output = s.ss_get_results(sport="baseball", league="mlb", ep=ep, on=date, page=page)
    max_pages = 20
    empty = [{"game_logs": []}]
    while Output != empty and page <= max_pages:
        with open(data_dir+date+"-"+str(page)+".json", "w") as outfile:
            json.dump(Output, outfile)
        page += 1
        Output = s.ss_get_results(sport="baseball", league="mlb", ep=ep, on=date, page=page)
    print page
else:
    slug = "mlb-" + slug
    ep = "players"
    page = 1
    Output = s.ss_get_results(sport="baseball", league="mlb", ep=ep, team_id=slug, page=page)
    # check for 404 if player not found
    empty = [{'players': []}]
    max_pages = 10
    while Output != empty and page <= max_pages:
        with open(data_dir+slug+"-"+ep+str(page)+".json", "w") as outfile:
            json.dump(Output, outfile)
        page += 1
        Output = s.ss_get_results(sport="baseball", league="mlb", ep=ep, team_id=slug, page=page)
