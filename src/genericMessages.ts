

const responses = {
  noMoreResponsesDay: [ // When the cow has used its daily quota
    "I'm think I'm going to go to bed now",
    "I'm too tired to talk, sorry!",
    ":eyes:",
    "Sorry, I'm busy eating grass, can't talk",
    "That's enough Slack for today :yawning_face:",
    "I'm programming a cow game please leave me alone",
    "I can't talk right now, try tomorrow!"
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
    "I've arrived",
    "Your favorite cow is here",
    "MOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO"
  ],
  summonedHome: [
    "Home sweet home!",
    "It's good to be back home",
    "Ooh I need to clean my pasture up.",
    "I love my pasture"
  ],
  offTopicMessage: [
    "I don't know",
    "Let's talk about something different",
    "I don't want to talk about that"
  ],
  mooResponse: [
    "MOOOOOOOOOO",
    "Did someone say mooo? I like cows (probably because I am one)",
    "MOOOOOOOOOO! Do you want to talk?",
    ":cow:",
    ":thinkspin:",
    "moo?",
    ":blurryeyes:",
    ":cow2:"
  ],
  pyramidText: [
    "I may or may not be running a cow pyramid scheme",
    "Observe the army",
    "It's the cow parade :cow2:",
    "As you can see there are a lot of :cow2:",
    "run"
  ],
  fallbackResponse: [
    "Sorry I just had a brain-freeze",
    "uhhh",
    "MOOOOOOOOOOOo",
    "Sorry, I gotta go!",
    "Um sorry can't talk any more",
    "Lost my train of thought, sorry"
  ],
  goatRefusal: [
    "I don't want to talk with the goat.",
    "I would really rather not talk with the goat, that goat is much too talkative.",
    "Goat? What's that?",
    "No. I refuse. Goat is mean. I won't talk with them."
  ]
}

const getResponse = (type: keyof typeof responses): string => responses[type][Math.floor(Math.random() * responses[type].length)]

export default getResponse

export const pyramid = `
:blank: :blank: :blank: :blank: :blank: :cow:
:blank: :blank: :blank: :blank: :cow: :cow: :cow: 
:blank: :blank: :blank: :cow: :cow: :cow: :cow: :cow: 
:blank: :blank: :cow: :cow: :cow: :cow: :cow: :cow: :cow: 
:blank: :cow: :cow: :cow: :cow: :cow: :cow: :cow: :cow: :cow: 
:cow: :cow: :cow: :cow: :cow: :cow: :cow: :cow: :cow: :cow: :cow: 
:cow: :cow: :cow: :cow: :cow: :cow: :cow: :cow: :cow: :cow: :cow: 
:cow: :cow: :cow: :cow: :cow: :cow: :cow: :cow: :cow: :cow: :cow: 
:cow: :cow: :cow: :cow: :cow: :cow: :cow: :cow: :cow: :cow: :cow: 
:cow: :cow: :cow: :cow: :cow: :cow: :cow: :cow: :cow: :cow: :cow:`