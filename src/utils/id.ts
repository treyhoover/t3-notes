const PREFIX = "tmp_";

export const tmpId = () =>
  PREFIX + new Date().toISOString() + Math.random().toString();

export const isTmpId = (id: string) => id.startsWith(PREFIX);
