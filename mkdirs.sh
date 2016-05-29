#!/bin/sh

mkdir -p img teams log
#for f in $(<teams.txt); do
    #mkdir -p teams/$f
    #node teams.js $f

# ln -s teams/{,} {}

for f in $(<test/teams.txt); do
    if [ ! -f data/mlb-$f-master.json ]; then
	./get_logs.py $f > log/$f.out 2> log/$f.err
	./team-filter.js $f
    fi
done
