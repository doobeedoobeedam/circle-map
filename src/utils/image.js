// perkecil & potong foto jadi persegi supaya hemat ruang di localStorage
export function resizePhoto(file, size = 192) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('The file must be an image.'))
    if (file.size > 10 * 1024 * 1024) return reject(new Error('Photo size must be 10 MB or less.'))
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const side = Math.min(img.width, img.height)
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = size
      canvas
        .getContext('2d')
        .drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("This photo can't be read. Try another file."))
    }
    img.src = url
  })
}
