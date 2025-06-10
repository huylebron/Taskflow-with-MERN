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
  // Simulate random network errors (1 in 10 calls)
  const shouldFail = Math.random() < 0.1;
  const slowNetwork = Math.random() < 0.2;

  // Giả lập delay để tạo cảm giác gọi API thực tế
  // Thêm thời gian delay ngẫu nhiên để giả lập mạng chậm
  const networkDelay = slowNetwork ? 3000 : 1500;
  await new Promise(resolve => setTimeout(resolve, networkDelay))

  // Giả lập lỗi network
  if (shouldFail) {
    const errors = [
      { code: 'NETWORK_ERROR', message: 'Network connection error' },
      { code: 'SERVER_ERROR', message: 'Server is temporarily unavailable' },
      { code: 'TIMEOUT', message: 'Request timed out' }
    ];
    const randomError = errors[Math.floor(Math.random() * errors.length)];

    const mockErrorResponse = {
      success: false,
      code: randomError.code,
      message: randomError.message
    };

    throw mockErrorResponse;
  }

  try {
    // Validate data before "sending" to server
    if (!backgroundData || !backgroundData.type) {
      throw new Error('Invalid background data');
    }

    // Thực tế sẽ gọi API thực để cập nhật, ở đây chỉ mock và return success
    // const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/boards/${boardId}/background`, { background: backgroundData })

    // Giả lập response thành công
    const mockSuccessResponse = {
      success: true,
      message: 'Board background updated successfully',
      board: {
        _id: boardId,
        background: backgroundData,
        updatedAt: new Date().toISOString()
      }
    }

    return mockSuccessResponse
  } catch (error) {
    // Mặc dù interceptor đã xử lý lỗi, vẫn cần xử lý để giả lập API call
    const mockErrorResponse = {
      success: false,
      code: 'DATA_ERROR',
      message: error.message || 'Failed to update board background'
    }

    throw mockErrorResponse
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
  toast.success('Account created successfully! Please check and verify your account before logging in!', { theme: 'colored' })
  return response.data
}

export const verifyUserAPI = async (data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/verify`, data)
  toast.success('Account verified successfully! Now you can login to enjoy our services! Have a good day!', { theme: 'colored' })
  return response.data
}

export const refreshTokenAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/users/refresh_token`)
  return response.data
}

export const fetchBoardsAPI = async (searchPath) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards${searchPath}`)
  return response.data
}

export const createNewBoardAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/boards`, data)
  toast.success('Board created successfully')
  return response.data
}

export const updateCardDetailsAPI = async (cardId, updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/cards/${cardId}`, updateData)
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
  toast.success('User invited to board successfully!')
  return response.data
}

export const deleteBoardAPI = async (boardId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/boards/${boardId}`)
  toast.success('Board deleted successfully!')
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
