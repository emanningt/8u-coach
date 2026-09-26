# 8U Coach — Complete Codex Build Handoff

## Mission

Build a complete, polished **8U Soccer Coach** mobile web app for a youth soccer head coach and assistant coach.

The app must make one-hour weekly practices, game days, player rotations, rules, safety reminders, and coaching responsibilities extremely simple to understand and run from an iPhone.

This is not a prototype request. Build the complete V1, test the major flows, fix obvious problems, and leave the repository clean and ready to deploy.

The app will be hosted with GitHub Pages and shared with another coach through a link.

---

# 1. PRODUCT GOAL

The app should answer these questions instantly:

- What are we doing at practice today?
- What drill is next?
- How do we set it up?
- What should the head coach be doing?
- What should the assistant coach be doing?
- How much time is left?
- What are we focusing on this week?
- What do we do on game day?
- Who is on the field?
- Who should sub in next?
- Are players getting reasonably balanced playing time?
- What are our league rules?
- What safety issues should we watch for?

A coach should be able to glance at the phone for 3–5 seconds and know what to do next.

---

# 2. PRIMARY USERS

1. Head Coach
2. Assistant Coach

Both primarily use iPhones.

The app must also work on desktop, but iPhone portrait mode is the primary design target.

---

# 3. TECHNICAL DIRECTION

Build as a static mobile-first web app.

Preferred stack:

- HTML
- CSS
- JavaScript
- No required backend
- No database in V1
- No login system in V1
- No subscriptions
- No cloud sync in V1

Use:

- localStorage for device-specific data
- service worker for offline support
- manifest.json for PWA support
- iPhone safe-area support
- GitHub Pages-compatible paths
- large touch targets
- outdoor-readable contrast
- responsive mobile-first design

Avoid unnecessary frameworks unless there is a compelling technical reason.

Suggested structure:

/index.html  
/styles.css  
/app.js  
/manifest.json  
/sw.js  
/data/practices.js  
/data/drills.js  
/data/rules.js  
/data/coaching-cues.js  
/assets/

Keep coaching content separate from presentation logic so practices and rules can be edited without rebuilding the UI.

---

# 4. DEPLOYMENT TARGET

The repository should be deployable through GitHub Pages.

The final build should support:

- direct browser use
- iPhone Safari
- Add to Home Screen
- Open as Web App
- offline access to core coaching content after first load

Do not store sensitive player data in the repository.

Local roster data should exist only in localStorage.

---

# 5. MAIN NAVIGATION

Use five main tabs:

- TODAY
- PRACTICES
- GAME DAY
- TEAM
- RULES

Use a fixed bottom navigation bar suitable for one-handed iPhone use.

Include a compact access point for:

- Coach Tools
- Safety
- Settings
- League Rules Setup

---

# 6. TODAY SCREEN

The Today screen should immediately answer:

**WHAT ARE WE DOING TODAY?**

Show:

## NEXT PRACTICE

- Practice number
- Practice title
- Main skill
- Duration
- One-sentence objective

Large button:

**START PRACTICE**

## NEXT GAME

- Date
- Time
- Opponent if entered
- Location if entered

Large button:

**OPEN GAME DAY**

## QUICK COACH CHECKLIST

- Balls
- Cones
- Pinnies
- Water
- Roster
- First aid

## TODAY'S COACHING CUES

### Attack

- Find space
- Go forward when you can
- Dribble if you have space
- Pass if a teammate has better space
- Try to score

### Defend

- Get between the ball and our goal
- Slow the attacker down
- Try to win it back
- Everyone helps defend

## HOT DAY MODE

Add a simple toggle.

When enabled:

- make water reminders more prominent
- shorten long continuous activity prompts
- visually flag hydration breaks
- never make automatic medical decisions

No weather API is required in V1.

---

# 7. COACHING PHILOSOPHY

The app should reinforce:

- FUN
- BALL CONTACT
- DECISION MAKING
- SMALL-SIDED GAMES
- POSITIVE COACHING
- PLAYER DEVELOPMENT
- SHORT INSTRUCTIONS
- SIMPLE LANGUAGE
- TRYING BOTH FEET
- ROTATING POSITIONS
- LEARNING THROUGH PLAY

