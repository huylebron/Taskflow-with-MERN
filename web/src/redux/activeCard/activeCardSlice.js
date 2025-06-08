import { createSlice } from '@reduxjs/toolkit'

// Khởi tạo giá trị của một Slice trong redux
const initialState = {
  currentActiveCard: null,
  isShowModalActiveCard: false
}

// Khởi tạo một slice trong kho lưu trữ - redux store
export const activeCardSlice = createSlice({
  name: 'activeCard',
  initialState,
  // Reducers: Nơi xử lý dữ liệu đồng bộ
  reducers: {
    // Lưu ý luôn là ở đây cần cặp ngoặc nhọn cho function trong reducer cho dù code bên trong chỉ có 1 dòng, đây là rule của Redux
    // https://redux-toolkit.js.org/usage/immer-reducers#mutating-and-returning-state
    showModalActiveCard: (state) => {
      state.isShowModalActiveCard = true
    },

    // Clear data và đóng modal ActiveCard
    clearAndHideCurrentActiveCard: (state) => {
      state.currentActiveCard = null
      state.isShowModalActiveCard = false
    },

    updateCurrentActiveCard: (state, action) => {
      const fullCard = action.payload // action.payload là chuẩn đặt tên nhận dữ liệu vào reducer, ở đây chúng ta gán nó ra một biến có nghĩa hơn
      // xử lý dữ liệu nếu cần thiết
      //...
      // Update lại dữ liệu currentActiveCard trong Redux
      state.currentActiveCard = fullCard
    },

    // Action to update specific fields in current active card
    updateActiveCardField: (state, action) => {
      const { fieldName, fieldValue } = action.payload
      
      if (state.currentActiveCard) {
        state.currentActiveCard[fieldName] = fieldValue
        state.currentActiveCard.updatedAt = Date.now()
        
        // Log for debugging
        console.log(`📝 ActiveCard Redux: Updated ${fieldName} to`, fieldValue)
      }
    },

    // Action specifically for due date updates with validation
    updateActiveCardDueDate: (state, action) => {
      const { dueDate } = action.payload
      
      if (state.currentActiveCard) {
        // Store the previous value for potential rollback
        const previousDueDate = state.currentActiveCard.dueDate
        
        state.currentActiveCard.dueDate = dueDate
        state.currentActiveCard.updatedAt = Date.now()
        state.currentActiveCard._previousDueDate = previousDueDate
        
        console.log(`📅 ActiveCard Redux: Updated due date from ${previousDueDate} to ${dueDate}`)
      }
    },

    // Action to rollback due date changes if API call fails
    rollbackActiveCardDueDate: (state) => {
      if (state.currentActiveCard && state.currentActiveCard._previousDueDate !== undefined) {
        const previousDueDate = state.currentActiveCard._previousDueDate
        state.currentActiveCard.dueDate = previousDueDate
        delete state.currentActiveCard._previousDueDate
        
        console.log('🔄 ActiveCard Redux: Rolled back due date to', previousDueDate)
      }
    }
  },
  // ExtraReducers: Xử lý dữ liệu bất đồng bộ
  // eslint-disable-next-line no-unused-vars
  extraReducers: (builder) => {}
})

// Action creators are generated for each case reducer function
// Actions: Là nơi dành cho các components bên dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu thông qua reducer (chạy đồng bộ)
// Để ý ở trên thì không thấy properties actions đâu cả, bởi vì những cái actions này đơn giản là được thằng redux tạo tự động theo tên của reducer nhé.
export const {
  clearAndHideCurrentActiveCard,
  updateCurrentActiveCard,
  showModalActiveCard,
  updateActiveCardField,
  updateActiveCardDueDate,
  rollbackActiveCardDueDate
} = activeCardSlice.actions

// Selectors: Là nơi dành cho các components bên dưới gọi bằng hook useSelector() để lấy dữ liệu từ trong kho redux store ra sử dụng
export const selectCurrentActiveCard = (state) => {
  return state.activeCard.currentActiveCard
}

export const selectIsShowModalActiveCard = (state) => {
  return state.activeCard.isShowModalActiveCard
}

// Cái file này tên là activeCardSlice NHƯNG chúng ta sẽ export một thứ tên là Reducer, mọi người lưu ý :D
// export default activeCardSlice.reducer
export const activeCardReducer = activeCardSlice.reducer
