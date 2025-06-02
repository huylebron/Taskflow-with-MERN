/**
 * Calendar Helper Functions
 * Xử lý dữ liệu cho FullCalendar và calendar functionality
 */

/**
 * Lọc cards có dueDate từ board hiện tại
 * @param {Object} board - Board object chứa columns và cards
 * @returns {Array} - Mảng các cards có dueDate
 */
export const getCardsWithDueDate = (board) => {
  if (!board || !board.columns) return []
  
  const cardsWithDueDate = []
  
  board.columns.forEach(column => {
    if (column.cards) {
      column.cards.forEach(card => {
        // Bỏ qua placeholder cards và cards không có dueDate
        if (!card.FE_PlaceholderCard && card.dueDate) {
          cardsWithDueDate.push({
            ...card,
            columnTitle: column.title,
            columnId: column._id
          })
        }
      })
    }
  })
  
  return cardsWithDueDate
}

/**
 * Get label color từ label ID
 * @param {Array} labelIds - Mảng label IDs của card
 * @param {Array} labels - Mảng tất cả labels
 * @returns {String} - Color code cho event
 */
export const getEventColor = (labelIds, labels) => {
  if (!labelIds || labelIds.length === 0) return '#9e9e9e' // Grey default
  
  // Lấy color của label đầu tiên
  const firstLabel = labels.find(label => labelIds.includes(label._id))
  return firstLabel ? firstLabel.color : '#9e9e9e'
}

/**
 * Tạo border color từ background color (darker shade)
 * @param {String} backgroundColor - Background color hex
 * @returns {String} - Border color hex
 */
export const getBorderColor = (backgroundColor) => {
  // Simple darkening by converting hex to RGB and reducing values
  const hex = backgroundColor.replace('#', '')
  const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 30)
  const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 30)
  const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 30)
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * Format cards thành events cho FullCalendar
 * @param {Array} cards - Mảng cards có dueDate
 * @param {Array} labels - Mảng labels để lấy colors
 * @param {Array} users - Mảng users để lấy member info
 * @returns {Array} - Mảng events cho FullCalendar
 */
export const formatCardsToCalendarEvents = (cards, labels = [], users = []) => {
  return cards.map(card => {
    const backgroundColor = getEventColor(card.labelIds, labels)
    const borderColor = getBorderColor(backgroundColor)
    
    // Get member names
    const memberNames = card.memberIds ? 
      card.memberIds.map(memberId => {
        const user = users.find(u => u._id === memberId)
        return user ? user.displayName : 'Unknown'
      }).join(', ') : ''
    
    // Get label names
    const labelNames = card.labelIds ? 
      card.labelIds.map(labelId => {
        const label = labels.find(l => l._id === labelId)
        return label ? label.title : 'Unknown'
      }) : []

    return {
      id: card._id,
      title: card.title,
      start: card.dueDate,
      end: card.dueDate, // Same as start for all-day events
      allDay: false, // Show with time
      backgroundColor,
      borderColor,
      textColor: '#ffffff',
      extendedProps: {
        cardId: card._id,
        boardId: card.boardId,
        columnId: card.columnId,
        columnTitle: card.columnTitle,
        description: card.description,
        labels: labelNames,
        members: card.memberIds || [],
        memberNames,
        cover: card.cover,
        comments: card.comments || [],
        attachments: card.attachments || [],
        createdAt: card.createdAt,
        createdBy: card.createdBy
      }
    }
  })
}

/**
 * Get due date status cho styling
 * @param {String} dueDate - Due date ISO string
 * @returns {String} - Status: 'overdue', 'today', 'upcoming'
 */
export const getDueDateStatus = (dueDate) => {
  const now = new Date()
  const due = new Date(dueDate)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())
  
  if (dueDay < today) return 'overdue'
  if (dueDay.getTime() === today.getTime()) return 'today'
  return 'upcoming'
}

/**
 * Process board data cho calendar
 * @param {Object} mockData - Mock data object
 * @returns {Object} - Processed data for calendar
 */
export const processCalendarData = (mockData) => {
  if (!mockData || !mockData.board) return { events: [], labels: [], users: [] }
  
  const { board, labels = [], users = [] } = mockData
  const cardsWithDueDate = getCardsWithDueDate(board)
  const events = formatCardsToCalendarEvents(cardsWithDueDate, labels, users)
  
  return {
    events,
    labels,
    users,
    totalCards: cardsWithDueDate.length,
    board
  }
}

