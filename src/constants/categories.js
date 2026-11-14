export const CATEGORIES = [
  { id: 'bestie', label: 'Bestie', emoji: '💖', color: '#FFB8D1', soft: '#FFE8F0', text: '#A22D63' },
  { id: 'kuliah', label: 'College Friends', emoji: '🎓', color: '#CDBBFF', soft: '#F0EBFF', text: '#5535AE' },
  { id: 'liburan', label: 'Travel Buddy', emoji: '🏝️', color: '#A8E6CF', soft: '#E4F7F1', text: '#1F6F52' },
  { id: 'kerja', label: 'Coworker', emoji: '💼', color: '#FFD3B0', soft: '#FFF0E6', text: '#9A4E15' },
  { id: 'mabar', label: 'Gaming Buddy', emoji: '🎮', color: '#B5DCFF', soft: '#E8F4FF', text: '#25609B' },
]

export const getCategory = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0]
