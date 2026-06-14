import { NoZeroDatabase } from "../db/database";

export function createTestDatabase(): NoZeroDatabase {
  return new NoZeroDatabase(`no-zero-test-${crypto.randomUUID()}`);
}
