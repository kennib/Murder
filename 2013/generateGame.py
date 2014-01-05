#!/usr/bin/env python3
#
# A script to generate a game of Murder
#

import random, datetime, calendar
import json

# List of possible players and locations in the game
players = ["Kenni Bawden", "Nicky Ringland", "James Curran", "Sasha Bermeister", "Jeshua Morrissey", "Peter Ward", "Sam Thorogood", "Alan Su", "Maddy Reid", "Domonick Ng", "Tara Murphy", "Sebastian Pauka", "James Constable", "Greg Darke", "Callan McNamara", "Chris Ryba"]
for s in xrange(80):
  players.append("Student "+str(s))
locations = ["SIT Foyer", "SIT Boardroom", "Women's Carpark", "Women's Library", "Women's Dining Hall", "Women's Courtyard"]
# List of killings
murders = []
# The start and end time bounds
time = datetime.datetime(2012, 12, 12, 9, 0, 0)
endTime = datetime.datetime(2012, 12, 22, 20, 0, 0)

living = set(players)
# Go until there is only one player standing
while len(living) > 1:
  # Wait some time...
  timeLeft = (endTime-time)
  timeLeft = timeLeft.seconds + timeLeft.days*60*60*24
  wait = random.randrange(timeLeft//len(players))
  time += datetime.timedelta(seconds=wait)
  
  # Murder most foul!
  murderer, victim = random.sample(living, 2)
  living.remove(victim)
  location = random.choice(locations)
  # Add to the growing list of killings
  murders.append({
    "murderer": murderer,
    "victim": victim,
    "datetime": calendar.timegm(time.utctimetuple())*1000,
    "loc": location,
    "lat": random.uniform(-33.890679, -33.888185), # Between Women's College and SIT
    "lng": random.uniform(151.186134, 151.194479),
  })

# Output as JSON
players = [{"name": player, "type": "student" if "Student" in player else "tutor"} for player in players]
print(json.dumps(list(players)))
print(json.dumps(murders))