Avoid building practices around:

- long lines
- laps
- lectures
- constant stoppages
- rigid permanent positions
- complicated formations
- winning at all costs
- elimination games where children sit out for long periods

Players should spend as much time as possible moving, touching a ball, making decisions, and playing.

---

# 8. STANDARD 60-MINUTE PRACTICE FORMAT

All practices should follow a familiar rhythm.

## 0–5 MINUTES
ARRIVAL BALL PLAY

Every player gets a ball immediately.

No lines.  
No laps.  
No standing around.

## 5–15 MINUTES
BALL MASTERY / SKILL GAME

A fun activity that develops the main skill.

## 15–25 MINUTES
SKILL CHALLENGE

Use the same skill with a challenge, target, or decision.

## 25–38 MINUTES
1v1 / 2v2 GAME

Add opposition and decision-making.

## 38–55 MINUTES
SMALL-SIDED SOCCER

Prefer 2v2, 3v3, or 4v4.

Minimal interruption.

## 55–60 MINUTES
WATER + HUDDLE

Ask one simple question.

Praise effort.

Give one thing to try in the next game.

---

# 9. SEASON CURRICULUM

Create 10 core practices plus 2 optional bonus practices.

---

## PRACTICE 1 — MEET THE BALL

Focus: Dribbling and basic control

Teach:

- close control
- stopping
- starting
- inside of feet
- outside of feet
- both feet
- keeping the ball close

Suggested activities:

1. Arrival Ball Work
2. Red Light / Green Light
3. Dribble Through the Gates
4. 1v1 to Two Goals
5. 4v4

Coach phrase:

**“Can you keep the ball close enough to stop it anytime?”**

---

## PRACTICE 2 — CHANGE DIRECTION

Focus: Turning, changing speed, finding open space

Teach:

- inside turn
- outside turn
- pullback
- change of speed after turn
- escaping pressure

Suggested activities:

1. Traffic Jam
2. Gates with Turns
3. Sharks & Minnows
4. 1v1 Escape Game
5. 4v4

Coach phrase:

**“Can you find the open space?”**

---

## PRACTICE 3 — BEAT A PLAYER / PROTECT THE BALL

Focus: 1v1 attacking and confidence

Teach:

- shielding
- body between defender and ball
- change of direction
- change of speed
- attacking open space
- being willing to take on a defender

Suggested activities:

1. Ball Shield
2. Knockout
3. 1v1 to End Zones
4. 1v1 to Goal
5. 3v3 or 4v4

Coach phrase:

**“Can you get past the defender?”**

---

## PRACTICE 4 — PASS & RECEIVE

Focus: Short passing and receiving

Teach:

- inside-foot pass
- plant foot beside ball
- look before passing
- receive into space
- move after passing

Suggested activities:

1. Partner Passing
2. Passing Through Gates
3. Pass and Move
4. 2v1
5. 4v4 with a passing challenge

Coach phrase:

**“Can you find your teammate?”**

---

## PRACTICE 5 — SCORE GOALS

Focus: Shooting and finishing

Teach:

- look at target
- plant foot
- strike through ball
- accuracy before power
- shooting while moving
- finishing from short distance

Suggested activities:

1. Shooting Gates
2. Hit the Cone
3. Dribble and Shoot
4. 1v1 to Goal
5. 4v4

Coach phrase:

**“Can you see the goal before you shoot?”**

---

## PRACTICE 6 — WIN IT BACK

Focus: 1v1 defending

Teach:

- get close
- slow down
- stay between attacker and goal
- do not stab at the ball
- win the ball when the opportunity appears

Suggested activities:

1. Mirror Movement
2. Protect the Treasure
3. 1v1 Defending
4. 2v2
5. 4v4

Coach phrase:

**“Can you stay between the ball and our goal?”**

---

## PRACTICE 7 — FIND SPACE

Focus: Width, depth, spacing, stopping the swarm

Teach:

When attacking:

- spread out
- find open grass
- give the player on the ball somewhere to pass
- do not all stand beside the ball

