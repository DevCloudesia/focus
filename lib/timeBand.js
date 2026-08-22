// Sunrise-to-sunset theming: which part of the day it is, locally, right now.
// Keep this logic identical to the inline <head> script in app/layout.js so
// the CSS variables it sets and the copy/icon this drives never disagree.
export function getTimeBand(date = new Date()) {
  const h = date.getHours();
  if (h >= 5 && h < 8) return "dawn";
  if (h >= 8 && h < 17) return "day";
  if (h >= 17 && h < 20) return "dusk";
  return "night";
}

export function getGreeting(date = new Date()) {
  const h = date.getHours();
  if (h >= 5 && h < 8) return "Rise and shine";
  if (h >= 8 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 20) return "Good evening";
  return "Winding down";
}
