/**
 * YouTube: TrungQuanDev - Một Lập Trình Viên
 * Created by trungquandev.com's author on Jun 28, 2023
 */
/**
 * Capitalize the first letter of a string
 */
export const capitalizeFirstLetter = (val) => {
  if (!val) return ''
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}`
}


export const generatePlaceholderCard = (column) => {
  return {
    _id: `${column._id}-placeholder-card`,
    boardId: column.boardId,
    columnId: column._id,
    FE_PlaceholderCard: true
  }
}

// Kỹ thuật dùng css pointer-event để chặn user spam click tại bất kỳ chỗ nào có hành động click gọi api
// Đây là một kỹ thuật rất hay tận dụng Axios Interceptors và CSS Pointer-events để chỉ phải viết code xử lý một lần cho toàn bộ dự án
// Cách sử dụng: Với tất cả các link hoặc button mà có hành động gọi api thì thêm class "interceptor-loading" cho nó là xong.
export const interceptorLoadingElements = (calling) => {
  // DOM lấy ra toàn bộ phần tử trên page hiện tại có className là 'interceptor-loading'
  const elements = document.querySelectorAll('.interceptor-loading')
  for (let i = 0; i < elements.length; i++) {
    if (calling) {
      // Nếu đang trong thời gian chờ gọi API (calling === true) thì sẽ làm mờ phần tử và chặn click bằng css pointer-events
      elements[i].style.opacity = '0.5'
      elements[i].style.pointerEvents = 'none'
    } else {
      // Ngược lại thì trả về như ban đầu, không làm gì cả
      elements[i].style.opacity = 'initial'
      elements[i].style.pointerEvents = 'initial'
    }
  }
}

/**
 * Helper function để tính màu text contrast phù hợp với background color
 * Input là hex color (không còn gradient)
 */
export const getTextColorForBackground = (backgroundColor) => {
  if (!backgroundColor) return 'inherit'

  // Kiểm tra nếu backgroundColor không phải hex color hợp lệ
  if (!backgroundColor.startsWith('#')) {
    return '#000000' // Fallback
  }

  try {
    // Chuyển hex color thành RGB
    const hex = backgroundColor.replace('#', '')

    // Kiểm tra độ dài hex hợp lệ
    if (hex.length !== 3 && hex.length !== 6) {
      return '#000000' // Fallback cho hex không hợp lệ
    }

    let r, g, b

    if (hex.length === 3) {
      // Xử lý hex 3 ký tự (ví dụ: #fff)
      r = parseInt(hex.charAt(0) + hex.charAt(0), 16)
      g = parseInt(hex.charAt(1) + hex.charAt(1), 16)
      b = parseInt(hex.charAt(2) + hex.charAt(2), 16)
    } else {
      // Xử lý hex 6 ký tự (ví dụ: #ffffff)
      r = parseInt(hex.substring(0, 2), 16)
      g = parseInt(hex.substring(2, 4), 16)
      b = parseInt(hex.substring(4, 6), 16)
    }

    // Kiểm tra giá trị RGB hợp lệ
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return '#000000' // Fallback
    }

    // Tính luminance theo công thức W3C
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    // Trả về màu text phù hợp
    return luminance > 0.5 ? '#000000' : '#ffffff'
  } catch (error) {
    console.warn('Error calculating text color for background:', backgroundColor, error)
    return '#000000' // Fallback cho mọi lỗi
  }
}
