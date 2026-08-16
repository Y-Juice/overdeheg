import { AmbientChat, DialogueTree } from "../../types/dialogue";

/**
 * Vaste gespreksbomen voor de buurtchat.
 * Elk antwoordpad kan een thread hebben waarin NPC's onderling verder praten.
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
        npcIndex: 0,
        thread: [
          {
            speaker: "npc",
            npcIndex: 1,
            content: "Verhuiswagen zonder logo? Een beetje vreemd wel."
          },
          {
            speaker: "npc",
            npcIndex: 2,
            content: "Laat maar. Ik kijk liever de andere kant op."
          }
        ]
      },
      {
        id: "c",
        content: "Dat is geen verhuiswagen. Er zaten mensen in met camera's.",
        npcIndex: 1,
        thread: [
          {
            speaker: "npc",
            npcIndex: 0,
            content: "Camera's? Waarop gericht dan, de straat of de huizen?"
          },
          {
            speaker: "opener",
            content: "Camera's? Weet je zeker dat je dat goed gezien hebt?"
          },
          {
            speaker: "npc",
            npcIndex: 2,
            content: "Zeker. Eén had zelfs een headset op."
          }
        ]
      },
      {
        id: "d",
        content: "Ik heb niks gezien, maar er rijden hier vaker rare busjes.",
        npcIndex: 2,
        thread: [
          {
            speaker: "npc",
            npcIndex: 0,
            content: "Klopt, vorige week ook zo'n grijze bestelbus."
          },
          {
            speaker: "npc",
            npcIndex: 1,
            content: "En die bleef wel twintig minuten staan."
          }
        ]
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
        npcIndex: 0,
        thread: [
          {
            speaker: "npc",
            npcIndex: 2,
            content: "Ik heb vorige maand al gemeld. Geen reactie."
          },
          {
            speaker: "npc",
            npcIndex: 1,
            content: "Misschien willen ze het donker houden."
          }
        ]
      },
      {
        id: "c",
        content: "Misschien expres. Het is wel handig donker als je iets wilt verbergen.",
        npcIndex: 1,
        thread: [
          {
            speaker: "opener",
            content: "Verbergen? Wat bedoel je daar precies mee?"
          },
          {
            speaker: "npc",
            npcIndex: 0,
            content: "Hij bedoelt observatie. Of erger."
          },
          {
            speaker: "npc",
            npcIndex: 2,
            content: "Zeg dat soort dingen niet hardop hier."
          }
        ]
      },
      {
        id: "d",
        content: "Ik bel morgen de wijkbeheerder. Iemand anders ook klachten?",
        npcIndex: 2,
        thread: [
          {
            speaker: "npc",
            npcIndex: 0,
            content: "Zet mijn naam er maar bij, ik woon er pal naast."
          },
          {
            speaker: "npc",
            npcIndex: 1,
            content: "Doe mij ook maar. Kinderen kunnen niet meer buiten."
          }
        ]
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
        npcIndex: 0,
        thread: [
          {
            speaker: "npc",
            npcIndex: 1,
            content: "Nummer 12 krijgt ook vreemd bezoek 's nachts."
          },
          {
            speaker: "npc",
            npcIndex: 2,
            content: "Misschien toeval. Of juist niet."
          }
        ]
      },
      {
        id: "c",
        content: "Ik zou daar niet te hard over praten. Die mensen houden niet van vragen.",
        npcIndex: 1,
        thread: [
          {
            speaker: "opener",
            content: "Oké... dan houd ik het hierbij. Rare sfeer hier."
          },
          {
            speaker: "npc",
            npcIndex: 0,
            content: "Slim. Hoe minder namen, hoe beter."
          }
        ]
      },
      {
        id: "d",
        content: "Misschien toeristen. Er staan ook steeds andere auto's in de straat.",
        npcIndex: 2,
        thread: [
          {
            speaker: "npc",
            npcIndex: 0,
            content: "Toeristen met getinte ruiten? Mwah."
          },
          {
            speaker: "npc",
            npcIndex: 1,
            content: "Noteer de kentekens. Voor de zekerheid."
          }
        ]
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
        npcIndex: 0,
        thread: [
          {
            speaker: "npc",
            npcIndex: 1,
            content: "Veiligheid voor wie precies?"
          },
          {
            speaker: "npc",
            npcIndex: 2,
            content: "Voor hen. Niet voor ons."
          }
        ]
      },
      {
        id: "c",
        content: "Niet alleen daar. Bij de bakker hangt er ook eentje, gericht op de straat.",
        npcIndex: 1,
        thread: [
          {
            speaker: "opener",
            content: "Dus ze filmen de hele buurt? Dat wist ik niet."
          },
          {
            speaker: "npc",
            npcIndex: 0,
            content: "En bij de speeltuin staat er ook een paal klaar."
          },
          {
            speaker: "npc",
            npcIndex: 2,
            content: "Loop niet te opvallend. Ze kijken mee."
          }
        ]
      },
      {
        id: "d",
        content: "Ik zou me er niet druk om maken. Niks te verbergen, toch?",
        npcIndex: 2,
        thread: [
          {
            speaker: "npc",
            npcIndex: 1,
            content: "Makkelijk gezegd als jij niet elke dag gevolgd wordt."
          },
          {
            speaker: "npc",
            npcIndex: 0,
            content: "Iedereen heeft iets te verbergen. Dat is het punt niet."
          }
        ]
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
        thread: [
          {
            speaker: "opener",
            content: "Stil na geschreeuw klinkt niet goed. Heb je de politie gebeld?"
          },
          {
            speaker: "npc",
            npcIndex: 1,
            content: "Politie was er al. Zonder zwaailichten."
          },
          {
            speaker: "npc",
            npcIndex: 2,
            content: "Zonder zwaailichten is erger dan met."
          }
        ]
      },
      {
        id: "c",
        content: "Nee, maar er stonden wel twee auto's zonder kenteken.",
        npcIndex: 1,
        thread: [
          {
            speaker: "opener",
            content: "Zonder kenteken? Dat moet je melden, toch?"
          },
          {
            speaker: "npc",
            npcIndex: 0,
            content: "Melden bij wie? Zij weten het al."
          }
        ]
      },
      {
        id: "d",
        content: "Gewoon dronken jongeren. Gebeurt vaker in het weekend.",
        npcIndex: 2,
        thread: [
          {
            speaker: "npc",
            npcIndex: 0,
            content: "Dronken jongeren met walkietalkies?"
          },
          {
            speaker: "npc",
            npcIndex: 1,
            content: "Houd het bij jongeren. Veiliger zo."
          }
        ]
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
        thread: [
          {
            speaker: "opener",
            content: "Een tijdstip? Wat moest je daar dan mee?"
          },
          {
            speaker: "npc",
            npcIndex: 1,
            content: "Niet naartoe gaan. Serieus."
          },
          {
            speaker: "npc",
            npcIndex: 2,
            content: "Of juist wel, en kijken wie er staat."
          }
        ]
      },
      {
        id: "c",
        content: "Gooi die dingen weg. Hoe minder je reageert, hoe beter.",
        npcIndex: 1,
        thread: [
          {
            speaker: "npc",
            npcIndex: 0,
            content: "Eens. Reageren is een signaal."
          },
          {
            speaker: "npc",
            npcIndex: 2,
            content: "Ik bewaar ze. Bewijs is bewijs."
          }
        ]
      },
      {
        id: "d",
        content: "Bij mij zat er een foto van mijn voordeur bij. Geen grap.",
        npcIndex: 2,
        thread: [
          {
            speaker: "opener",
            content: "Een foto van je deur? Dat is intimidatie. Blijf alsjeblieft veilig."
          },
          {
            speaker: "npc",
            npcIndex: 0,
            content: "Bij mij was het het keukenraam. Zelfde handschrift."
          },
          {
            speaker: "npc",
            npcIndex: 1,
            content: "We moeten dit ergens verzamelen. Stil."
          }
        ]
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
        npcIndex: 0,
        thread: [
          {
            speaker: "npc",
            npcIndex: 1,
            content: "Dozen met antennes eruit, ja."
          },
          {
            speaker: "npc",
            npcIndex: 2,
            content: "Misschien radioamateurs. Of niet."
          }
        ]
      },
      {
        id: "c",
        content: "Ze schrijven alles op wat er in de straat gebeurt. Heb ik zelf gezien.",
        npcIndex: 1,
        thread: [
          {
            speaker: "opener",
            content: "Opschrijven? Waarom zou je dat doen als gewone bewoner?"
          },
          {
            speaker: "npc",
            npcIndex: 0,
            content: "Omdat ze geen gewone bewoners zijn."
          },
          {
            speaker: "npc",
            npcIndex: 2,
            content: "Praat zachter. Hun raam staat open."
          }
        ]
      },
      {
        id: "d",
        content: "Vraag het ze gewoon. Of juist niet. Hangt ervan af hoe dapper je bent.",
        npcIndex: 2,
        thread: [
          {
            speaker: "npc",
            npcIndex: 0,
            content: "Ik vraag niks meer. Na één praatje stonden ze bij mijn raam."
          },
          {
            speaker: "npc",
            npcIndex: 1,
            content: "Zelfde hier. Eerst glimlachen, dan noteren."
          }
        ]
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
        thread: [
          {
            speaker: "opener",
            content: "Top, rond acht uur dan?"
          },
          {
            speaker: "npc",
            npcIndex: 1,
            content: "Ik kom ook. Liever met meer mensen."
          },
          {
            speaker: "npc",
            npcIndex: 2,
            content: "Zeg niet te hard waar. App onderling."
          }
        ]
      },
      {
        id: "c",
        content: "Liever niet. Er hangen daar te veel ogen.",
        npcIndex: 1,
        thread: [
          {
            speaker: "opener",
            content: "Dan zoeken we een andere plek. Iemand een idee?"
          },
          {
            speaker: "npc",
            npcIndex: 0,
            content: "Achter de heg bij het voetbalveldje. Minder zicht."
          },
          {
            speaker: "npc",
            npcIndex: 2,
            content: "Goed. Geen namen in de chat."
          }
        ]
      },
      {
        id: "d",
        content: "Ik moet werken. Misschien dit weekend?",
        npcIndex: 2,
        thread: [
          {
            speaker: "npc",
            npcIndex: 0,
            content: "Weekend is beter. Overdag minder patrouilles."
          },
          {
            speaker: "npc",
            npcIndex: 1,
            content: "Zondag ochtend dan. Kort."
          }
        ]
      }
    ]
  }
];

/**
 * Spontane gesprekken tussen NPC's, zonder dat de gebruiker iets vraagt.
 */
