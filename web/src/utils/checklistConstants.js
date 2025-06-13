// Cấu trúc của một checklist
export const CHECKLIST_STRUCTURE = {
  id: '', // string - unique identifier
  title: '', // string - tên của checklist
  items: [] // array - danh sách các items trong checklist
}

// Cấu trúc của một checklist item
export const CHECKLIST_ITEM_STRUCTURE = {
  id: '', // string - unique identifier
  text: '', // string - nội dung của item
  completed: false, // boolean - trạng thái hoàn thành
  createdAt: '' // string - thời gian tạo
}

// Mock data mẫu cho testing
export const MOCK_CHECKLISTS = [
  {
    id: 'checklist-1',
    title: 'Các việc cần làm',
    items: [
      {
        id: 'item-1-1',
        text: 'Nghiên cứu yêu cầu',
        completed: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'item-1-2',
        text: 'Thiết kế giao diện',
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'item-1-3',
        text: 'Viết code',
        completed: false,
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 'checklist-2',
    title: 'Công việc triển khai',
    items: [
      {
        id: 'item-2-1',
        text: 'Test chức năng',
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'item-2-2',
        text: 'Fix bugs',
        completed: false,
        createdAt: new Date().toISOString()
      }
    ]
  }
]

// Giới hạn số lượng
export const CHECKLIST_LIMITS = {
  MAX_CHECKLISTS_PER_CARD: 8,
  MAX_ITEMS_PER_CHECKLIST: 50,
  MAX_TITLE_LENGTH: 100,
  MAX_ITEM_TEXT_LENGTH: 500
}

// Colors cho progress bar
export const CHECKLIST_COLORS = {
  NOT_STARTED: '#dfe1e6',
  IN_PROGRESS: '#0079bf',
  COMPLETED: '#61bd4f'
}

// Constants for delete operations
export const DELETE_OPERATIONS = {
  CONFIRMATION_DELAY: 2000, // 2 seconds delay for undo
  TOAST_DURATION: 5000, // 5 seconds for toast messages
  LOADING_TIMEOUT: 10000, // 10 seconds timeout for API calls
  RETRY_ATTEMPTS: 3 // Maximum retry attempts for failed operations
}

// Error messages for delete operations
export const DELETE_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  PERMISSION_DENIED: 'You do not have permission to delete this item.',
  ITEM_NOT_FOUND: 'The item you are trying to delete no longer exists.',
  CHECKLIST_NOT_FOUND: 'The checklist you are trying to delete no longer exists.',
  CARD_NOT_FOUND: 'The card containing this checklist was not found.',
  VALIDATION_ERROR: 'Invalid data provided. Please refresh and try again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
}

// Success messages for delete operations
export const DELETE_SUCCESS_MESSAGES = {
  CHECKLIST_DELETED: 'Checklist deleted successfully!',
  ITEM_DELETED: 'Checklist item deleted successfully!',
  UNDO_AVAILABLE: 'Item deleted. Click here to undo.',
  UNDO_SUCCESSFUL: 'Action undone successfully!'
}

// UI States for delete operations
export const DELETE_UI_STATES = {
  IDLE: 'idle',
  CONFIRMING: 'confirming',
  DELETING: 'deleting',
  SUCCESS: 'success',
  ERROR: 'error',
  UNDO_AVAILABLE: 'undo_available'
}

// Validation rules for delete operations
export const DELETE_VALIDATION = {
  REQUIRED_PARAMS: {
    DELETE_CHECKLIST: ['cardId', 'checklistId'],
    DELETE_ITEM: ['cardId', 'checklistId', 'itemId']
  },
  ID_PATTERN: /^[a-zA-Z0-9\-_]+$/, // Simple pattern for ID validation
  MIN_ID_LENGTH: 1,
  MAX_ID_LENGTH: 100
}