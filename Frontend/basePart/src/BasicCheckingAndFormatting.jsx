import stringSimilarity from "string-similarity";

export function checkPrivateBrowsing() {
  try {
    localStorage.setItem("__test__", "1");
    localStorage.removeItem("__test__");
    return false;
  } catch {
    return true;
  }
}
export function formatDate(dateString, timezone) {
  const generalDate = new Date(dateString);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(generalDate);
  const year = parts.find((p) => p.type === "year").value;
  const month = parts.find((p) => p.type === "month").value;
  const day = parts.find((p) => p.type === "day").value;
  return `${year}-${month}-${day}`;
}
// Add exercise helper functions
export function normalizeInput(input) {
  const cleaned = input
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/[^a-z0-9]+/gi, " ")
    .replace(/\s+/g, " ");
  return cleaned;
}
export function getTodayKey(timezone) {
  const now = new Date().toISOString();
  return formatDate(now, timezone);
}

export function bestMatch(inputValue, list) {
  const closestMatch = stringSimilarity.findBestMatch(inputValue, list);
  const target = closestMatch.bestMatch.target;
  const rating = closestMatch.bestMatch.rating;
  return { target, rating };
}
