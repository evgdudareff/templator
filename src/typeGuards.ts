export function isError(e: unknown): e is Error {
  return e instanceof Error;
}

export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};
