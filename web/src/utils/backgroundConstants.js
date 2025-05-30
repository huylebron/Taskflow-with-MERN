/**
 * Constants cho background types và mock data cho BoardBackgroundSwitcher
 */

// Định nghĩa các kiểu background
export const BACKGROUND_TYPES = {
  COLOR: 'color',
  IMAGE: 'image',
  GRADIENT: 'gradient'
}

// 20 Preset Colors - HEX codes cho backgrounds
export const BACKGROUND_COLORS = {
  // Blues
  BLUE_1: '#0079bf',
  BLUE_2: '#026aa7',
  BLUE_3: '#00adcc',
  BLUE_4: '#4C9AFF',
  
  // Greens
  GREEN_1: '#519839',
  GREEN_2: '#70b500',
  GREEN_3: '#4BBF6B',
  GREEN_4: '#00875A',
  
  // Reds
  RED_1: '#b04632',
  RED_2: '#c9372c',
  RED_3: '#eb5a46',
  RED_4: '#FF5630',
  
  // Purples
  PURPLE_1: '#89609e',
  PURPLE_2: '#6554c0',
  PURPLE_3: '#9c27b0',
  PURPLE_4: '#6157FF',
  
  // Neutrals
  GREY_1: '#838c91',
  GREY_2: '#4f4f4f',
  BROWN_1: '#94642e',
  BLACK_1: '#172b4d'
}

// Convert BACKGROUND_COLORS object thành array để dễ dàng render UI
export const BACKGROUND_COLORS_ARRAY = Object.values(BACKGROUND_COLORS)

// Mảng preset images URLs cho backgrounds
export const BACKGROUND_IMAGES = [
  // Nature & Landscapes
  'https://images.unsplash.com/photo-1519681393784-d120267933ba',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  'https://images.unsplash.com/photo-1477346611705-65d1883cee1e',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
  'https://images.unsplash.com/photo-1525220964737-6c299398493c',
  
  // Abstract & Patterns
  'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3',
  'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809',
  'https://images.unsplash.com/photo-1554147090-e1221a04a025',
  'https://images.unsplash.com/photo-1518655048521-f130df041f66',
  
  // Work & Productivity
  'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b',
  'https://images.unsplash.com/photo-1542435503-956c469947f6',
  'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc',
  'https://images.unsplash.com/photo-1530893609608-32a9af3aa95c',
  'https://images.unsplash.com/photo-1531685250784-7569952593d2'
]

// Default background cho board mới
export const DEFAULT_BACKGROUND = {
  type: BACKGROUND_TYPES.COLOR,
  value: BACKGROUND_COLORS.BLUE_1
}

// Format background data để đảm bảo tính nhất quán
export const formatBackgroundData = (type, value) => {
  return {
    type: type || BACKGROUND_TYPES.COLOR,
    value: value || DEFAULT_BACKGROUND.value
  }
} 