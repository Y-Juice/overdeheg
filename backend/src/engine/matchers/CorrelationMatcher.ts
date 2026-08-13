import { CorrelationMatch, CorrelationMatchType } from "../../types/domain";

/**
 * Contract voor een correlatiematcher.
 * Elke matcher zoekt in de database naar een specifiek gedragspatroon.
 * Nieuwe soorten verbanden krijgen een eigen matcher,
 * zonder dat de engine of bestaande matchers aangepast hoeven te worden.
 */
export interface CorrelationMatcher {
  readonly matchType: CorrelationMatchType;
  findMatches(): Promise<CorrelationMatch[]>;
}
