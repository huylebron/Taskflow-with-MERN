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
      if (!board.background) {
        board.background = DEFAULT_BACKGROUND
      }

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
  updateCardLabels
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

// Cái file này tên là activeBoardSlice NHƯNG chúng ta sẽ export một thứ tên là Reducer, mọi người lưu ý :D
// export default activeBoardSlice.reducer
export const activeBoardReducer = activeBoardSlice.reducer
