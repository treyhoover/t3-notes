export const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export const sample = <T>(arr: T[]) => {
  const idx = randomInt(0, arr.length - 1);
  const item = arr[idx];

  if (item == null) {
    throw new Error("Array cannot be empty");
  }

  return item;
};
