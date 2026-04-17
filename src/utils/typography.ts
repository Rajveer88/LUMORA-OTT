export function getTitleFontClass(genres: string[] = []): string {
  const genreLower = genres.map(g => g.toLowerCase());
  
  // Cyberpunk / Tech
  if (genreLower.some(g => ['cyberpunk', 'tech', 'hacker'].includes(g))) {
    return 'font-rajdhani tracking-wider';
  }
  
  // Sci-Fi / Futuristic
  if (genreLower.some(g => ['sci-fi', 'science fiction', 'space'].includes(g))) {
    return 'font-orbitron tracking-widest uppercase';
  }

  // Action / Bold
  if (genreLower.some(g => ['action', 'thriller', 'crime'].includes(g))) {
    return 'font-bebas tracking-normal uppercase';
  }

  // Drama / Emotional / Romance
  if (genreLower.some(g => ['drama', 'romance', 'emotional'].includes(g))) {
    return 'font-playfair tracking-normal italic';
  }

  // Epic / Historical / Mystery
  if (genreLower.some(g => ['epic', 'historical', 'mystery', 'fantasy'].includes(g))) {
    return 'font-cinzel tracking-wide uppercase';
  }

  // Default Cinematic
  return 'font-sans font-black tracking-[-0.02em]';
}
