export type ResultType<T, E = Error> = { success: true; value: T } | { success: false; error: E };
