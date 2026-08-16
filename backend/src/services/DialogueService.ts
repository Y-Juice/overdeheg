import { Pool } from "pg";
import {
  AmbientChat,
  DialogueAnswer,
  DialogueLine,
  DialoguePost,
  DialogueTree
} from "../types/dialogue";
import { SystemLogService } from "./SystemLogService";
import { AMBIENT_CHATS, DIALOGUE_TREES } from "./dialogue/dialogueScripts";

/** Vaste NPC-bewoners die antwoorden in de buurtchat kunnen plaatsen. */
const NPC_UIDS = [
  "b2000000-0000-4000-8000-000000000001",
  "b2000000-0000-4000-8000-000000000002",
  "b2000000-0000-4000-8000-000000000003"
] as const;

/** Minimale en maximale denkpauze tussen berichten (ms). */
const MIN_REPLY_DELAY_MS = 1500;
const MAX_REPLY_DELAY_MS = 5500;

/** Interval voor spontane NPC-gesprekken. */
const AMBIENT_INTERVAL_MS = 35_000;

interface ZoneCoords {
  latitude: number;
  longitude: number;
}

interface ZoneRow {
  id: number;
  grid_x: number;
  grid_y: number;
}

/**
 * Speelt vertakte buurtgesprekken af en laat NPC's ook onderling praten.
 * Antwoorden op gebruikersvragen kunnen een thread hebben;
 * daarnaast starten er periodiek spontane NPC-gesprekken.
 */
export class DialogueService {
  private ambientRunning = false;

  constructor(
    private readonly db: Pool,
    private readonly systemLog: SystemLogService,
    private readonly trees: DialogueTree[] = DIALOGUE_TREES,
    private readonly ambientChats: AmbientChat[] = AMBIENT_CHATS
  ) {}

  /** Geeft de startvragen die de frontend als snelle opties kan tonen. */
  listPrompts(): string[] {
    return this.trees.map((tree) => tree.prompt);
  }

  /**
   * Start periodieke NPC-onderlinge gesprekken in willekeurige zones.
   */
  startAmbientChatter(intervalMs = AMBIENT_INTERVAL_MS): void {
    setInterval(() => {
      this.runAmbientChat().catch((error) => {
        console.error("NPC-onderling gesprek mislukt", error);
      });
    }, intervalMs);
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

    await this.publishPosts(posts, params.zoneId, coords);

    await this.systemLog.log(
      "info",
      `Dialoog ${tree.id}: antwoordpad ${answer.id} gekozen (${posts.length} berichten)`
    );
    return posts.length;
  }

  /** Kiest een spontaan NPC-gesprek en speelt het af in een zone. */
  private async runAmbientChat(): Promise<void> {
    if (this.ambientRunning || this.ambientChats.length === 0) {
      return;
    }

    this.ambientRunning = true;
    try {
      const zones = await this.db.query<ZoneRow>(
        "SELECT id, grid_x, grid_y FROM zones ORDER BY id"
      );
      if (zones.rows.length === 0) {
        return;
      }

      const zone = zones.rows[Math.floor(Math.random() * zones.rows.length)];
      const chat =
        this.ambientChats[Math.floor(Math.random() * this.ambientChats.length)];

      await this.ensureNpcsInZone(zone.id);
      const coords = this.coordsForZone(zone.grid_x, zone.grid_y);
      const posts: DialoguePost[] = chat.lines.map((line) => ({
        uid: this.npcUid(line.npcIndex),
        content: line.content
      }));

      await this.publishPosts(posts, zone.id, coords);
      await this.systemLog.log(
        "info",
        `NPC-gesprek ${chat.id} in zone ${zone.id} (${posts.length} berichten)`
      );
    } finally {
      this.ambientRunning = false;
    }
  }

  /** Plaatst een reeks berichten met willekeurige pauzes ertussen. */
  private async publishPosts(
    posts: DialoguePost[],
    zoneId: number,
    coords: ZoneCoords
  ): Promise<void> {
    for (const post of posts) {
      await this.wait(this.randomDelayMs());
      await this.insertNpcMessage({
        uid: post.uid,
        zoneId,
        content: post.content,
        coords
      });
    }
  }

  /** Schat GPS-coordinaten in het midden van een rastervak. */
  private coordsForZone(gridX: number, gridY: number): ZoneCoords {
    const latMin = 51.996;
    const latMax = 52.004;
    const lngMin = 5.096;
    const lngMax = 5.111;
    const colWidth = (lngMax - lngMin) / 3;
    const rowHeight = (latMax - latMin) / 2;
    return {
      longitude: lngMin + (gridX + 0.5) * colWidth,
      latitude: latMax - (gridY + 0.5) * rowHeight
    };
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

  /** Bouwt de volledige berichtenreeks: eerste antwoord + thread. */
  private buildPosts(openerUid: string, answer: DialogueAnswer): DialoguePost[] {
    const posts: DialoguePost[] = [
      {
        uid: this.npcUid(answer.npcIndex),
        content: answer.content
      }
    ];

    for (const line of answer.thread ?? []) {
      posts.push(this.lineToPost(openerUid, line));
    }
    return posts;
  }

  private lineToPost(openerUid: string, line: DialogueLine): DialoguePost {
    const uid =
      line.speaker === "opener" ? openerUid : this.npcUid(line.npcIndex ?? 0);
    return { uid, content: line.content };
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
