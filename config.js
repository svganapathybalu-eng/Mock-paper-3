/**
 * Test configuration and Mock Paper 3 content
 */

const T_CONFIG = {
  A: ['Repeat', 'Speaking', 'You will hear a sentence once. Repeat it exactly as you heard it. Speak immediately after the tone.', 15],
  B: ['Sentence Builds', 'Speaking', 'You will hear three short phrases in random order. Say them as one correct sentence after the tone.', 15],
  C: ['Conversations', 'Listening', 'You will hear a short conversation and then a question. Answer with a word or short phrase after the tone.', 10],
  D: ['Sentence Completion', 'Reading', 'Type ONE word that best fits the gap. Spelling and capitalization count.', 25],
  E: ['Dictation', 'Listening + Writing', 'You will hear a sentence once. Type it exactly, with correct spelling, capitals and punctuation.', 25],
  F: ['Passage Reconstruction', 'Reading + Writing', 'Read the passage. It disappears after 30 seconds. Rewrite it in your own words.', 90]
};

const MOCK_PAPER_3 = {
  A: [
    "When are we going out?",
    "It is important to know that you cannot learn without making mistakes.",
    "It is not surprising that more and more people are going abroad to pursue their dreams.",
    "Will they come tonight?",
    "How much does it cost?",
    "We thank you for joining us tonight at the event.",
    "Most of the employees were laid off during the pandemic.",
    "We can't extend service after the warranty expires.",
    "They're planning to discuss the proposal at the next annual meeting.",
    "Increasing number of employees have signed up for car-pool.",
    "The manager has called a meeting.",
    "New hires need to take a course in interpersonal skills.",
    "Why don't we ask them for help?",
    "Have you ever paid attention to what's been happening around you?",
    "She does not approve of this.",
    "Could you come over here, please?"
  ],
  B: [
    [["to use your password", "never allow", "anyone"], ["Never allow anyone to use your password."]],
    [["online scams", "don't fall", "prey to"], ["Don't fall prey to online scams."]],
    [["on time", "please submit", "the assignments"], ["Please submit the assignments on time."]],
    [["for us", "important", "is it"], ["It is important for us.", "Is it important for us?"]],
    [["for Paris", "when are you", "leaving"], ["When are you leaving for Paris?"]],
    [["on the project", "how do you", "work together"], ["How do you work together on the project?"]],
    [["know about the decision", "to let everyone", "isn't it important"], ["Isn't it important to let everyone know about the decision?"]],
    [["what they're doing", "really understand", "we don't"], ["We don't really understand what they're doing."]]
  ],
  C: [
    [
      ["Where are you headed to?", "I'm going to the school to pick up my cousin.", "Oh, that's nice."],
      "Why is the woman going to the school?",
      ["pick up her cousin", "to pick up her cousin", "cousin", "pick up cousin"]
    ],
    [
      ["I don't like staying in London.", "Oh, why?", "I don't like cities."],
      "Why doesn't the woman like to stay in London?",
      ["she doesn't like cities", "doesn't like cities", "cities", "she dislikes cities"]
    ],
    [
      ["How was the trip?", "There were thunderstorms the whole time.", "That sounds terrible."],
      "What happened during the trip?",
      ["thunderstorms", "there were thunderstorms", "thunderstorm"]
    ],
    [
      ["You look so tired.", "Yeah, I couldn't sleep the whole night.", "That's bad."],
      "Why does the man feel so tired?",
      ["couldn't sleep", "couldn't sleep the whole night", "he couldn't sleep", "lack of sleep"]
    ],
    [
      ["Have you enrolled in the foreign language programme?", "Yes, I did. I want to learn Japanese.", "An interesting choice, I must say."],
      "What language does the woman want to learn?",
      ["japanese"]
    ],
    [
      ["What was your favourite sport as a child?", "I never played any sport, you see. What was your favourite, by the way?", "I loved playing cricket."],
      "What sport did the woman play as a child?",
      ["cricket"]
    ],
    [
      ["Can I borrow your computer for a while?", "Sure. But, why do you need it?", "I need it to send a mail to my professor."],
      "Why does the man need a computer?",
      ["send a mail to his professor", "send mail", "to send an email", "send an email to his professor", "send a mail", "email professor"]
    ],
    [
      ["Where are you going this summer?", "I'm going to visit my uncle in Amsterdam.", "That's a beautiful place."],
      "Where is the man going this summer?",
      ["amsterdam", "to amsterdam"]
    ],
    [
      ["Who cleaned the room?", "I think Robin did it.", "Robin? Isn't it surprising?"],
      "Who cleaned the room?",
      ["robin"]
    ],
    [
      ["What are our neighbours celebrating?", "Yes. A birthday party.", "It's getting noisier. Don't you think so?"],
      "What are the neighbours celebrating?",
      ["birthday party", "a birthday party", "birthday"]
    ],
    [
      ["Where do I board the 9 o' clock flight to New York?", "At Gate 15A", "Oh, thanks."],
      "Where should the man board the flight?",
      ["gate 15a", "at gate 15a", "15a"]
    ],
    [
      ["Could you please help me finish the report?", "Sure.", "That's kind of you."],
      "What does the woman need help with?",
      ["finishing the report", "finish the report", "the report", "report"]
    ]
  ],
  D: [
    ["I think it's going to rain. There are dark ............ everywhere.", ["clouds"]],
    ["The ............ now standing at platform 8 is for Boston.", ["train"]],
    ["How much do you ............ a month as a stockbroker?", ["make", "earn"]],
    ["Our birthdays fall in consecutive months: mine is in April, hers is in ............ .", ["may"]],
    ["We had to take a bus as there was no ............ available on the train.", ["room", "space", "seat"]],
    ["Flights are not using ............ 1a to land or takeoff.", ["runway"]],
    ["Why don't you look up the word in a ............?", ["dictionary"]],
    ["If you want to study abroad, you may take out a student ............ .", ["loan"]],
    ["The film that opened in ............ last week received positive reviews across the country.", ["cinemas", "theaters", "theatres"]],
    ["What's the ............ of the jacket? It looks really expensive.", ["price", "cost"]],
    ["In most countries, children travel at half ............ on public transport.", ["fare", "price"]],
    ["His ............ consists of four people: mother, father, sister and brother.", ["family", "household"]],
    ["He never expected that he would ............ his shares within a year of buying them.", ["sell"]],
    ["Many people take a power nap after lunch to recharge their ............ .", ["batteries", "energy"]],
    ["I don't want to cook today. Shall we ............ out?", ["eat", "dine"]],
    ["Let's go to the Italian restaurant at the corner. I heard that they have something interesting on the ............ tonight.", ["menu"]],
    ["I think my watch has ............ What time do you make it?", ["stopped"]],
    ["There are ............ on the interstate highways, and it is compulsory for motorists to pay them.", ["tolls", "tollbooths"]]
  ],
  E: [
    "Can I borrow your pen, please?",
    "Please let them know that they can't access it now.",
    "I wonder if you'd like to go to the conference with me.",
    "The meeting has been postponed indefinitely.",
    "Do ensure that the contract is drawn up properly.",
    "Technical glitches have become common after the new software update.",
    "The country is racing to introduce the facility to everyone.",
    "We don't normally work until night.",
    "When you wake up early, you work better.",
    "Will you take me to the concert, please?",
    "Don't you ever want to meet the professor again?",
    "In his opinion, merging the companies is better.",
    "Why don't you go over your work before you turn it in?",
    "Not many have turned up for the event."
  ],
  F: [
    [
      "You are invited to the birthday party that we are hosting at City Lights tomorrow evening. The party starts at 7 in the evening. In addition to live music, local food, we are also planning to provide Italian, Japanese, and Indian fare. What is more, we have planned to have water games as we have an excellent pool on the roof.",
      [["birthday party", "invited"], ["city lights", "tomorrow evening"], ["starts at 7", "7 in the evening"], ["live music", "local food"], ["italian", "japanese", "indian"], ["water games", "pool", "roof"]]
    ],
    [
      "The project was finally approved after long discussions with the client. Now, the company is looking forward to developing a working prototype of the product which will be presented at the next client meeting in New York later this month. The company will start manufacturing the product at its Paris plant after the prototype has been approved.",
      [["project", "approved"], ["discussions", "client"], ["working prototype", "product"], ["meeting", "new york", "month"], ["manufacturing", "paris plant"], ["prototype approved"]]
    ]
  ]
};
