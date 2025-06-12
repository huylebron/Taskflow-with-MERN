import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'
import { mapOrder } from '~/utils/sorts'
import { isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatters'
import { DEFAULT_BACKGROUND } from '~/utils/backgroundConstants'
import { PREDEFINED_LABELS } from '~/utils/labelConstants'

// Khởi tạo giá trị State của một cái Slice trong redux
const initialState = {
  currentActiveBoard: null
}

// Các hành động gọi api (bất đồng bộ) và cập nhật dữ liệu vào Redux, dùng Middleware createAsyncThunk đi kèm với extraReducers
// https://redux-toolkit.js.org/api/createAsyncThunk
export const fetchBoardDetailsAPI = createAsyncThunk(
  'activeBoard/fetchBoardDetailsAPI',
  async (boardId) => {
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}`)
    // Lưu ý: axios sẽ trả kết quả về qua property của nó là data
    return response.data
  }
)

export const deleteBoardAPI = createAsyncThunk(
  'activeBoard/deleteBoardAPI',
  async (boardId) => {
    const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/boards/${boardId}`)
    return { boardId, ...response.data }
  }
)

// Khởi tạo một cái Slice trong kho lưu trữ - Redux Store
export const activeBoardSlice = createSlice({
  name: 'activeBoard',
  initialState,
  // Reducers: Nơi xử lý dữ liệu đồng bộ
  reducers: {
    // Lưu ý luôn là ở đây luôn luôn cần cặp ngoặc nhọn cho function trong reducer cho dù code bên trong chỉ có 1 dòng, đây là rule của Redux
    // https://redux-toolkit.js.org/usage/immer-reducers#mutating-and-returning-state
    updateCurrentActiveBoard: (state, action) => {
      // action.payload là chuẩn đặt tên nhận dữ liệu vào reducer, ở đây chúng ta gán nó ra một biến có nghĩa hơn
      const board = action.payload

      // Xử lý dữ liệu nếu cần thiết...
      // ...

      // Update lại dữ liệu của cái currentActiveBoard
      state.currentActiveBoard = board
    },
    updateCardInBoard: (state, action) => {
      // Update nested data
      // https://redux-toolkit.js.org/usage/immer-reducers#updating-nested-data
      const incomingCard = action.payload

      // Tìm dần từ board > column > card
      const column = state.currentActiveBoard.columns.find(i => i._id === incomingCard.columnId)
      if (column) {
        const card = column.cards.find(i => i._id === incomingCard._id)
        if (card) {
          // card.title = incomingCard.title
          // card['title'] = incomingCard['title']
          /**
           * Giải thích đoạn dưới, các bạn mới lần đầu sẽ dễ bị lú :D
           * Đơn giản là dùng Object.keys để lấy toàn bộ các properties (keys) của incomingCard về một Array rồi forEach nó ra.
           * Sau đó tùy vào trường hợp cần thì kiểm tra thêm còn không thì cập nhật ngược lại giá trị vào card luôn như bên dưới.
          */
          Object.keys(incomingCard).forEach(key => {
            card[key] = incomingCard[key]
          })
        }
      }
    },
    updateColumnInBoard: (state, action) => {
      const incomingColumn = action.payload
      const column = state.currentActiveBoard.columns.find(i => i._id === incomingColumn._id)
      if (column) {
        Object.keys(incomingColumn).forEach(key => {
          column[key] = incomingColumn[key]
        })
      }
    },
    updateBoardBackground: (state, action) => {
      // Nhận dữ liệu background từ action.payload
      const backgroundData = action.payload

      // Đảm bảo currentActiveBoard tồn tại
      if (!state.currentActiveBoard) return

      // Cập nhật background của board hiện tại
      state.currentActiveBoard.background = backgroundData
    },
    // Action để thêm label mới vào board
    addLabelToBoard: (state, action) => {
      const newLabel = action.payload
      
      // Đảm bảo currentActiveBoard và labels tồn tại
      if (!state.currentActiveBoard) return
      if (!state.currentActiveBoard.labels) {
        state.currentActiveBoard.labels = []
      }
      
      // Thêm label mới vào đầu mảng
      state.currentActiveBoard.labels.unshift(newLabel)
    },
    // Action để xóa label khỏi board
    deleteLabelFromBoard: (state, action) => {
      const labelId = action.payload
      
      // Đảm bảo currentActiveBoard và labels tồn tại
      if (!state.currentActiveBoard || !state.currentActiveBoard.labels) return
      
      // Xóa label khỏi danh sách labels của board
      state.currentActiveBoard.labels = state.currentActiveBoard.labels.filter(
        label => label.id !== labelId
      )
      
      // Xóa label khỏi tất cả các card
      state.currentActiveBoard.columns.forEach(column => {
        column.cards.forEach(card => {
          if (card.labelIds && card.labelIds.includes(labelId)) {
            card.labelIds = card.labelIds.filter(id => id !== labelId)
          }
        })
      })
    },
    // Action để cập nhật card khi thêm/xóa label
    updateCardLabels: (state, action) => {
      const { cardId, labelIds } = action.payload
      
      // Tìm card trong board
      for (const column of state.currentActiveBoard.columns) {
        const card = column.cards.find(c => c._id === cardId)
        if (card) {
          // Cập nhật labels cho card
          card.labelIds = labelIds
          break
        }
      }
    },
    // Action to specifically handle due date updates for better calendar synchronization
    updateCardDueDate: (state, action) => {
      const { cardId, dueDate } = action.payload
      
      // Đảm bảo currentActiveBoard tồn tại
      if (!state.currentActiveBoard) return

      // Tìm card trong board và cập nhật due date
      for (const column of state.currentActiveBoard.columns) {
        const card = column.cards.find(c => c._id === cardId)
        if (card) {
          // Cập nhật due date và timestamp cập nhật
          card.dueDate = dueDate
          card.updatedAt = Date.now()
          
          console.log(`📅 Redux: Updated due date for card "${card.title}" to ${dueDate}`)
          break
        }
      }
    },
    // Action to sync calendar changes back to board view
    syncCalendarToBoard: (state, action) => {
      const { cardUpdates } = action.payload
      
      // Đảm bảo currentActiveBoard tồn tại
      if (!state.currentActiveBoard || !Array.isArray(cardUpdates)) return

      // Cập nhật nhiều cards cùng lúc (useful for calendar batch operations)
      cardUpdates.forEach(({ cardId, updates }) => {
        for (const column of state.currentActiveBoard.columns) {
          const card = column.cards.find(c => c._id === cardId)
          if (card) {
            Object.keys(updates).forEach(key => {
              card[key] = updates[key]
            })
            card.updatedAt = Date.now()
            break
          }
        }
      })
    },
    /**
     * Remove a card from the board state optimistically
     * @param {Object} action.payload - { cardId, columnId }
     */
    removeCardFromBoard: (state, action) => {
      const { cardId, columnId } = action.payload
      if (!state.currentActiveBoard) return
      const column = state.currentActiveBoard.columns.find(c => c._id === columnId)
      if (!column) return
      // Remove card from cards array
      column.cards = column.cards.filter(c => c._id !== cardId)
      // Remove cardId from cardOrderIds
      column.cardOrderIds = column.cardOrderIds.filter(id => id !== cardId)
    }
  },
  // ExtraReducers: Nơi xử lý dữ liệu bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(fetchBoardDetailsAPI.fulfilled, (state, action) => {
      // action.payload ở dây chính là cái response.data trả về ở trên
      let board = action.payload

      // Thành viên trong cái board sẽ là gộp lại của 2 mảng owners và members
      board.FE_allUsers = board.owners.concat(board.members)

      // Sắp xếp thứ tự các column luôn ở đây trước khi đưa dữ liệu xuống bên dưới các component con (video 71 đã giải thích lý do ở phần Fix bug quan trọng)
      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id')

      // Đảm bảo board có background, nếu không thì set default
      // Map background từ backend về FE
      function mapApiBackgroundToFE(board) {
        if (!board) return DEFAULT_BACKGROUND
        if (board.backgroundType === 'color') return { type: 'color', value: board.backgroundColor }
        if (board.backgroundType === 'image') return { type: 'image', value: board.backgroundImage }
        if (board.backgroundType === 'url') return { type: 'url', value: board.backgroundUrl }
        if (board.backgroundType === 'upload') return { type: 'upload', value: board.backgroundUpload }
        return DEFAULT_BACKGROUND
      }
      board.background = mapApiBackgroundToFE(board)

      // Đảm bảo board có trường labels, nếu không thì khởi tạo với mock data
      if (!board.labels) {
        board.labels = PREDEFINED_LABELS
      }

      board.columns.forEach(column => {
        // Khi f5 trang web thì cần xử lý vấn đề kéo thả vào một column rỗng (Nhớ lại video 37.2, code hiện tại là video 69)
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        } else {
          // Sắp xếp thứ tự các cards luôn ở đây trước khi đưa dữ liệu xuống bên dưới các component con (video 71 đã giải thích lý do ở phần Fix bug quan trọng)
          column.cards = mapOrder(column.cards, column.cardOrderIds, '_id')
          
          // Đảm bảo mỗi card có trường labelIds
          column.cards.forEach(card => {
            if (!card.labelIds) {
              card.labelIds = []
            }
          })
        }
      })

      // Update lại dữ liệu của cái currentActiveBoard
      state.currentActiveBoard = board
    })

    // Handle delete board
    builder.addCase(deleteBoardAPI.fulfilled, (state, action) => {
      // Clear the current active board when it's deleted
      state.currentActiveBoard = null
    })
    
    builder.addCase(deleteBoardAPI.rejected, (state, action) => {
      // Handle delete error - keep the current board state
      console.error('Delete board failed:', action.error.message)
    })
  }
})