When defending:

- recover toward goal
- help teammates

Suggested activities:

1. Four Corners
2. 3v1 Keep Away
3. 2v2 with Wide Gates
4. 3v3
5. 4v4

Coach phrase:

**“Can you make the field big?”**

---

## PRACTICE 8 — ATTACK TOGETHER

Focus: Teamwork and simple decision-making

Teach three choices:

- DRIBBLE
- PASS
- SHOOT

Suggested activities:

1. Pass and Follow
2. 2v1
3. 2v2
4. 3v3
5. 4v4

Coach phrase:

**“What do you see?”**

---

## PRACTICE 9 — TRANSITION / DRIBBLE OR PASS?

Focus: What happens when possession changes

Teach:

When we win the ball:

- find space
- go forward when possible
- attack

When we lose the ball:

- react
- get between ball and goal
- try to win it back

Suggested activities:

1. Direction Dribbling
2. 1v1 Transition
3. 2v2 Transition
4. Two-Goal Game
5. 4v4

Coach phrase:

**“We lost it — what do we do?”**

---

## PRACTICE 10 — PUTTING IT TOGETHER

Focus: Game intelligence and review

Minimal coach interruption.

Suggested activities:

1. Ball Challenge
2. 1v1 Tournament
3. 2v2 Tournament
4. 4v4 Match
5. Shooting Challenge

Focus on observing what players have learned.

---

## PRACTICE 11 — RULES & RESTARTS

Optional.

Teach through games:

- kickoff
- touchline restart
- goal restart
- corner
- free kick
- opponent restart distance

The activity content must read from the configurable league settings.

Do not assume one specific league rule set.

---

## PRACTICE 12 — SOCCER FESTIVAL

Optional final practice.

Fun season-ending activities:

- 1v1 competition
- skills course
- shooting challenge
- small-sided tournament
- team challenge

Minimal coaching.

Let the players enjoy the game.

---

# 10. DRILL / ACTIVITY SCREEN

Every activity must include:

- Activity name
- Duration
- Number of players
- Objective
- Equipment
- Setup
- Field size or approximate grid size
- Simple visual diagram
- How to play
- Coaching cues
- What success looks like
- Common mistakes
- Assistant Coach role
- Easier variation
- Harder variation
- Low-attendance variation
- High-attendance variation

Keep instructions short enough to use on the field.

---

# 11. PRACTICE DIAGRAMS

Use simple SVG or HTML/CSS diagrams.

Show:

- cones
- players
- teams
- ball
- movement arrows
- small goals
- approximate playing area

Use a simple legend.

Examples:

- circle = player
- different circle style = opposing team
- small circle = ball
- triangle = cone
- line/arrow = movement
- rectangle = goal

Diagrams must remain easy to understand on a phone outdoors.

---

# 12. EXAMPLE DRILL FORMAT

## SHARKS & MINNOWS

Time: 8 minutes

Equipment:

- one ball per player
- cones

Setup:

Create a rectangle with a safe line at each end.

Players begin on one end line.

One defender begins in the middle.

How it works:

1. Players dribble from one end to the other.
2. The defender tries to knock balls outside.
3. Players retrieve their ball immediately if it is knocked out.
4. Players rejoin instead of sitting out.
5. Repeat quickly.

Watch for:

- close control
- head coming up
- changing direction
- changing speed

Coach phrase:

**“Find the open grass.”**

Avoid:

- long explanations
- permanent elimination
- constant stoppages

---

# 13. LIVE PRACTICE MODE

When the coach taps START PRACTICE, enter a simplified full-screen mode.

Show only immediately relevant information:

- practice title
- current activity
- activity timer
- total practice time remaining
- equipment needed
- one or two coaching cues
- assistant coach responsibility
- field diagram
- practice progress timeline

Controls:

- PREVIOUS
- PAUSE
- NEXT
- +1 MIN
- SKIP
- WATER

The WATER button should:

- pause activity if needed
- display a short break timer
- resume the current activity

Hot Day Mode should make water reminders more prominent.

Use localStorage so practice progress survives:

