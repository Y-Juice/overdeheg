import { MessageAnalysis } from "../types/domain";

const STOPWORDS = new Set([
  "de", "het", "een", "en", "van", "op", "in", "is", "dat", "die", "er",
  "aan", "met", "voor", "niet", "ook", "bij", "naar", "om", "wie", "wat",
  "weer", "maar", "als", "dan", "nog", "wel", "je", "ik", "we", "ze"
]);

const CHARGED_TERMS = new Set([
  "politie", "camera", "verdacht", "verdachte", "protest", "wapen",
  "inbraak", "overheid", "surveillance", "drugs", "gestolen", "avondklok",
  "controle", "melden", "aangifte", "demonstratie", "spionage"
]);

const SCORE_PER_CHARGED_TERM = 0.25;

/**
 * Eenvoudige NLP-analyse van Nederlandstalige berichten.
 * Haalt trefwoorden uit de tekst en herkent beladen termen
 * die het dreigingsmodel later zwaarder laat meewegen.
 */
export class NLPService {
  /** Analyseert een berichttekst en geeft trefwoorden en een verdenkingsscore terug. */
  analyse(content: string): MessageAnalysis {
    const tokens = content
      .toLowerCase()
      .replace(/[^a-z\u00e0-\u00ff\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOPWORDS.has(word));

    const keywords = [...new Set(tokens)];
    const chargedTerms = keywords.filter((word) => CHARGED_TERMS.has(word));
    const suspicionScore = Math.min(
      1,
      chargedTerms.length * SCORE_PER_CHARGED_TERM
    );

    return { keywords, chargedTerms, suspicionScore };
  }
}
