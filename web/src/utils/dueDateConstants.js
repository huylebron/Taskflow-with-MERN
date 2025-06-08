/**
 * Due Date Visual Constants
 * Centralized color coding and styling for due date indicators across the application
 */

// Due date status types
export const DUE_DATE_STATUS = {
  OVERDUE: 'overdue',
  DUE_SOON: 'due-soon',
  UPCOMING: 'upcoming',
  NORMAL: 'normal'
}

// Color scheme for due date statuses
export const DUE_DATE_COLORS = {
  [DUE_DATE_STATUS.OVERDUE]: {
    primary: '#d32f2f',      // Strong red
    secondary: '#f5dcdc',    // Light red background
    text: '#ffffff',         // White text for contrast
    border: '#b71c1c',       // Darker red border
    glow: 'rgba(211, 47, 47, 0.3)', // Red glow effect
    gradient: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)'
  },
  [DUE_DATE_STATUS.DUE_SOON]: {
    primary: '#f57c00',      // Orange
    secondary: '#fff3e0',    // Light orange background
    text: '#e65100',         // Dark orange text
    border: '#ef6c00',       // Orange border
    glow: 'rgba(245, 124, 0, 0.3)', // Orange glow effect
    gradient: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)'
  },
  [DUE_DATE_STATUS.UPCOMING]: {
    primary: '#388e3c',      // Green
    secondary: '#e8f5e8',    // Light green background
    text: '#2e7d32',         // Dark green text
    border: '#4caf50',       // Green border
    glow: 'rgba(56, 142, 60, 0.3)', // Green glow effect
    gradient: 'linear-gradient(135deg, #388e3c 0%, #4caf50 100%)'
  },
  [DUE_DATE_STATUS.NORMAL]: {
    primary: '#1976d2',      // Blue
    secondary: '#e3f2fd',    // Light blue background
    text: '#1565c0',         // Dark blue text
    border: '#2196f3',       // Blue border
    glow: 'rgba(25, 118, 210, 0.3)', // Blue glow effect
    gradient: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)'
  }
}

// Time thresholds in hours
export const DUE_DATE_THRESHOLDS = {
  OVERDUE: 0,           // Less than 0 hours (past due)
  DUE_SOON: 24,         // Within 24 hours
  UPCOMING: 168         // Within 7 days (168 hours)
}

/**
 * Get due date status based on the due date
 * @param {string|Date} dueDate - The due date
 * @returns {string} The status (overdue, due-soon, upcoming, normal)
 */
export const getDueDateStatus = (dueDate) => {
  if (!dueDate) return DUE_DATE_STATUS.NORMAL
  
  const now = new Date()
  const due = new Date(dueDate)
  const diffInHours = (due - now) / (1000 * 60 * 60)
  
  if (diffInHours < DUE_DATE_THRESHOLDS.OVERDUE) {
    return DUE_DATE_STATUS.OVERDUE
  } else if (diffInHours <= DUE_DATE_THRESHOLDS.DUE_SOON) {
    return DUE_DATE_STATUS.DUE_SOON
  } else if (diffInHours <= DUE_DATE_THRESHOLDS.UPCOMING) {
    return DUE_DATE_STATUS.UPCOMING
  } else {
    return DUE_DATE_STATUS.NORMAL
  }
}

/**
 * Get color scheme for a due date status
 * @param {string} status - The due date status
 * @returns {object} Color scheme object
 */
export const getDueDateColors = (status) => {
  return DUE_DATE_COLORS[status] || DUE_DATE_COLORS[DUE_DATE_STATUS.NORMAL]
}

/**
 * Get primary color for a due date
 * @param {string|Date} dueDate - The due date
 * @returns {string} Primary color
 */
export const getDueDateColor = (dueDate) => {
  const status = getDueDateStatus(dueDate)
  return getDueDateColors(status).primary
}

/**
 * Format due date for display with relative time
 * @param {string|Date} dueDate - The due date
 * @returns {string} Formatted date string
 */
export const formatDueDateDisplay = (dueDate) => {
  if (!dueDate) return ''
  
  const due = new Date(dueDate)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())
  
  const diffInDays = Math.ceil((dueDay - today) / (1000 * 60 * 60 * 24))
  const timeString = due.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  
  if (diffInDays === 0) {
    return `Hôm nay ${timeString}`
  } else if (diffInDays === 1) {
    return `Ngày mai ${timeString}`
  } else if (diffInDays === -1) {
    return `Hôm qua ${timeString}`
  } else if (diffInDays < 0) {
    return `${Math.abs(diffInDays)} ngày trước`
  } else if (diffInDays <= 7) {
    return `${diffInDays} ngày nữa`
  } else {
    return due.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    })
  }
}