- accidental refresh
- app closing
- phone locking
- returning later

Optional vibration/audio alert near the end of an activity is acceptable.

---

# 14. SIMPLE TEAM GAME MODEL

Teach only two major moments.

## WE HAVE THE BALL

Goals:

1. Make the field bigger
2. Find space
3. Look forward
4. Dribble forward if possible
5. Pass to an open teammate
6. Try to score

## THEY HAVE THE BALL

Goals:

1. Get between them and our goal
2. Get closer to the ball
3. Slow the attacker
4. Try to win it back
5. Everyone helps

Do not overload children with tactical terminology.

---

# 15. SIMPLE 4v4 SHAPE

Provide a visual teaching page for a basic 1-2-1 diamond when applicable.

Concept:

- 1 player provides depth
- 2 players provide width
- 1 player provides height

All four players attack.

All four players defend.

Do not permanently assign children as defenders or attackers.

Rotate positions.

The diamond is a teaching tool, not something coaches should constantly stop the game to enforce.

---

# 16. GAME DAY MODE

Create a dedicated Game Day Mode.

Sections:

- ARRIVAL
- WARM-UP
- LINEUP
- ROTATIONS
- COACHING
- HALFTIME
- POSTGAME

This mode should be extremely simple and usable from the sideline.

---

# 17. GAME DAY — BEFORE PLAYERS ARRIVE

Checklist:

- goals secure
- field safe
- balls inflated
- cones ready
- pinnies available
- first aid kit available
- water available
- league rules checked
- attendance ready
- rotation plan ready

---

# 18. GAME DAY — PLAYER WARM-UP

Approximate routine:

## 20–15 MINUTES BEFORE

BALL EACH

Players dribble and move individually.

## 15–10 MINUTES

DRIBBLING GAME

Use a familiar activity from practice.

## 10–5 MINUTES

1v1 OR SHOOTING

Very short competitive activity.

## 5–0 MINUTES

WATER + TEAM TALK

Keep team talk short.

Display:

**WHEN WE HAVE THE BALL:**  
Find space and go toward their goal.

**WHEN THEY HAVE THE BALL:**  
Get between the ball and our goal and try to win it back.

---

# 19. PREGAME HUDDLE

Default editable message:

“Play hard.  
Help your teammates.  
Find space.  
When we lose the ball, win it back.  
Most importantly — have fun.”

Allow the coach to edit this.

---

# 20. HEAD COACH ROLE ON GAME DAY

Default responsibilities:

- watch the actual game
- encourage players
- provide occasional short coaching cues
- communicate with referee when necessary
- handle halftime message
- observe development

---

# 21. ASSISTANT COACH ROLE ON GAME DAY

Default responsibilities:

- manage substitutions
- track playing time
- get next players ready
- manage water
- keep resting players engaged
- communicate rotation information to head coach

Both coaches should avoid shouting different tactical instructions at the same time.

---

# 22. WHAT SHOULD I BE WATCHING?

Create a quick-reference Game Day card.

## ATTACKING

Look for:

- player looks up
- moves into open space
- tries to go toward goal
- attempts 1v1
- recognizes an open teammate
- teammates are not all standing beside the ball

## DEFENDING

Look for:

- nearest player pressures the ball
- players recover toward their own goal
- players try to win the ball
- players help teammates
- players do not simply stand beside their goal

## PLAYER DEVELOPMENT

Look for:

- bravery
- decision-making
- using both feet
- trying new things
- recovering after mistakes
- effort
- teamwork

Do not make score the primary success metric.

---

# 23. SIDELINE COACHING LANGUAGE

## GOOD PHRASES

- Find space.
- Great effort.
- Can you help your teammate?
- What did you see?
- Win it back.
- Nice idea.
- Try again.
- Can you go forward?
- Head up.
- Take them on.
- Who can help?

## AVOID CONSTANT JOYSTICK COACHING

Examples:

- PASS!
- SHOOT!
- GO LEFT!
- NO!

The philosophy is to help players learn to make decisions.

---

# 24. HALFTIME

Display a simple three-step halftime card:

