export const AFRICAN_STYLES = [
  {
    id: 'conte-africain',
    name: 'Conte africain',
    description: 'Griots, légendes & mythes',
    emoji: '📖',
    promptSuffix:
      'African storytelling aesthetic, warm earth tones, baobab trees, traditional African setting, painterly style, golden hour lighting',
  },
  {
    id: 'afrobeats',
    name: 'Afrobeats',
    description: 'Énergie & couleurs vives',
    emoji: '🎵',
    promptSuffix:
      'Afrobeats music scene, vibrant colors, Lagos Nigeria aesthetic, concert atmosphere, neon lights, energetic composition',
  },
  {
    id: 'mode-traditionnelle',
    name: 'Mode traditionnelle',
    description: 'Wax, boubou, gele',
    emoji: '👘',
    promptSuffix:
      'African traditional fashion, kente cloth, ankara wax print, gele headwrap, boubou robe, high fashion photography',
  },
  {
    id: 'portrait-royal',
    name: 'Portrait royal',
    description: 'Dignité & majesté',
    emoji: '👑',
    promptSuffix:
      'Royal African portrait, majestic dignity, traditional regalia, dramatic studio lighting, regal composition, high contrast',
  },
  {
    id: 'architecture',
    name: 'Architecture',
    description: 'Villes africaines',
    emoji: '🏛️',
    promptSuffix:
      'African architecture, Dakar Saint-Louis Marrakech Lagos Accra, blend of traditional and modern, golden light, aerial or street view',
  },
  {
    id: 'nature-sauvage',
    name: 'Nature sauvage',
    description: 'Savane & jungle',
    emoji: '🌿',
    promptSuffix:
      'African wildlife and landscape, savanna, Congo rainforest, dramatic sky, National Geographic style photography',
  },
  {
    id: 'bd-africaine',
    name: 'BD africaine',
    description: 'Comics & illustration',
    emoji: '✏️',
    promptSuffix:
      'African comic book style, graphic novel illustration, bold outlines, flat colors, Pan-African aesthetic',
  },
  {
    id: 'cover-musical',
    name: 'Cover musical',
    description: "Pochettes d'album",
    emoji: '🎨',
    promptSuffix:
      'African music album cover art, Afrobeats or Afropop aesthetic, artistic composition, typography-ready, striking visual',
  },
] as const

export type StyleId = (typeof AFRICAN_STYLES)[number]['id']

export function getStyle(id: StyleId) {
  return AFRICAN_STYLES.find((s) => s.id === id)
}
