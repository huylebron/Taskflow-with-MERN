import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'
import { toast } from 'react-toastify'


/** Boards */
// Đã move vào redux
// export const fetchBoardDetailsAPI = async (boardId) => {
//   const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`)
//   // Lưu ý: axios sẽ trả kết quả về qua property của nó là data
//   return response.data
// }

export const fetchBoardDetailsAPI = async (boardId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}`)
  return response.data
}

export const updateBoardDetailsAPI = async (boardId, updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/boards/${boardId}`, updateData)
  return response.data
}

// Mock API function để cập nhật background của board
export const updateBoardBackgroundAPI = async (boardId, backgroundData) => {
  // Nếu có file (backgroundData.backgroundUpload là File object), dùng FormData
  if (backgroundData.backgroundUpload instanceof File) {
    const formData = new FormData()
    Object.entries(backgroundData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value)
      }
    })
    const response = await authorizedAxiosInstance.patch(`${API_ROOT}/v1/boards/${boardId}/background`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  } else {
    // Nếu không có file, gửi JSON bình thường
    const response = await authorizedAxiosInstance.patch(`${API_ROOT}/v1/boards/${boardId}/background`, backgroundData)
    return response.data
  }
}

export const moveCardToDifferentColumnAPI = async (updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/boards/supports/moving_card`, updateData)
  return response.data
}

/** Columns */
export const createNewColumnAPI = async (newColumnData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/columns`, newColumnData)
  return response.data
}

export const updateColumnDetailsAPI = async (columnId, updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/columns/${columnId}`, updateData)
  return response.data
}

export const deleteColumnDetailsAPI = async (columnId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/columns/${columnId}`)
  return response.data
}

/** Cards */
export const createNewCardAPI = async (newCardData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/cards`, newCardData)
  return response.data
}

/** Users */
export const registerUserAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/register`, data)
  toast.success('Tạo tài khoản thành công! Vui lòng kiểm tra và xác thực tài khoản trước khi đăng nhập!', { theme: 'colored' })
  return response.data
}

export const verifyUserAPI = async (data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/verify`, data)
  toast.success('Xác thực tài khoản thành công! Bây giờ bạn có thể đăng nhập để sử dụng dịch vụ! Chúc bạn một ngày tốt lành!', { theme: 'colored' })
  return response.data
}

export const refreshTokenAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/users/refresh_token`)
  return response.data
}

export const forgotPasswordAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/forgot-password`, data)
  return response.data
}

export const resetPasswordAPI = async (data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/reset-password/${data.token}`, {
    newPassword: data.newPassword
  })
  return response.data
}

export const fetchBoardsAPI = async (searchPath) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards${searchPath}`)
  return response.data
}

export const createNewBoardAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/boards`, data)
  toast.success('Tạo board thành công')
  return response.data
}

export const updateCardDetailsAPI = async (cardId, updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/cards/${cardId}`, updateData)
  return response.data
}

/**
 * Delete a card
 */
export const deleteCardAPI = async (cardId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/cards/${cardId}`)
  toast.success('Xóa thẻ thành công!', { position: 'bottom-right' })
  return response.data
}

/** Calendar APIs - Due Date Management */
export const fetchCardsWithDueDateAPI = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString()
  const url = queryParams ? `${API_ROOT}/v1/cards/calendar?${queryParams}` : `${API_ROOT}/v1/cards/calendar`
  const response = await authorizedAxiosInstance.get(url)
  return response.data
}

export const updateCardDueDateAPI = async (cardId, dueDate) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/cards/${cardId}/due-date`, { dueDate })
  return response.data
}

export const inviteUserToBoardAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/invitations/board`, data)
  toast.success('Mời người dùng vào board thành công!')
  return response.data
}

export const deleteBoardAPI = async (boardId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/boards/${boardId}`)
  toast.success('Xóa board thành công!')
  return response.data
}

/** Label APIs for Board */
export const addLabelToBoardAPI = async (boardId, label) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/boards/${boardId}/labels`, label)
  return response.data
}

export const updateLabelInBoardAPI = async (boardId, labelId, updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/boards/${boardId}/labels/${labelId}`, updateData)
  return response.data
}

export const deleteLabelFromBoardAPI = async (boardId, labelId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/boards/${boardId}/labels/${labelId}`)
  return response.data
}

/** Label APIs for Card */
export const updateCardLabelsAPI = async (cardId, labelIds) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/cards/${cardId}/labels`, { labelIds })
  return response.data
}

// Checklist APIs for Card
export const createChecklistAPI = async (cardId, title) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/cards/${cardId}/checklists`, { title })
  return response.data
}

export const addCheckListItemAPI = async (cardId, checklistId, title) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/cards/${cardId}/checklists/${checklistId}/items`, { title })
  return response.data
}

export const updateChecklistItemStatusAPI = async (cardId, checklistId, itemId, isCompleted) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/cards/${cardId}/checklists/${checklistId}/items/${itemId}/status`, { isCompleted })
  return response.data
}

/**
 * Delete checklist from card
 * @param {string} cardId - Card ID
 * @param {string} checklistId - Checklist ID to delete
 * @returns {Promise<Object>} - Updated card data
 */
export const deleteChecklistAPI = async (cardId, checklistId) => {
  try {
    // Validate input parameters
    if (!cardId || !checklistId) {
      throw new Error('Card ID and Checklist ID are required')
    }

    const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/cards/${cardId}/checklists/${checklistId}`)

    // Remove success toast - handled by component layer for better UX
    // toast.success('Checklist deleted successfully!') - REMOVED to prevent duplicate toasts

    return response.data
  } catch (error) {
    // Enhanced error handling
    console.error('❌ Delete checklist API error:', error)

    // Extract meaningful error message
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete checklist'

    // Error toast notification
    toast.error(errorMessage, {
      position: 'bottom-right',
      autoClose: 5000
    })

    // Re-throw error for component handling
    throw error
  }
}

/**
 * Delete checklist item from checklist
 * @param {string} cardId - Card ID
 * @param {string} checklistId - Checklist ID
 * @param {string} itemId - Item ID to delete
 * @returns {Promise<Object>} - Updated card data
 */
export const deleteChecklistItemAPI = async (cardId, checklistId, itemId) => {
  try {
    // Validate input parameters
    if (!cardId || !checklistId || !itemId) {
      throw new Error('Card ID, Checklist ID, and Item ID are required')
    }

    const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/cards/${cardId}/checklists/${checklistId}/items/${itemId}`)

    // Remove success toast - handled by component layer for better UX
    // toast.success('Checklist item deleted successfully!') - REMOVED to prevent duplicate toasts

    return response.data
  } catch (error) {
    // Enhanced error handling
    console.error('❌ Delete checklist item API error:', error)

    // Extract meaningful error message
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete checklist item'

    // Error toast notification
    toast.error(errorMessage, {
      position: 'bottom-right',
      autoClose: 5000
    })

    // Re-throw error for component handling
    throw error
  }
}

export const updateCardCompletedStatusAPI = async (cardId, isCardCompleted) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/cards/${cardId}/completed-status`, { isCardCompleted })
  return response.data
}