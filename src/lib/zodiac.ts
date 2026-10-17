const SIGNS: [string, string, number, number][] = [
  // sign, emoji, last month, last day (inclusive end of the sign that starts the year)
  ["Capricorn", "♑", 1, 19], ["Aquarius", "♒", 2, 18], ["Pisces", "♓", 3, 20], ["Aries", "♈", 4, 19],
  ["Taurus", "♉", 5, 20], ["Gemini", "♊", 6, 20], ["Cancer", "♋", 7, 22], ["Leo", "♌", 8, 22],
  ["Virgo", "♍", 9, 22], ["Libra", "♎", 10, 22], ["Scorpio", "♏", 11, 21], ["Sagittarius", "♐", 12, 21],
];

/** Western zodiac sign from a yyyy-mm-dd birthday, or null if invalid. */
export function zodiacFor(iso: string): { name: string; emoji: string } | null {
  const [, m, d] = iso.split("-").map(Number);
  if (!m || !d) return null;
  for (const [name, emoji, mm, dd] of SIGNS) if (m < mm || (m === mm && d <= dd)) return { name, emoji };
  return { name: "Capricorn", emoji: "♑" };
}

export const MBTI = ["INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP","ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"];
