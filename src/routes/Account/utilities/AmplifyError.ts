/**
 * Represents the Amplify auth error class
 */
export class AmplifyError extends Error {
  public code: string;

  /**
   * @param code Error code
   * @param message Error message
   */
  public constructor(code: string, message?: string) {
    super();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AmplifyError);
    }

    this.name = "AmplifyError";
    // Custom debugging information
    this.code = code;
    this.message = message || "";
  }
}
