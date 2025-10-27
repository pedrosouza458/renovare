// Generate a consistent color based on username
export const generateAvatarColor = (username: string): string => {
  // Use a simple hash function to generate a number from the username
  const hash = username.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // Generate HSL color with consistent saturation and lightness
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
};