/**
 * Get urgency level text for accessibility
 * @param {string} status - The due date status
 * @returns {string} Urgency description
 */
export const getUrgencyText = (status) => {
  switch (status) {
    case DUE_DATE_STATUS.OVERDUE:
      return 'Quá hạn - Cần xử lý ngay'
    case DUE_DATE_STATUS.DUE_SOON:
      return 'Sắp hết hạn - Ưu tiên cao'
    case DUE_DATE_STATUS.UPCOMING:
      return 'Sắp đến hạn - Theo dõi'
    default:
      return 'Bình thường'
  }
}

/**
 * Get Material-UI chip styles for due date badges
 * @param {string} status - The due date status
 * @param {object} theme - MUI theme object
 * @returns {object} Chip style object
 */
export const getDueDateChipStyles = (status, theme) => {
  const colors = getDueDateColors(status)
  
  const baseStyles = {
    fontSize: '11px',
    height: '24px',
    fontWeight: 600,
    '& .MuiChip-label': {
      px: 1,
      fontSize: '11px',
      fontWeight: 600
    },
    '& .MuiChip-icon': {
      fontSize: '14px',
      marginLeft: '4px'
    },
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: `0 2px 8px ${colors.glow}`
    }
  }

  switch (status) {
    case DUE_DATE_STATUS.OVERDUE:
      return {
        ...baseStyles,
        backgroundColor: colors.primary,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        '& .MuiChip-icon': {
          ...baseStyles['& .MuiChip-icon'],
          color: colors.text
        },
        animation: 'pulse 2s infinite'
      }
    case DUE_DATE_STATUS.DUE_SOON:
      return {
        ...baseStyles,
        backgroundColor: colors.secondary,
        color: colors.text,
        border: `1px solid ${colors.primary}`,
        '& .MuiChip-icon': {
          ...baseStyles['& .MuiChip-icon'],
          color: colors.text
        }
      }
    case DUE_DATE_STATUS.UPCOMING:
      return {
        ...baseStyles,
        backgroundColor: colors.secondary,
        color: colors.text,
        border: `1px solid ${colors.primary}`,
        '& .MuiChip-icon': {
          ...baseStyles['& .MuiChip-icon'],
          color: colors.text
        }
      }
    default:
      return {
        ...baseStyles,
        backgroundColor: theme?.palette?.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.08)' 
          : 'rgba(0, 0, 0, 0.08)',
        color: theme?.palette?.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.7)' 
          : 'rgba(0, 0, 0, 0.6)',
        '& .MuiChip-icon': {
          ...baseStyles['& .MuiChip-icon'],
          color: theme?.palette?.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.7)' 
            : 'rgba(0, 0, 0, 0.6)'
        }
      }
  }
}

/**
 * Get FullCalendar event styles for calendar display
 * @param {string} status - The due date status
 * @returns {object} Event style object
 */
export const getCalendarEventStyles = (status) => {
  const colors = getDueDateColors(status)
  
  return {
    backgroundColor: colors.primary,
    borderColor: colors.border,
    textColor: status === DUE_DATE_STATUS.OVERDUE ? '#ffffff' : '#ffffff',
    className: `due-date-${status}`
  }
}

/**
 * CSS animations for pulsing overdue items
 */
export const getDueDateAnimations = () => {
  return `
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.7);
      }
      70% {
        box-shadow: 0 0 0 4px rgba(211, 47, 47, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(211, 47, 47, 0);
      }
    }
    
    .due-date-overdue {
      animation: pulse 2s infinite;
    }
    
    .due-date-indicator {
      position: relative;
      overflow: visible;
    }
    
    .due-date-indicator::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border-radius: inherit;
      z-index: -1;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .due-date-indicator.overdue::before {
      background: linear-gradient(45deg, #d32f2f, #b71c1c);
      opacity: 0.1;
    }
    
    .due-date-indicator.due-soon::before {
      background: linear-gradient(45deg, #f57c00, #ef6c00);
      opacity: 0.1;
    }
  `
} 