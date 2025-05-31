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