/**
 * Tính màu văn bản (trắng hoặc đen) tương phản với màu nền
 * Dựa trên thuật toán tính độ sáng màu (luminance) - WCAG 2.0
 * @param {string} backgroundColor - Mã màu HEX (ví dụ: #FF0000)
 * @returns {string} - Mã màu HEX cho văn bản (#FFFFFF hoặc #000000)
 */
export const getContrastText = (backgroundColor) => {
  // Xử lý trường hợp màu được truyền vào không đúng định dạng
  if (!backgroundColor || typeof backgroundColor !== 'string') {
    return '#000000' // Mặc định trả về màu đen
  }

  // Loại bỏ ký tự # nếu có
  let color = backgroundColor.replace('#', '')

  // Xử lý màu dạng rút gọn (ví dụ: #F00 -> #FF0000)
  if (color.length === 3) {
    color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2]
  }

  // Nếu không phải màu hợp lệ, trả về màu đen
  if (color.length !== 6) {
    return '#000000'
  }

  // Chuyển đổi sang RGB
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)

  // Sử dụng thuật toán WCAG 2.0 để tính relative luminance
  const getRGBLuminance = (colorValue) => {
    const srgb = colorValue / 255
    return srgb <= 0.03928 
      ? srgb / 12.92 
      : Math.pow((srgb + 0.055) / 1.055, 2.4)
  }

  const luminance = 0.2126 * getRGBLuminance(r) + 
                   0.7152 * getRGBLuminance(g) + 
                   0.0722 * getRGBLuminance(b)

  // Sử dụng ngưỡng 0.179 để có contrast tốt hơn (Trello-like)
  return luminance > 0.179 ? '#000000' : '#FFFFFF'
}

/**
 * Tìm label dựa vào ID từ danh sách labels
 * @param {string} labelId - ID của label cần tìm
 * @param {Array} labelsArray - Mảng chứa các đối tượng label
 * @returns {Object|null} - Đối tượng label tìm thấy hoặc null nếu không tìm thấy
 */
export const findLabelById = (labelId, labelsArray) => {
  if (!labelId || !Array.isArray(labelsArray)) return null
  return labelsArray.find(label => label.id === labelId) || null
}

/**
 * Kiểm tra xem một label có tồn tại trong mảng labels của card hay không
 * @param {string} labelId - ID của label cần kiểm tra
 * @param {Array} cardLabelIds - Mảng chứa IDs của các labels đã gán cho card
 * @returns {boolean} - true nếu label đã được gán cho card, false nếu chưa
 */
export const isLabelAssignedToCard = (labelId, cardLabelIds) => {
  if (!labelId || !Array.isArray(cardLabelIds)) return false
  return cardLabelIds.includes(labelId)
}

/**
 * Thêm hoặc xóa một label khỏi card
 * @param {string} labelId - ID của label cần toggle
 * @param {Array} currentLabelIds - Mảng hiện tại chứa IDs của các labels đã gán cho card
 * @returns {Array} - Mảng mới sau khi đã toggle label
 */
export const toggleLabel = (labelId, currentLabelIds) => {
  if (!labelId || !Array.isArray(currentLabelIds)) return currentLabelIds || []

  const isLabelExist = currentLabelIds.includes(labelId)

  // Nếu label đã tồn tại, xóa nó khỏi mảng
  if (isLabelExist) {
    return currentLabelIds.filter(id => id !== labelId)
  }

  // Nếu label chưa tồn tại, thêm vào mảng
  return [...currentLabelIds, labelId]
}

/**
 * Lọc labels theo từ khóa tìm kiếm
 * @param {Array} labelsArray - Mảng chứa các đối tượng label
 * @param {string} searchTerm - Từ khóa tìm kiếm
 * @returns {Array} - Mảng các labels sau khi đã lọc
 */
export const filterLabelsBySearchTerm = (labelsArray, searchTerm) => {
  if (!Array.isArray(labelsArray)) return []
  if (!searchTerm) return labelsArray

  const term = searchTerm.toLowerCase().trim()
  return labelsArray.filter(label =>
    label.name.toLowerCase().includes(term)
  )
}