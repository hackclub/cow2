

const responses = {
  noMoreResponsesDay: [ // When the cow has used its daily quota
    "I'm think I'm going to go to bed now",
    // "This is an automated response: Cow is busy and cannot answer any questions for the rest of the day",
    "I'm too tired to talk, sorry!",
    ":eyes:",
    "Sorry, I'm busy eating grass, can't talk",
    "That's enough Slack for today :yawning_face:",
    "I'm programming a cow game please leave me alone"
  ],
  noMoreResponsesUser: [ // When a user has used up their quota
    "I'm sorry, I don't feel like talking to you any more right now :disappointed:",
    "We've talked a lot this week, I have to go talk with other people :slightly_frowning_face:",
    ":eyes:"
  ],
  summonedAway: [
    "Someone else summoned me! Leaving for",
    "This channel is nice but I'm now going to visit",
    "I had fun visiting, but I've been summoned to another channel:"
  ],
  summonedAwayFromHome: [
    "Someone summoned me! Leaving for",
    "I'm now going to visit",
    "Home is nice but I think I'll go to"
  ],
  summoned: [
    "Heyyyy!! Did someone call me?",
    "Hi! This is one of my favorite channels!",
    "I've been summoned :cow:",
    "MOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO"
  ],
  summonedHome: [
    "Home sweet home!",
    "It's good to be back home",
    "Ooh I need to clean my pasture up.",
    "I love my pasture"
  ]
}

const getResponse = (type: keyof typeof responses): string => responses[type][Math.floor(Math.random() * responses[type].length)]

export default getResponse