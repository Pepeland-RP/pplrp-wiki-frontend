export const numbersTxt = (
  num: number,
  variations: [string, string, string],
): string => {
  const past = num % 10;
  const first = Math.floor(num / 10) % 10;

  let text: string;
  if (past === 1 && !num.toString().endsWith('11')) {
    text = variations[0]; // голос
  } else if (past >= 2 && past <= 4 && first !== 1) {
    text = variations[1]; // голоса
  } else {
    text = variations[2]; // голосов
  }

  return text;
};
