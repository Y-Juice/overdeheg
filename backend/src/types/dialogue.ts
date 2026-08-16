/**
 * Types voor vertakte buurtgesprekken.
 * Een vraag heeft meerdere mogelijke antwoorden van verschillende sprekers;
 * sommige antwoorden eindigen het gesprek, andere leiden tot een vervolg.
 */

/** Wie de vervolgreegel zegt: de oorspronkelijke vragensteller of een NPC. */
export type FollowUpSpeaker = "opener" | "npc";

/** Eén mogelijk antwoord op een vraag. */
export interface DialogueAnswer {
  /** Unieke sleutel binnen de boom, bv. "b" of "c". */
  id: string;
  /** De tekst die deze bewoner plaatst. */
  content: string;
  /** Welke NPC-index (0..n) dit antwoord plaatst. */
  npcIndex: number;
  /** Optioneel vervolgbericht als dit antwoord gekozen wordt. */
  followUp?: DialogueFollowUp;
}

/** Een automatisch vervolg na een gekozen antwoord. */
export interface DialogueFollowUp {
  content: string;
  speaker: FollowUpSpeaker;
  /** Alleen nodig als speaker "npc" is. */
  npcIndex?: number;
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

/** Een bericht dat de dialoogservice in de database wil zetten. */
export interface DialoguePost {
  uid: string;
  content: string;
  delaySeconds: number;
}