export const AMBIENT_CHATS: AmbientChat[] = [
  {
    id: "weer",
    lines: [
      { npcIndex: 0, content: "Wat een rare mist vanochtend he?" },
      { npcIndex: 1, content: "Ja, en die drones weer boven het park." },
      { npcIndex: 2, content: "Drones of vogels? Ik zie het verschil bijna niet meer." }
    ]
  },
  {
    id: "markt",
    lines: [
      { npcIndex: 1, content: "Was de markt vandaag half leeg, of leek dat maar zo?" },
      { npcIndex: 0, content: "Half leeg. En veel agenten in burger." },
      { npcIndex: 2, content: "Koop snel en ga weer. Werkt het best." }
    ]
  },
  {
    id: "wifi",
    lines: [
      { npcIndex: 2, content: "Iemands wifi heet opeens OVERDEHEG_WATCH." },
      { npcIndex: 0, content: "Niet verbinden. Serieus." },
      { npcIndex: 1, content: "Te laat. Mijn telefoon deed het al automatisch." }
    ]
  },
  {
    id: "hond",
    lines: [
      { npcIndex: 0, content: "Mijn hond blaft alleen nog naar die grijze bestelbus." },
      { npcIndex: 2, content: "Honden ruiken dingen eerder dan wij." },
      { npcIndex: 1, content: "Of ze hebben geleerd waar het gevaar zit." }
    ]
  },
  {
    id: "raam",
    lines: [
      { npcIndex: 1, content: "Iemand anders ook dat klikgeluid bij het raam 's nachts?" },
      { npcIndex: 2, content: "Ja. Alsof er iets vastgemaakt wordt." },
      { npcIndex: 0, content: "Ik hang er een theedoek voor. Helpt een beetje." }
    ]
  },
  {
    id: "buurtapp",
    lines: [
      { npcIndex: 0, content: "Die officiële buurtapp vraagt opeens om je ID." },
      { npcIndex: 1, content: "Gewoon weigeren. Of een nepprofiel gebruiken." },
      { npcIndex: 2, content: "Ik ben al uitgeschreven. Beter zo." }
    ]
  }
];
