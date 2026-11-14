// avatar bawaan
const INK = '#4A3F5C'
const EYES = `<circle cx="38" cy="54" r="4.5" fill="${INK}"/><circle cx="62" cy="54" r="4.5" fill="${INK}"/><circle cx="39.6" cy="52.4" r="1.5" fill="#fff"/><circle cx="63.6" cy="52.4" r="1.5" fill="#fff"/>`
const BLUSH = `<ellipse cx="29" cy="64" rx="6" ry="4" fill="#FF8FB8" opacity=".5"/><ellipse cx="71" cy="64" rx="6" ry="4" fill="#FF8FB8" opacity=".5"/>`
const MOUTH = `<path d="M45 66 Q50 71 55 66" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`

// back = telinga (digambar di belakang wajah), front = detail di atas wajah
const ANIMALS = [
  {
    id: 'kucing', name: 'Cat', bg: '#FFE8F0', face: '#FFE0B8',
    back: `<path d="M20 46 L24 14 L48 30Z" fill="#FFE0B8"/><path d="M80 46 L76 14 L52 30Z" fill="#FFE0B8"/><path d="M26 38 L27 24 L39 31Z" fill="#FF9EBD"/><path d="M74 38 L73 24 L61 31Z" fill="#FF9EBD"/>`,
    front: `<path d="M47 60 L53 60 L50 64Z" fill="#FF8FB8"/><path d="M12 60 L28 62 M12 68 L28 66 M88 60 L72 62 M88 68 L72 66" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>`,
  },
  {
    id: 'kelinci', name: 'Bunny', bg: '#F0EBFF', face: '#FFFFFF', stroke: '#E6DDF7',
    back: `<ellipse cx="36" cy="24" rx="9" ry="20" fill="#fff" stroke="#E6DDF7" stroke-width="2"/><ellipse cx="64" cy="24" rx="9" ry="20" fill="#fff" stroke="#E6DDF7" stroke-width="2"/><ellipse cx="36" cy="26" rx="4" ry="13" fill="#FFB8D1"/><ellipse cx="64" cy="26" rx="4" ry="13" fill="#FFB8D1"/>`,
    front: `<ellipse cx="50" cy="61" rx="3.2" ry="2.4" fill="#FF8FB8"/>`,
  },
  {
    id: 'beruang', name: 'Bear', bg: '#FFF0E6', face: '#D9A679',
    back: `<circle cx="25" cy="30" r="12" fill="#C98F5E"/><circle cx="75" cy="30" r="12" fill="#C98F5E"/><circle cx="25" cy="30" r="6" fill="#F2C9A5"/><circle cx="75" cy="30" r="6" fill="#F2C9A5"/>`,
    front: `<ellipse cx="50" cy="68" rx="13" ry="10" fill="#F6DDC3"/><ellipse cx="50" cy="63" rx="4" ry="3" fill="${INK}"/>`,
    mouth: `<path d="M46 70 Q50 74 54 70" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
  },
  {
    id: 'panda', name: 'Panda', bg: '#E4F7F1', face: '#FFFFFF', stroke: '#E3E0EA',
    back: `<circle cx="24" cy="30" r="11" fill="${INK}"/><circle cx="76" cy="30" r="11" fill="${INK}"/>`,
    front: `<ellipse cx="37" cy="54" rx="8" ry="10" fill="${INK}" transform="rotate(20 37 54)"/><ellipse cx="63" cy="54" rx="8" ry="10" fill="${INK}" transform="rotate(-20 63 54)"/><circle cx="38" cy="53" r="3.2" fill="#fff"/><circle cx="62" cy="53" r="3.2" fill="#fff"/><ellipse cx="50" cy="63" rx="4" ry="3" fill="${INK}"/>`,
    eyes: false,
    mouth: `<path d="M46 69 Q50 73 54 69" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
  },
  {
    id: 'rubah', name: 'Fox', bg: '#FFF0E6', face: '#FFAE73',
    back: `<path d="M20 48 L22 14 L46 32Z" fill="#FF9F5A"/><path d="M80 48 L78 14 L54 32Z" fill="#FF9F5A"/><path d="M25 36 L25 22 L37 30Z" fill="${INK}"/><path d="M75 36 L75 22 L63 30Z" fill="${INK}"/>`,
    front: `<path d="M16 62 Q34 58 50 76 Q66 58 84 62 Q78 86 50 90 Q22 86 16 62Z" fill="#FFF3E6"/><ellipse cx="50" cy="71" rx="4" ry="3" fill="${INK}"/>`,
    mouth: '',
  },
  {
    id: 'katak', name: 'Frog', bg: '#E4F7F1', face: '#A8E6CF',
    back: `<circle cx="34" cy="30" r="11" fill="#A8E6CF"/><circle cx="66" cy="30" r="11" fill="#A8E6CF"/>`,
    front: `<circle cx="34" cy="31" r="7" fill="#fff"/><circle cx="66" cy="31" r="7" fill="#fff"/><circle cx="35" cy="32" r="3.5" fill="${INK}"/><circle cx="65" cy="32" r="3.5" fill="${INK}"/>`,
    eyes: false,
    mouth: `<path d="M36 62 Q50 74 64 62" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  },
  {
    id: 'ayam', name: 'Chick', bg: '#FFF6CC', face: '#FFE680',
    back: `<path d="M42 26 Q46 8 50 22 Q54 8 58 26Z" fill="#FFE680"/>`,
    front: `<path d="M44 60 L56 60 L50 69Z" fill="#FF9F5A"/>`,
    mouth: '',
  },
  {
    id: 'babi', name: 'Piglet', bg: '#FFE8F0', face: '#FFC2D8',
    back: `<path d="M20 40 Q16 16 40 24Z" fill="#FFA9C8"/><path d="M80 40 Q84 16 60 24Z" fill="#FFA9C8"/>`,
    front: `<ellipse cx="50" cy="66" rx="12" ry="9" fill="#FF9EBD"/><circle cx="46" cy="66" r="2" fill="#A22D63"/><circle cx="54" cy="66" r="2" fill="#A22D63"/>`,
    mouth: '',
  },
]

function buildSvg(a) {
  const stroke = a.stroke ? ` stroke="${a.stroke}" stroke-width="2"` : ''
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<rect width="100" height="100" fill="${a.bg}"/>${a.back || ''}` +
    `<circle cx="50" cy="56" r="34" fill="${a.face}"${stroke}/>${a.front || ''}` +
    `${a.eyes === false ? '' : EYES}${BLUSH}${a.mouth ?? MOUTH}</svg>`
  )
}

export const PRESET_AVATARS = ANIMALS.map((a) => ({
  id: a.id,
  name: a.name,
  src: 'data:image/svg+xml;utf8,' + encodeURIComponent(buildSvg(a)),
}))

// kembalikan alamat gambar avatar milik seorang teman (foto upload atau avatar bawaan)
export function avatarSrc(friend) {
  const av = friend?.avatar || {}
  if (av.type === 'photo' && av.src) return av.src
  return (PRESET_AVATARS.find((p) => p.id === av.id) || PRESET_AVATARS[0]).src
}
