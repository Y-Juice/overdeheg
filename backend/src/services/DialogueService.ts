import { Pool } from "pg";
import {
  DialogueAnswer,
  DialoguePost,
  DialogueTree
} from "../types/dialogue";
import { SystemLogService } from "./SystemLogService";
import { DIALOGUE_TREES } from "./dialogue/dialogueScripts";

/** Vaste NPC-bewoners die antwoorden in de buurtchat kunnen plaatsen. */
const NPC_UIDS = [
  "b2000000-0000-4000-8000-000000000001",
  "b2000000-0000-4000-8000-000000000002",
  "b2000000-0000-4000-8000-000000000003"
] as const;

/** Minimale en maximale denkpauze tussen berichten (ms). */
const MIN_REPLY_DELAY_MS = 1500;
const MAX_REPLY_DELAY_MS = 5500;

interface ZoneCoords {
  latitude: number;
  longitude: number;
}

/**
 * Speelt vertakte buurtgesprekken af nadat iemand een startvraag plaatst.
 * Kiest willekeurig één antwoordpad van een NPC; tussen berichten zit
 * een willekeurige pauze alsof iemand echt typt.
 */
export class DialogueService {
  constructor(
    private readonly db: Pool,
    private readonly systemLog: SystemLogService,
    private readonly trees: DialogueTree[] = DIALOGUE_TREES
  ) {}

  /** Geeft de startvragen die de frontend als snelle opties kan tonen. */
  listPrompts(): string[] {
    return this.trees.map((tree) => tree.prompt);
  }

  /**
   * Zoekt een passende gespreksboom en plaatst het gekozen antwoordpad
   * met een realistische pauze tussen elk bericht.
   */
  async reactToMessage(params: {
    openerUid: string;
    zoneId: number;
    content: string;
    latitude: number;
    longitude: number;
  }): Promise<number> {
    const tree = this.findTree(params.content);
    if (!tree) {
      return 0;
    }

    await this.ensureNpcsInZone(params.zoneId);
    const answer = this.pickAnswer(tree.answers);
    const posts = this.buildPosts(params.openerUid, answer);
    const coords = { latitude: params.latitude, longitude: params.longitude };

    for (const post of posts) {
      await this.wait(this.randomDelayMs());
      await this.insertNpcMessage({
        uid: post.uid,
        zoneId: params.zoneId,
        content: post.content,
        coords
      });
    }

    await this.systemLog.log(
      "info",
      `Dialoog ${tree.id}: antwoordpad ${answer.id} gekozen (${posts.length} vervolgberichten)`
    );
    return posts.length;
  }

  /** Wacht een willekeurige denkpauze. */
  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  /** Kiest een willekeurige pauze tussen de ingestelde grenzen. */
  private randomDelayMs(): number {
    return (
      MIN_REPLY_DELAY_MS +
      Math.floor(Math.random() * (MAX_REPLY_DELAY_MS - MIN_REPLY_DELAY_MS + 1))
    );
  }

  /** Normaliseert tekst voor het vergelijken van startvragen. */
  private normalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/[?!.,;:'"]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /** Zoekt de boom waarvan een patroon in de geplaatste tekst past. */
  private findTree(content: string): DialogueTree | null {
    const normalized = this.normalize(content);
    for (const tree of this.trees) {
      const prompt = this.normalize(tree.prompt);
      if (normalized === prompt || normalized.includes(prompt)) {
        return tree;
      }
      for (const pattern of tree.matchPatterns) {
        const needle = this.normalize(pattern);
        if (normalized === needle || normalized.includes(needle)) {
          return tree;
        }
      }
    }
    return null;
  }

  /** Kiest willekeurig één antwoordpad uit de beschikbare opties. */
  private pickAnswer(answers: DialogueAnswer[]): DialogueAnswer {
    const index = Math.floor(Math.random() * answers.length);
    return answers[index];
  }

  /** Bouwt de berichtenreeks voor het gekozen pad. */
  private buildPosts(openerUid: string, answer: DialogueAnswer): DialoguePost[] {
    const posts: DialoguePost[] = [
      {
        uid: this.npcUid(answer.npcIndex),
        content: answer.content,
        delaySeconds: 0
      }
    ];

    if (!answer.followUp) {
      return posts;
    }

    const follow = answer.followUp;
    const followUid =
      follow.speaker === "opener"
        ? openerUid
        : this.npcUid(follow.npcIndex ?? 0);

    posts.push({
      uid: followUid,
      content: follow.content,
      delaySeconds: 0
    });
    return posts;
  }

  private npcUid(index: number): string {
    return NPC_UIDS[index % NPC_UIDS.length];
  }

  /** Zorgt dat de NPC's in de actieve zone bestaan. */
  private async ensureNpcsInZone(zoneId: number): Promise<void> {
    for (const uid of NPC_UIDS) {
      const existing = await this.db.query("SELECT uid FROM residents WHERE uid = $1", [
        uid
      ]);
      if (existing.rows.length === 0) {
        await this.db.query(
          "INSERT INTO residents (uid, zone_id) VALUES ($1, $2)",
          [uid, zoneId]
        );
      } else {
        await this.db.query("UPDATE residents SET zone_id = $1 WHERE uid = $2", [
          zoneId,
          uid
        ]);
      }
    }
  }

  /** Schrijft een NPC- of vervolgbericht weg op het moment van plaatsen. */
  private async insertNpcMessage(params: {
    uid: string;
    zoneId: number;
    content: string;
    coords: ZoneCoords;
  }): Promise<void> {
    await this.db.query(
      `INSERT INTO messages
         (uid, zone_id, content, latitude, longitude, hesitation_ms, edit_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        params.uid,
        params.zoneId,
        params.content,
        params.coords.latitude,
        params.coords.longitude,
        800 + Math.floor(Math.random() * 4000),
        Math.floor(Math.random() * 3)
      ]
    );
  }
}
