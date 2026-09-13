export function formatTime12Hour(value) {
  if (!value) return "";

  const match = String(value).trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return String(value);

  let hours = Number(match[1]);
  const minutes = match[2];
  const modifier = match[3]?.toUpperCase();

  if (modifier) {
    if (hours < 1 || hours > 12) return String(value);
    return `${hours}:${minutes} ${modifier}`;
  }

  if (hours > 23) return String(value);
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
}
