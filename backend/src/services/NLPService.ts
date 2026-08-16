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

const CIVIC_TERMS = new Set([
  "hallo", "hoi", "hey", "dag", "groetjes", "groeten", "bedankt",
  "dankjewel", "dankje", "graag", "leuk", "fijn", "fijne", "gezellig",
  "welkom", "mooi", "mooie", "prettig", "succes", "sterkte", "sorry",
  "excuses", "doei", "doeg", "liefs", "lekker", "goede", "goedemorgen",
  "goedenavond", "goedemiddag", "weekend", "bloemen", "koffie", "taart",
  "feest", "verjaardag", "zonnig", "heerlijk", "buurman", "buurvrouw",
  "fijnewEEK", "totziens"
]);

const SCORE_PER_CHARGED_TERM = 0.25;
const SCORE_PER_CIVIC_TERM = 0.08;

/**
 * Eenvoudige NLP-analyse van Nederlandstalige berichten.
 * Haalt trefwoorden uit de tekst en herkent beladen of juist
 * vriendelijke termen voor het dreigingsmodel.
 */
export class NLPService {
  /** Analyseert een berichttekst en geeft trefwoorden en scores terug. */
  analyse(content: string): MessageAnalysis {
    const tokens = content
      .toLowerCase()
      .replace(/[^a-z\u00e0-\u00ff\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOPWORDS.has(word));

    const keywords = [...new Set(tokens)];
    const chargedTerms = keywords.filter((word) => CHARGED_TERMS.has(word));
    const civicTerms =
      chargedTerms.length > 0
        ? []
        : keywords.filter((word) => CIVIC_TERMS.has(word));

    return {
      keywords,
      chargedTerms,
      civicTerms,
      suspicionScore: Math.min(1, chargedTerms.length * SCORE_PER_CHARGED_TERM),
      civicScore: Math.min(0.25, civicTerms.length * SCORE_PER_CIVIC_TERM)
    };
  }
}
