/**
 * Thrown when server configuration the request needs, such as an
 * environment variable, is missing. API routes answer it with a 503.
 */
export class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigError';
  }
}
