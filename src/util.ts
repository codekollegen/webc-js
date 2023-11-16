export const kebabize = (str: string) => {
  return str
    .split("")
    .map((letter, idx) => {
      return letter.toUpperCase() === letter
        ? `${idx !== 0 ? "-" : ""}${letter.toLowerCase()}`
        : letter;
    })
    .join("");
};

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const camelize = (str: string) => {
  return str
    .split("-")
    .map((word, idx) => {
      return idx === 0 ? word.toLowerCase() : capitalize(word);
    })
    .join("");
};
