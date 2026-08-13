/**
 * Fout die wordt gegooid wanneer invoer de validatie niet doorstaat.
 * Routes vertalen deze fout naar een HTTP 400 antwoord.
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
