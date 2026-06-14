export class StorageUnavailableError extends Error {
  constructor(message = "Browser storage is unavailable.") {
    super(message);
    this.name = "StorageUnavailableError";
  }
}

export function storageErrorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === "QuotaExceededError") {
    return "Browser storage is full. Export a backup and remove unused browser data.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "The local database operation failed.";
}
