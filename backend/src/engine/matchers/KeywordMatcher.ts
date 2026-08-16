import { Pool } from "pg";
import { NLPService } from "../../services/NLPService";
import { CorrelationMatch } from "../../types/domain";
import { CorrelationMatcher } from "./CorrelationMatcher";

const WEIGHT_PER_CHARGED_TERM = 0.25;

interface ContentRow {
  uid: string;
  content: string;
}

/**
 * Zoekt bewoners die beladen termen gebruiken in hun berichten.
 * Gebruikt de NLPService om alle actieve berichten opnieuw te analyseren.
 */
export class KeywordMatcher implements CorrelationMatcher {
  readonly matchType = "keyword";

  constructor(
    private readonly db: Pool,
    private readonly nlp: NLPService
  ) {}

  async findMatches(): Promise<CorrelationMatch[]> {
    const result = await this.db.query<ContentRow>(
      `SELECT uid, content FROM messages
       WHERE is_deleted = FALSE
         AND created_at > now() - interval '24 hours'`
    );

    const termsPerResident = new Map<string, Set<string>>();
    for (const row of result.rows) {
      const analysis = this.nlp.analyse(row.content);
      if (analysis.chargedTerms.length === 0) {
        continue;
      }
      const terms = termsPerResident.get(row.uid) ?? new Set<string>();
      for (const term of analysis.chargedTerms) {
        terms.add(term);
      }
      termsPerResident.set(row.uid, terms);
    }

    return [...termsPerResident.entries()].map(([uid, terms]) => ({
      uid,
      matchType: this.matchType,
      weight: Math.min(1, terms.size * WEIGHT_PER_CHARGED_TERM),
      details: `Beladen termen gebruikt: ${[...terms].join(", ")}`
    }));
  }
}
