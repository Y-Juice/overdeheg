/**
 * Contract voor validatiestrategieen.
 * Een validator controleert onbekende invoer en geeft een schoon,
 * getypeerd object terug of gooit een ValidationError.
 * Services hangen alleen van dit contract af, niet van een concrete validator.
 */
export interface Validator<T> {
  validate(input: unknown): T;
}