/**
 * Nhóm cards theo ngày (JavaScript native)
 * @param {Array} cards - Mảng cards có dueDate
 * @returns {Object} - Object với key là ngày, value là mảng cards
 */
export const groupCardsByDate = (cards) => {
  const grouped = {}
  
  cards.forEach(card => {
    if (card.dueDate) {
      const date = new Date(card.dueDate)
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      
      grouped[dateKey].push(card)
    }
  })
  
  return grouped
}

/**
 * Lấy màu cho event dựa trên trạng thái due date
 * @param {string} status - Trạng thái due date
 * @returns {Object} - Object chứa màu sắc cho event
 */
export const getEventColorByStatus = (status) => {
  const colors = {
    overdue: {
      backgroundColor: '#f44336', // Red
      borderColor: '#d32f2f',
      color: '#ffffff'
    },
    today: {
      backgroundColor: '#ff9800', // Orange
      borderColor: '#f57c00',
      color: '#ffffff'
    },
    tomorrow: {
      backgroundColor: '#2196f3', // Blue
      borderColor: '#1976d2',
      color: '#ffffff'
    },
    thisWeek: {
      backgroundColor: '#4caf50', // Green
      borderColor: '#388e3c',
      color: '#ffffff'
    },
    upcoming: {
      backgroundColor: '#9c27b0', // Purple
      borderColor: '#7b1fa2',
      color: '#ffffff'
    },
    none: {
      backgroundColor: '#757575', // Grey
      borderColor: '#616161',
      color: '#ffffff'
    }
  }
  
  return colors[status] || colors.none
}

/**
 * Format ngày cho display (JavaScript native)
 * @param {string|Date} date - Ngày cần format
 * @param {string} formatType - Type: 'short', 'long', 'iso'
 * @returns {string} - Ngày đã format
 */
export const formatDisplayDate = (date, formatType = 'short') => {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  switch (formatType) {
    case 'short':
      return `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`
    case 'long':
      return dateObj.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    case 'iso':
      return dateObj.toISOString().split('T')[0]
    default:
      return dateObj.toLocaleDateString()
  }
}

/**
 * Kiểm tra xem card có thể được drop vào ngày nào đó không
 * @param {Object} card - Card object
 * @param {Date} targetDate - Ngày target để drop
 * @returns {boolean} - True nếu có thể drop
 */
export const canDropCardToDate = (card, targetDate) => {
  // Logic validation: có thể thêm các rule business ở đây
  // Ví dụ: không cho phép drop vào quá khứ (trừ hôm nay)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const target = new Date(targetDate)
  target.setHours(0, 0, 0, 0)
  
  // Cho phép drop vào hôm nay và tương lai
  return target >= today
}

/**
 * Tính toán statistics cho calendar
 * @param {Array} cards - Mảng cards có dueDate
 * @returns {Object} - Object chứa thống kê
 */
export const calculateCalendarStats = (cards) => {
  const stats = {
    total: cards.length,
    overdue: 0,
    today: 0,
    upcoming: 0
  }
  
  cards.forEach(card => {
    const status = getDueDateStatus(card.dueDate)
    if (stats.hasOwnProperty(status)) {
      stats[status]++
    }
  })
  
  return stats
}

/**
 * Filter cards theo khoảng thời gian
 * @param {Array} cards - Mảng cards
 * @param {Date} startDate - Ngày bắt đầu
 * @param {Date} endDate - Ngày kết thúc
 * @returns {Array} - Cards trong khoảng thời gian
 */
export const filterCardsByDateRange = (cards, startDate, endDate) => {
  return cards.filter(card => {
    if (!card.dueDate) return false
    
    const cardDate = new Date(card.dueDate)
    return cardDate >= startDate && cardDate <= endDate
  })
}

/**
 * Check if date is today (JavaScript native)
 * @param {Date} date - Date to check
 * @returns {boolean} - True if date is today
 */
export const isToday = (date) => {
  const today = new Date()
  const checkDate = new Date(date)
  
  return today.getFullYear() === checkDate.getFullYear() &&
         today.getMonth() === checkDate.getMonth() &&
         today.getDate() === checkDate.getDate()
}

/**
 * Check if date is in the past (JavaScript native)
 * @param {Date} date - Date to check
 * @returns {boolean} - True if date is in the past
 */
export const isPast = (date) => {
  const now = new Date()
  const checkDate = new Date(date)
  
  // Reset time to compare only dates
  now.setHours(0, 0, 0, 0)
  checkDate.setHours(0, 0, 0, 0)
  
  return checkDate < now
} 