## 1. PRAISE ONE THING

Example:

“I love how we're trying to dribble forward.”

## 2. FIX ONE THING

Example:

“When they have the ball, let's get between them and our goal.”

## 3. GIVE ONE CHALLENGE

Example:

“Let's see if everyone can beat one player this half.”

Do not create a long halftime checklist.

---

# 25. AFTER THE GAME

Use a 60–90 second team huddle.

Display:

## CELEBRATE

Mention something the team did well.

## EFFORT

Praise effort, bravery, or teamwork.

## NEXT STEP

Mention one thing that connects to the next practice.

Finish positive.

---

# 26. TEAM / ROSTER

Allow coaches to add players locally.

Fields:

- First name
- Jersey number
- Optional last initial

Do not collect sensitive medical or personal information.

Do not hard-code player names in the repository.

Store roster data only in localStorage.

---

# 27. PLAYING-TIME / ROTATION TOOL

Create a simple Game Day rotation manager.

League settings should control:

- players on field
- halves or quarters
- minimum playing requirement if applicable
- substitution opportunities

Display:

## ON FIELD

## NEXT IN

## RESTING

Allow one-tap substitutions.

Track approximate playing time.

Display:

- minutes
- periods played
- current status
- position exposure if used

Players with less playing time should be easy to identify.

Provide an optional:

**SUGGEST NEXT ROTATION**

The app may suggest based on playing time, but it must not automatically substitute players without coach confirmation.

---

# 28. POSITION ROTATION

If using 4v4 without goalkeeper, support roles such as:

- Front
- Left
- Right
- Back

Provide a simple field diagram.

Track which positions each player has experienced.

Encourage rotation rather than permanent positions.

If league format differs, adapt from settings.

---

# 29. RULES SECTION

Create two main sections:

## OUR LEAGUE

Configurable and treated as authoritative for the coach.

## REFERENCE

General developmental reference only.

Never present reference rules as guaranteed local rules.

---

# 30. LEAGUE RULES SETUP

Fields:

- League / organization name
- Players per side
- Goalkeeper yes/no
- Ball size
- Field size
- Goal size
- Game duration
- Halves or quarters
- Substitution procedure
- Minimum playing time
- Touchline restart
- Goal kick procedure
- Corner kick procedure
- Kickoff procedure
- Free kick type
- Restart distance
- Offside yes/no
- Heading yes/no
- Handball guidance
- Penalty kicks yes/no
- Build-out line if applicable
- Mercy rule if applicable
- Other local rules

Anything not configured should display:

**CONFIRM WITH LEAGUE**

Do not invent a rule.

---

# 31. DEFAULT REFERENCE PROFILE

Include a clearly labeled REFERENCE profile based on common U8 / AYSO developmental guidance.

Reference items:

- Size 3 ball
- Small-sided soccer
- 4v4 standard reference format
- No goalkeeper in traditional AYSO 4v4
- No penalty area in that format
- No offside
- No heading
- Indirect free kicks in AYSO 8U
- Approximately 5 yards of opponent space on restarts in AYSO
- Local rules may determine throw-in, pass-in, kick-in, or dribble-in
- Players should rotate positions
- Player development matters more than winning

Show a warning:

**Your local league rules may be different. The OUR LEAGUE section controls what coaches should follow.**

---

# 32. SAFETY

Create a permanent Safety screen or highly accessible card.

## HEAD INJURY

Display:

**NO HEADING FOR THIS AGE GROUP.**

If a possible concussion or significant head impact occurs:

- stop participation
- check the player
- notify parent/guardian
- follow league concussion procedure
- do not encourage the player to “play through it”

This app is a coaching reminder, not medical diagnosis software.

---

# 33. HEAT / HYDRATION

Create a Hot Weather safety card.

Remind coaches to consider:

- temperature
- sun exposure
- hydration
- fatigue
- player behavior
- air quality where relevant
- extra water breaks

Hot Day Mode should increase water reminders in Practice Mode and Game Day Mode.

Do not make automatic medical decisions based on temperature.

---

# 34. EQUIPMENT & FIELD SAFETY

