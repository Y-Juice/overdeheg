/**
 * Types voor vertakte buurtgesprekken.
 * Een vraag heeft meerdere mogelijke antwoorden van verschillende sprekers;
 * daarna kunnen NPC's onderling verder praten in een thread.
 */

/** Wie een regel zegt: de oorspronkelijke vragensteller of een NPC. */
export type DialogueSpeaker = "opener" | "npc";

/** Eén regel in een gespreksthread. */
export interface DialogueLine {
  content: string;
  speaker: DialogueSpeaker;
  /** Alleen nodig als speaker "npc" is. */
  npcIndex?: number;
}

/** Eén mogelijk antwoordpad op een vraag. */
export interface DialogueAnswer {
  /** Unieke sleutel binnen de boom, bv. "b" of "c". */
  id: string;
  /** Eerste antwoordtekst. */
  content: string;
  /** Welke NPC dit eerste antwoord plaatst. */
  npcIndex: number;
  /** Extra berichten daarna (vaak NPC's onderling, soms de vragensteller). */
  thread?: DialogueLine[];
}

/** Een gespreksonderwerp met een startvraag en vertakte antwoorden. */
export interface DialogueTree {
  id: string;
  /** Tekst die de gebruiker kan kiezen of typen om het gesprek te starten. */
  prompt: string;
  /** Extra patronen die ook als startvraag gelden (kleine variaties). */
  matchPatterns: string[];
  answers: DialogueAnswer[];
}

/** Een kort NPC-onderling gesprek zonder gebruikersvraag. */
export interface AmbientChat {
  id: string;
  lines: Array<{ content: string; npcIndex: number }>;
}

/** Een bericht dat de dialoogservice in de database wil zetten. */
export interface DialoguePost {
  uid: string;
  content: string;
}
