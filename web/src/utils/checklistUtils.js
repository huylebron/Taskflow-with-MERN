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
    items: checklist.items.filter(item => (item._id || item.id) !== itemId)
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
      (item._id || item.id) === itemId ? { ...item, completed: !item.completed } : item
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
  return checklists.filter(checklist => (checklist._id || checklist.id) !== checklistId)
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
    (checklist._id || checklist.id) === checklistId ? updatedChecklist : checklist
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
  // Fix: Use both 'isCompleted' and 'completed' for backward compatibility
  const completed = checklist.items.filter(item => item.isCompleted || item.completed).length
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
      // Fix: Use both 'isCompleted' and 'completed' for backward compatibility
      completedItems += checklist.items.filter(item => item.isCompleted || item.completed).length
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

// ============= NEW HELPER FUNCTIONS FOR DELETE OPERATIONS =============

/**
 * Validate checklist ID exists in checklists array
 * @param {Array} checklists - Array of checklists
 * @param {string} checklistId - Checklist ID to validate
 * @returns {boolean} - True if checklist exists
 */
export const validateChecklistExists = (checklists, checklistId) => {
  if (!checklists || !Array.isArray(checklists) || !checklistId) {
    return false
  }
  return checklists.some(checklist => (checklist._id || checklist.id) === checklistId)
}

/**
 * Validate checklist item exists in specific checklist
 * @param {Array} checklists - Array of checklists
 * @param {string} checklistId - Checklist ID
 * @param {string} itemId - Item ID to validate
 * @returns {boolean} - True if item exists in checklist
 */
export const validateChecklistItemExists = (checklists, checklistId, itemId) => {
  if (!checklists || !Array.isArray(checklists) || !checklistId || !itemId) {
    return false
  }

  const checklist = checklists.find(cl => (cl._id || cl.id) === checklistId)
  if (!checklist || !checklist.items || !Array.isArray(checklist.items)) {
    return false
  }

  return checklist.items.some(item => (item._id || item.id) === itemId)
}

/**
 * Get checklist by ID for preview before deletion
 * @param {Array} checklists - Array of checklists
 * @param {string} checklistId - Checklist ID
 * @returns {Object|null} - Checklist object or null if not found
 */
export const getChecklistById = (checklists, checklistId) => {
  if (!checklists || !Array.isArray(checklists) || !checklistId) {
    return null
  }
  return checklists.find(checklist => (checklist._id || checklist.id) === checklistId) || null
}

/**
 * Get checklist item by IDs for preview before deletion
 * @param {Array} checklists - Array of checklists
 * @param {string} checklistId - Checklist ID
 * @param {string} itemId - Item ID
 * @returns {Object|null} - Item object or null if not found
 */
export const getChecklistItemById = (checklists, checklistId, itemId) => {
  if (!checklists || !Array.isArray(checklists) || !checklistId || !itemId) {
    return null
  }

  const checklist = checklists.find(cl => (cl._id || cl.id) === checklistId)
  if (!checklist || !checklist.items || !Array.isArray(checklist.items)) {
    return null
  }

  return checklist.items.find(item => (item._id || item.id) === itemId) || null
}

/**
 * Create optimistic update state for checklist deletion
 * @param {Array} checklists - Current checklists array
 * @param {string} checklistId - Checklist ID to remove
 * @returns {Object} - Optimistic state with removed checklist
 */
export const createOptimisticDeleteChecklistState = (checklists, checklistId) => {
  const removedChecklist = getChecklistById(checklists, checklistId)
  const updatedChecklists = removeChecklistFromList(checklists, checklistId)

  return {
    checklists: updatedChecklists,
    removedChecklist,
    canUndo: !!removedChecklist
  }
}

/**
 * Create optimistic update state for checklist item deletion
 * @param {Array} checklists - Current checklists array
 * @param {string} checklistId - Checklist ID
 * @param {string} itemId - Item ID to remove
 * @returns {Object} - Optimistic state with removed item
 */
export const createOptimisticDeleteItemState = (checklists, checklistId, itemId) => {
  const removedItem = getChecklistItemById(checklists, checklistId, itemId)
  const updatedChecklists = checklists.map(checklist => {
    if ((checklist._id || checklist.id) === checklistId) {
      return removeItemFromChecklist(checklist, itemId)
    }
    return checklist
  })

  return {
    checklists: updatedChecklists,
    removedItem,
    checklistId,
    canUndo: !!removedItem
  }
}

/**
 * Restore checklist from optimistic state (for undo functionality)
 * @param {Array} checklists - Current checklists array
 * @param {Object} removedChecklist - Previously removed checklist
 * @returns {Array} - Checklists with restored checklist
 */
export const restoreChecklistFromOptimistic = (checklists, removedChecklist) => {
  if (!removedChecklist) return checklists
  return addChecklistToList(checklists, removedChecklist)
}

/**
 * Restore checklist item from optimistic state (for undo functionality)
 * @param {Array} checklists - Current checklists array
 * @param {string} checklistId - Checklist ID
 * @param {Object} removedItem - Previously removed item
 * @returns {Array} - Checklists with restored item
 */
export const restoreChecklistItemFromOptimistic = (checklists, checklistId, removedItem) => {
  if (!removedItem) return checklists

  return checklists.map(checklist => {
    if ((checklist._id || checklist.id) === checklistId) {
      return addItemToChecklist(checklist, removedItem.text)
    }
    return checklist
  })
}

/**
 * Generate delete confirmation message for checklist
 * @param {Object} checklist - Checklist to be deleted
 * @returns {string} - Confirmation message
 */
export const generateDeleteChecklistMessage = (checklist) => {
  if (!checklist) return 'Are you sure you want to delete this checklist?'

  const itemCount = checklist.items ? checklist.items.length : 0
  const completedCount = checklist.items ?
    checklist.items.filter(item => item.isCompleted || item.completed).length : 0

  if (itemCount === 0) {
    return `Are you sure you want to delete the checklist "${checklist.title}"?`
  }

  return `Are you sure you want to delete the checklist "${checklist.title}" with ${itemCount} items (${completedCount} completed)? This action cannot be undone.`
}

/**
 * Generate delete confirmation message for checklist item
 * @param {Object} item - Item to be deleted
 * @param {Object} checklist - Parent checklist (optional for context)
 * @returns {string} - Confirmation message
 */
export const generateDeleteItemMessage = (item, checklist = null) => {
  if (!item) return 'Are you sure you want to delete this item?'
  
  const itemText = item.text || item.title || 'this item'
  const status = (item.isCompleted || item.completed) ? '(completed)' : '(pending)'
  
  // Note: checklist parameter reserved for future use (e.g., showing parent context)
  return `Are you sure you want to delete "${itemText}" ${status}?`
}

/**
 * Check if checklist has important content before deletion
 * @param {Object} checklist - Checklist to check
 * @returns {boolean} - True if checklist has important content
 */
export const checklistHasImportantContent = (checklist) => {
  if (!checklist || !checklist.items) return false

  // Consider it important if it has many items or many completed items
  const itemCount = checklist.items.length
  const completedCount = checklist.items.filter(item => item.isCompleted || item.completed).length

  return itemCount >= 3 || completedCount >= 2
}