Include reminders:

- shin guards
- socks covering shin guards
- appropriate shoes
- no unsafe equipment
- remove prohibited jewelry according to league rules
- inspect playing surface
- secure goals
- balls properly inflated
- first aid kit available

---

# 35. COACH TOOLS

Include a Coach Tools section.

## EQUIPMENT CHECKLIST

Suggested baseline:

- Size 3 soccer balls
- Ideally one ball per player
- 20+ disc cones
- Two colors of pinnies
- Two small goals if available
- Ball pump
- First aid kit
- Cold pack
- Water
- Clipboard optional

## QUICK COACHING PHRASES

Attack:

- Find space.
- Can you go forward?
- Head up.
- Take them on.
- Who can help?
- Great idea.

Defend:

- Get goal-side.
- Slow them down.
- Win it back.
- Help your teammate.

General:

- Try again.
- Great effort.
- Good decision.
- What did you see?
- Can you find another way?

Avoid huge vocabulary lists.

---

# 36. HEAD COACH / ASSISTANT COACH MODE

Allow a simple preference:

- HEAD COACH
- ASSISTANT COACH

When Head Coach is selected, emphasize:

- activity explanation
- teaching cues
- overall game observation
- halftime message
- decisions

When Assistant Coach is selected, emphasize:

- setup
- cones
- balls
- player organization
- water
- rotation tracking
- next activity setup
- observing specific players
- getting substitutes ready

During every activity, show an:

**ASSISTANT ROLE**

card.

---

# 37. PRACTICE ACTIVITY RESPONSIBILITIES

Each activity should include an explicit assistant role.

Examples:

- reset balls
- manage opposite grid
- encourage players
- set up next activity
- watch one specific coaching point
- manage water
- divide groups
- keep waiting players active

---

# 38. DESIGN DIRECTION

The app should feel:

- modern
- clean
- athletic
- professional
- simple
- fast

Do not make it look like a children's cartoon app.

Suggested visual direction:

- dark navy or charcoal base
- white text
- soccer-field green accent
- strong contrast
- large typography
- clean cards
- bold timers
- simple soccer diagrams
- subtle motion only
- no excessive animation

Prioritize outdoor visibility.

---

# 39. LIVE-MODE UX RULE

During coaching, information density must drop dramatically.

Practice detail screens can contain full instructions.

LIVE PRACTICE and GAME DAY should show only what the coach needs right now.

Do not force the coach to read paragraphs from the sideline.

---

# 40. LOCAL DATA

Use localStorage for:

- current practice
- practice progress
- coach preference
- league settings
- player names
- player jersey numbers
- rotation data
- playing-time data
- completed practices
- Hot Day Mode
- editable pregame message
- next-game details

No player data should be hard-coded into the public source.

---

# 41. OFFLINE / PWA

Create:

- manifest.json
- service worker
- icons
- offline cache

Core coaching content should remain usable after initial load without reliable cellular service.

Ensure GitHub Pages paths work correctly.

---

# 42. ACCESSIBILITY / MOBILE UX

Use:

- large touch targets
- readable font sizes
- strong contrast
- clear focus states
- labels on important controls
- no tiny icons as the only means of navigation
- safe-area padding for iPhones
- large timer controls
- minimal typing required during a game

---

# 43. V1 SCOPE — DO NOT ADD

Do not add:

- accounts
- subscriptions
- parent messaging
- cloud sync
- complex statistics
- live weather API
- advanced analytics
- multi-team management
- payment features
- social features

V1 needs to do these things extremely well:

1. Tell us exactly how to run today's practice.
2. Tell each coach what he should be doing.
3. Make game day easy to manage.
4. Help manage rotations and playing time.
5. Make rules easy to reference.
6. Work reliably on iPhones.
7. Be easy to share by link.
8. Work offline for core content.

---

# 44. FUTURE-READY BUT DO NOT BUILD YET

Architect cleanly enough that these can be added later:

- shared coach synchronization
- Supabase
- schedule/calendar
- attendance history
- player development notes
- multiple teams
- season statistics
- parent communication
- cloud backups

Do not implement them in V1.