// Action creators are generated for each case reducer function
// Actions: Là nơi dành cho các components bên dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu thông qua reducer (chạy đồng bộ)
// Để ý ở trên thì không thấy properties actions đâu cả, bởi vì những cái actions này đơn giản là được thằng redux tạo tự động theo tên của reducer nhé.
export const { 
  updateCurrentActiveBoard, 
  updateCardInBoard, 
  updateColumnInBoard,
  updateBoardBackground,
  addLabelToBoard,
  deleteLabelFromBoard,
  updateCardLabels,
  updateCardDueDate,
  syncCalendarToBoard,
  removeCardFromBoard
} = activeBoardSlice.actions

// Selectors: Là nơi dành cho các components bên dưới gọi bằng hook useSelector() để lấy dữ liệu từ trong kho redux store ra sử dụng
export const selectCurrentActiveBoard = (state) => {
  return state.activeBoard.currentActiveBoard
}

// Selector để lấy background của board hiện tại
export const selectBoardBackground = (state) => {
  return state.activeBoard.currentActiveBoard?.background || DEFAULT_BACKGROUND
}

// Selector để lấy labels của board hiện tại
export const selectBoardLabels = (state) => {
  return state.activeBoard.currentActiveBoard?.labels || []
}

// Calendar-specific selectors for better state management
export const selectCardsWithDueDate = (state) => {
  const board = state.activeBoard.currentActiveBoard
  if (!board?.columns) return []
  
  const cardsWithDueDate = []
  
  board.columns.forEach(column => {
    if (column.cards) {
      column.cards.forEach(card => {
        // Skip placeholder cards and cards without due date
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

// Selector để lấy cards với due date trong khoảng thời gian nhất định
export const selectCardsWithDueDateInRange = (startDate, endDate) => (state) => {
  const cardsWithDueDate = selectCardsWithDueDate(state)
  
  if (!startDate && !endDate) return cardsWithDueDate
  
  return cardsWithDueDate.filter(card => {
    const cardDueDate = new Date(card.dueDate)
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null
    
    if (start && end) {
      return cardDueDate >= start && cardDueDate <= end
    } else if (start) {
      return cardDueDate >= start
    } else if (end) {
      return cardDueDate <= end
    }
    
    return true
  })
}

// Selector để lấy thống kê due date cho dashboard
export const selectDueDateStats = (state) => {
  const cardsWithDueDate = selectCardsWithDueDate(state)
  const now = new Date()
  
  const stats = {
    total: cardsWithDueDate.length,
    overdue: 0,
    dueSoon: 0, // within 24 hours
    upcoming: 0 // within 7 days
  }
  
  cardsWithDueDate.forEach(card => {
    const dueDate = new Date(card.dueDate)
    const diffInHours = (dueDate - now) / (1000 * 60 * 60)
    
    if (diffInHours < 0) {
      stats.overdue++
    } else if (diffInHours <= 24) {
      stats.dueSoon++
    } else if (diffInHours <= 168) { // 7 days
      stats.upcoming++
    }
  })
  
  return stats
}

// Selector để tìm card theo ID trong board hiện tại
export const selectCardById = (cardId) => (state) => {
  const board = state.activeBoard.currentActiveBoard
  if (!board?.columns) return null
  
  for (const column of board.columns) {
    if (column.cards) {
      const card = column.cards.find(c => c._id === cardId)
      if (card) {
        return {
          ...card,
          columnTitle: column.title,
          columnId: column._id
        }
      }
    }
  }
  
  return null
}

// Cái file này tên là activeBoardSlice NHƯNG chúng ta sẽ export một thứ tên là Reducer, mọi người lưu ý :D
// export default activeBoardSlice.reducer
export const activeBoardReducer = activeBoardSlice.reducer
