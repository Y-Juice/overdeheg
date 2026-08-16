import { DialogueTree } from "../types/dialogue";

/**
 * Vaste gespreksbomen voor de buurtchat.
 * Elke prompt heeft meerdere antwoorden van verschillende NPC's;
 * sommige paden stoppen, andere krijgen nog een vervolg van de vragensteller.
 */
export const DIALOGUE_TREES: DialogueTree[] = [
  {
    id: "witte-bus",
    prompt: "Heeft iemand die witte bus op de hoek zien staan?",
    matchPatterns: [
      "heeft iemand die witte bus op de hoek zien staan",
      "witte bus op de hoek"
    ],
    answers: [
      {
        id: "b",
        content: "Ja, stond er vanochtend al. Waarschijnlijk een verhuiswagen.",
        npcIndex: 0
      },
      {
        id: "c",
        content: "Dat is geen verhuiswagen. Er zaten mensen in met camera's.",
        npcIndex: 1,
        followUp: {
          speaker: "opener",
          content: "Camera's? Weet je zeker dat je dat goed gezien hebt?"
        }
      },
      {
        id: "d",
        content: "Ik heb niks gezien, maar er rijden hier vaker rare busjes.",
        npcIndex: 2
      }
    ]
  },
  {
    id: "lantaarnpaal",
    prompt: "De lantaarnpaal bij het speeltuintje doet het weer niet.",
    matchPatterns: [
      "de lantaarnpaal bij het speeltuintje doet het weer niet",
      "lantaarnpaal bij het speeltuintje"
    ],
    answers: [
      {
        id: "b",
        content: "Heb ik ook gemerkt. Gemeente doet er toch niks aan.",
        npcIndex: 0
      },
      {
        id: "c",
        content: "Misschien expres. Het is wel handig donker als je iets wilt verbergen.",
        npcIndex: 1,
        followUp: {
          speaker: "opener",
          content: "Verbergen? Wat bedoel je daar precies mee?"
        }
      },
      {
        id: "d",
        content: "Ik bel morgen de wijkbeheerder. Iemand anders ook klachten?",
        npcIndex: 2,
        followUp: {
          speaker: "npc",
          npcIndex: 0,
          content: "Zet mijn naam er maar bij, ik woon er pal naast."
        }
      }
    ]
  },
  {
    id: "vuilnis",
    prompt: "Wie laat er steeds vuilniszakken naast de container staan?",
    matchPatterns: [
      "wie laat er steeds vuilniszakken naast de container staan",
      "vuilniszakken naast de container"
    ],
    answers: [
      {
        id: "b",
        content: "Die van nummer 12. Altijd als de container vol is.",
        npcIndex: 0
      },
      {
        id: "c",
        content: "Ik zou daar niet te hard over praten. Die mensen houden niet van vragen.",
        npcIndex: 1,
        followUp: {
          speaker: "opener",
          content: "Oké... dan houd ik het hierbij. Rare sfeer hier."
        }
      },
      {
        id: "d",
        content: "Misschien toeristen. Er staan ook steeds andere auto's in de straat.",
        npcIndex: 2
      }
    ]
  },
  {
    id: "camera",
    prompt: "Hangt er sinds kort een camera bij de bushalte?",
    matchPatterns: [
      "hangt er sinds kort een camera bij de bushalte",
      "camera bij de bushalte"
    ],
    answers: [
      {
        id: "b",
        content: "Ja, die hangt er sinds maandag. Gemeente zegt voor veiligheid.",
        npcIndex: 0
      },
      {
        id: "c",
        content: "Niet alleen daar. Bij de bakker hangt er ook eentje, gericht op de straat.",
        npcIndex: 1,
        followUp: {
          speaker: "opener",
          content: "Dus ze filmen de hele buurt? Dat wist ik niet."
        }
      },
      {
        id: "d",
        content: "Ik zou me er niet druk om maken. Niks te verbergen, toch?",
        npcIndex: 2,
        followUp: {
          speaker: "npc",
          npcIndex: 1,
          content: "Makkelijk gezegd als jij niet elke dag gevolgd wordt."
        }
      }
    ]
  },
  {
    id: "geluid",
    prompt: "Heeft iemand vannacht hard geschreeuw gehoord bij het park?",
    matchPatterns: [
      "heeft iemand vannacht hard geschreeuw gehoord bij het park",
      "geschreeuw gehoord bij het park"
    ],
    answers: [
      {
        id: "b",
        content: "Ja, rond half drie. Toen werd het plots stil.",
        npcIndex: 0,
        followUp: {
          speaker: "opener",
          content: "Stil na geschreeuw klinkt niet goed. Heb je de politie gebeld?"
        }
      },
      {
        id: "c",
        content: "Nee, maar er stonden wel twee auto's zonder kenteken.",
        npcIndex: 1,
        followUp: {
          speaker: "opener",
          content: "Zonder kenteken? Dat moet je melden, toch?"
        }
      },
      {
        id: "d",
        content: "Gewoon dronken jongeren. Gebeurt vaker in het weekend.",
        npcIndex: 2
      }
    ]
  },
  {
    id: "post",
    prompt: "Krijgt iemand anders ook rare brieven zonder afzender?",
    matchPatterns: [
      "krijgt iemand anders ook rare brieven zonder afzender",
      "rare brieven zonder afzender"
    ],
    answers: [
      {
        id: "b",
        content: "Ja, vorige week. Er stond alleen een tijdstip op.",
        npcIndex: 0,
        followUp: {
          speaker: "opener",
          content: "Een tijdstip? Wat moest je daar dan mee?"
        }
      },
      {
        id: "c",
        content: "Gooi die dingen weg. Hoe minder je reageert, hoe beter.",
        npcIndex: 1
      },
      {
        id: "d",
        content: "Bij mij zat er een foto van mijn voordeur bij. Geen grap.",
        npcIndex: 2,
        followUp: {
          speaker: "opener",
          content: "Een foto van je deur? Dat is intimidatie. Blijf alsjeblieft veilig."
        }
      }
    ]
  },
  {
    id: "buren",
    prompt: "Zijn de nieuwe buren op nummer 8 een beetje te nieuwsgierig, of lijkt dat maar zo?",
    matchPatterns: [
      "nieuwe buren op nummer 8",
      "buren op nummer 8"
    ],
    answers: [
      {
        id: "b",
        content: "Lijkt maar zo. Ze hebben gewoon veel dozen.",
        npcIndex: 0
      },
      {
        id: "c",
        content: "Ze schrijven alles op wat er in de straat gebeurt. Heb ik zelf gezien.",
        npcIndex: 1,
        followUp: {
          speaker: "opener",
          content: "Opschrijven? Waarom zou je dat doen als gewone bewoner?"
        }
      },
      {
        id: "d",
        content: "Vraag het ze gewoon. Of juist niet. Hangt ervan af hoe dapper je bent.",
        npcIndex: 2,
        followUp: {
          speaker: "npc",
          npcIndex: 0,
          content: "Ik vraag niks meer. Na één praatje stonden ze bij mijn raam."
        }
      }
    ]
  },
  {
    id: "avond",
    prompt: "Iemand zin om vanavond bij de speeltuin te gaan zitten?",
    matchPatterns: [
      "zin om vanavond bij de speeltuin te gaan zitten",
      "vanavond bij de speeltuin"
    ],
    answers: [
      {
        id: "b",
        content: "Graag! Ik neem koffie mee.",
        npcIndex: 0,
        followUp: {
          speaker: "opener",
          content: "Top, rond acht uur dan?"
        }
      },
      {
        id: "c",
        content: "Liever niet. Er hangen daar te veel ogen.",
        npcIndex: 1,
        followUp: {
          speaker: "opener",
          content: "Dan zoeken we een andere plek. Iemand een idee?"
        }
      },
      {
        id: "d",
        content: "Ik moet werken. Misschien dit weekend?",
        npcIndex: 2
      }
    ]
  }
];