---

# 45. RESEARCH BASIS / SOURCE NOTES

Use these as background references while implementing the content.

## U.S. Soccer — U7/U8 Age Group Guide

Key themes:

- small-sided play
- 1v1 through 4v4
- lots of ball contact
- both feet
- passing and receiving
- shooting
- defending
- creativity
- simple instructions
- positive feedback
- decision-making
- different positions
- no heading

Reference:
https://www.ussoccer.com/us-way/player-development/environment/age-group-guide/u7-u8

## U.S. Soccer — Coaching Approach

Use a player-centered approach with short interventions and opportunities for players to solve problems.

Reference:
https://www.ussoccer.com/us-way/player-development/environment/coaching-approach

## U.S. Soccer — Game Model

Useful for simplifying the game into “we have the ball” and “they have the ball.”

Reference:
https://www.ussoccer.com/us-way/player-development/game/game-models

## U.S. Soccer — Formations

Useful for the 4v4 1-2-1 diamond reference.

Reference:
https://www.ussoccer.com/us-way/player-development/game/formations

## U.S. Soccer — Extreme Weather

Use for general hot-weather, hydration, and environmental awareness.

Reference:
https://www.ussoccer.com/soccer-forward/resource-hub/managing-extreme-weather-conditions

## U.S. Soccer — Concussion / Heading Initiative

Use for general head-injury and no-heading reminders.

Reference:
https://www.ussoccer.com/soccer-forward/resource-hub/the-concussion-initiative-and-reducing-heading

## AYSO — 8U Reference Rules

Useful only as a reference profile, not as assumed local rules.

Reference:
https://wiki.ayso.org/wiki/8U_Official

---

# 46. IMPORTANT RULES IMPLEMENTATION PRINCIPLE

Do not hard-code a single league's rules as universally correct.

League rules vary.

The app must distinguish between:

**OUR LEAGUE**  
What the coach actually follows.

and

**REFERENCE**  
General developmental examples.

If a rule has not been confirmed, display:

**CONFIRM WITH LEAGUE**

---

# 47. DEFINITION OF DONE

The finished app must allow two coaches to:

- open the same GitHub Pages URL on iPhone
- add it to their Home Screen
- see the entire season curriculum
- open any practice
- understand every drill without prior knowledge
- run a full 60-minute practice
- see exactly what the assistant coach should do
- open Game Day Mode
- manage player rotations
- track approximate playing time
- reference league rules quickly
- review safety reminders
- use the core app offline
- use the app without an account or backend

---

# 48. BUILD / TEST REQUIREMENTS

Before reporting completion:

1. Build the complete V1.
2. Test all navigation.
3. Test practice timers.
4. Test pause/next/back/skip/+1 minute.
5. Test localStorage persistence.
6. Test roster creation.
7. Test substitutions.
8. Test playing-time tracking.
9. Test league-settings persistence.
10. Test Hot Day Mode.
11. Test mobile layouts.
12. Test PWA manifest.
13. Test service-worker registration.
14. Check for JavaScript console errors.
15. Check GitHub Pages path compatibility.
16. Add a concise README.
17. Leave code clean and organized.

---

# 49. CODEX EXECUTION INSTRUCTION

Work directly in the GitHub repository.

Do not respond with tutorials telling me how to create each file manually.

Take ownership of implementation.

If repository permissions allow:

- create the needed files
- commit the implementation
- configure GitHub Pages readiness
- test the app
- fix obvious bugs
- report the final status

If a GitHub setting requires a manual owner action, clearly identify only that specific action at the end.

Do not stop after making a mockup.

Do not stop after making only the home page.

Do not stop after creating sample practices.

Build the full functional V1.

---

# 50. FINAL REPORT FORMAT

When finished, report:

## BUILT

Short summary of what exists.

## TESTED

What you verified.

## REPOSITORY

Branch / commit information.

## DEPLOYMENT

GitHub Pages status and URL if available.

## REQUIRES OWNER ACTION

Only list actions that truly require me.

## NEXT RECOMMENDED STEP

Keep this short.

---

END OF HANDOFF
