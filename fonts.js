const googleFonts = [
  "Belanosima",
  "Bungee Shade",
  "Concert One",
  "Lilita One",
  "Matemasie",
  "Oregano",
  "Silkscreen",
];

// Dynamically load Google Fonts
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = `https://fonts.googleapis.com/css2?${googleFonts
  .map((font) => `family=${font.replace(/ /g, "+")}`)
  .join("&")}&display=swap`;
document.head.appendChild(link);
