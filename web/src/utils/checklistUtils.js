import { v4 as uuidv4 } from 'uuid'
import { CHECKLIST_COLORS } from './checklistConstants'

/**
 * Tạo một checklist mới với id và title
 * @param {string} title Tiêu đề của checklist
 * @returns {Object} Checklist object mới
 */
export const createNewChecklist = (title) => {
  return {
    id: 'checklist-' + uuidv4(),
    title: title.trim(),
    items: []
  }
}

/**
 * Thêm một item mới vào checklist
 * @param {Object} checklist Checklist object
 * @param {string} text Nội dung của item
 * @returns {Object} Checklist object đã được cập nhật
 */
export const addItemToChecklist = (checklist, text) => {
  const newItem = {
    id: 'item-' + uuidv4(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  }

  return {
    ...checklist,
    items: [...checklist.items, newItem]
  }
}

/**
 * Xóa một item khỏi checklist
 * @param {Object} checklist Checklist object
 * @param {string} itemId ID của item cần xóa
 * @returns {Object} Checklist object đã được cập nhật
 */
export const removeItemFromChecklist = (checklist, itemId) => {
  return {
    ...checklist,
    items: checklist.items.filter(item => item.id !== itemId)
  }
}

/**
 * Toggle trạng thái completed của một item
 * @param {Object} checklist Checklist object
 * @param {string} itemId ID của item cần toggle
 * @returns {Object} Checklist object đã được cập nhật
 */
export const toggleItemInChecklist = (checklist, itemId) => {
  return {
    ...checklist,
    items: checklist.items.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    )
  }
}

/**
 * Cập nhật tiêu đề của checklist
 * @param {Object} checklist Checklist object
 * @param {string} newTitle Tiêu đề mới
 * @returns {Object} Checklist object đã được cập nhật
 */
export const updateChecklistTitle = (checklist, newTitle) => {
  return {
    ...checklist,
    title: newTitle.trim()
  }
}

/**
 * Thêm một checklist mới vào danh sách checklists
 * @param {Array} checklists Mảng các checklists
 * @param {Object} newChecklist Checklist mới
 * @returns {Array} Mảng checklists đã được cập nhật
 */
export const addChecklistToList = (checklists, newChecklist) => {
  return [...checklists, newChecklist]
}

/**
 * Xóa một checklist khỏi danh sách checklists
 * @param {Array} checklists Mảng các checklists
 * @param {string} checklistId ID của checklist cần xóa
 * @returns {Array} Mảng checklists đã được cập nhật
 */
export const removeChecklistFromList = (checklists, checklistId) => {
  return checklists.filter(checklist => checklist.id !== checklistId)
}

/**
 * Cập nhật một checklist trong danh sách checklists
 * @param {Array} checklists Mảng các checklists
 * @param {string} checklistId ID của checklist cần cập nhật
 * @param {Object} updatedChecklist Dữ liệu mới của checklist
 * @returns {Array} Mảng checklists đã được cập nhật
 */
export const updateChecklistInList = (checklists, checklistId, updatedChecklist) => {
  return checklists.map(checklist => 
    checklist.id === checklistId ? updatedChecklist : checklist
  )
}

/**
 * Tính toán tiến độ của một checklist
 * @param {Object} checklist Checklist object
 * @returns {Object} Progress object với các thuộc tính: completed, total, percentage
 */
export const calculateChecklistProgress = (checklist) => {
  if (!checklist.items || checklist.items.length === 0) {
    return { completed: 0, total: 0, percentage: 0 }
  }
  
  const total = checklist.items.length
  const completed = checklist.items.filter(item => item.completed).length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  
  return { completed, total, percentage }
}

/**
 * Tính toán tiến độ tổng hợp của tất cả các checklists
 * @param {Array} checklists Mảng các checklists
 * @returns {Object} Progress object với các thuộc tính: completed, total, percentage
 */
export const calculateTotalProgress = (checklists) => {
  if (!checklists || checklists.length === 0) {
    return { completed: 0, total: 0, percentage: 0 }
  }
  
  let totalItems = 0
  let completedItems = 0
  
  checklists.forEach(checklist => {
    if (checklist.items && checklist.items.length > 0) {
      totalItems += checklist.items.length
      completedItems += checklist.items.filter(item => item.completed).length
    }
  })
  
  const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  
  return { completed: completedItems, total: totalItems, percentage }
}

/**
 * Xác định màu cho progress bar dựa vào phần trăm hoàn thành
 * @param {number} percentage Phần trăm hoàn thành
 * @returns {string} Mã màu
 */
export const getProgressColor = (percentage) => {
  if (percentage === 0) return CHECKLIST_COLORS.NOT_STARTED
  if (percentage === 100) return CHECKLIST_COLORS.COMPLETED
  return CHECKLIST_COLORS.IN_PROGRESS
}

/**
 * Kiểm tra xem có nên hiển thị progress checklist trên card hay không
 * @param {Array} checklists Mảng các checklists
 * @returns {boolean} True nếu có ít nhất 1 item trong tất cả các checklists
 */
export const shouldShowChecklistProgress = (checklists) => {
  if (!checklists || checklists.length === 0) return false
  
  return checklists.some(checklist => 
    checklist.items && checklist.items.length > 0
  )
}

/**
 * Format progress text dạng "X/Y"
 * @param {number} completed Số items đã hoàn thành
 * @param {number} total Tổng số items
 * @returns {string} Progress text
 */
export const formatProgressText = (completed, total) => {
  return `${completed}/${total}`
} 