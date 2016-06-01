#!/bin/sh

set -e
set -x

mkdir -p img teams log
date=$(date -I)
echo "date [$date]"
sleep 3
for team in $(<teams.txt); do
    mkdir -p teams/$team/.bak
    mv -i teams/$team/$team.html teams/$team/.bak/$date
    ./teams.js $team
    echo $team finished
    sleep 3
done
