import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

// Khởi tạo giá trị State của Activities Slice trong redux
const initialState = {
  // Board activities data structure
  boardActivities: {
    activities: [],
    currentPage: 1,
    totalPages: 1,
    totalActivities: 0,
    isLoading: false,
    error: null
  },
  // Card activities data structure  
  cardActivities: {
    activities: [],
    currentPage: 1,
    totalPages: 1,
    totalActivities: 0,
    isLoading: false,
    error: null
  },
  // Filter settings
  filters: {
    userFilter: null, // null = all users
    actionFilter: null, // null = all actions
    dateFilter: 'all' // 'all', 'today', 'week', 'month'
  }
}

// Async thunk để fetch board activities (bất đồng bộ)
export const fetchBoardActivitiesAPI = createAsyncThunk(
  'activities/fetchBoardActivities',
  async ({ boardId, page = 1, itemsPerPage = 20 }) => {
    const response = await authorizedAxiosInstance.get(
      `${API_ROOT}/v1/activities/board/${boardId}?page=${page}&itemsPerPage=${itemsPerPage}`
    )
    // Lưu ý: axios sẽ trả kết quả về qua property của nó là data
    return response.data
  }
)

// Async thunk để fetch card activities (bất đồng bộ)
export const fetchCardActivitiesAPI = createAsyncThunk(
  'activities/fetchCardActivities', 
  async ({ cardId, page = 1, itemsPerPage = 20 }) => {
    const response = await authorizedAxiosInstance.get(
      `${API_ROOT}/v1/activities/card/${cardId}?page=${page}&itemsPerPage=${itemsPerPage}`
    )
    return response.data
  }
)

// Khởi tạo Activities Slice trong kho lưu trữ - Redux Store
export const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  // Reducers: Nơi xử lý dữ liệu đồng bộ
  reducers: {
    // Action để thêm activity mới (cho real-time updates)
    addNewActivity: (state, action) => {
      const newActivity = action.payload
      
      // Thêm vào đầu danh sách board activities nếu có
      if (state.boardActivities.activities.length > 0) {
        state.boardActivities.activities.unshift(newActivity)
        state.boardActivities.totalActivities += 1
      }
    },
    
    // Actions để cập nhật filters
    setUserFilter: (state, action) => {
      state.filters.userFilter = action.payload
    },
    
    setActionFilter: (state, action) => {
      state.filters.actionFilter = action.payload
    },
    
    setDateFilter: (state, action) => {
      state.filters.dateFilter = action.payload
    },
    
    // Action để clear tất cả filters
    clearFilters: (state) => {
      state.filters = {
        userFilter: null,
        actionFilter: null,
        dateFilter: 'all'
      }
    },
    
    // Action để clear board activities (khi rời khỏi board)
    clearBoardActivities: (state) => {
      state.boardActivities = {
        activities: [],
        currentPage: 1,
        totalPages: 1,
        totalActivities: 0,
        isLoading: false,
        error: null
      }
    },
    
    // Action để clear card activities (khi đóng card modal)
    clearCardActivities: (state) => {
      state.cardActivities = {
        activities: [],
        currentPage: 1,
        totalPages: 1,
        totalActivities: 0,
        isLoading: false,
        error: null
      }
    }
  },
  // ExtraReducers: Nơi xử lý dữ liệu bất đồng bộ từ createAsyncThunk
  extraReducers: (builder) => {
    // Handle board activities fetch
    builder
      .addCase(fetchBoardActivitiesAPI.pending, (state) => {
        state.boardActivities.isLoading = true
        state.boardActivities.error = null
      })
      .addCase(fetchBoardActivitiesAPI.fulfilled, (state, action) => {
        const { activities, currentPage, totalPages, totalActivities } = action.payload
        
        if (currentPage === 1) {
          // Thay thế activities nếu là trang đầu tiên
          state.boardActivities.activities = activities
        } else {
          // Thêm activities nếu không phải trang đầu (pagination)
          state.boardActivities.activities = [...state.boardActivities.activities, ...activities]
        }
        
        state.boardActivities.currentPage = currentPage
        state.boardActivities.totalPages = totalPages
        state.boardActivities.totalActivities = totalActivities
        state.boardActivities.isLoading = false
      })
      .addCase(fetchBoardActivitiesAPI.rejected, (state, action) => {
        state.boardActivities.isLoading = false
        state.boardActivities.error = action.error.message
      })
    
    // Handle card activities fetch
    builder
      .addCase(fetchCardActivitiesAPI.pending, (state) => {
        state.cardActivities.isLoading = true
        state.cardActivities.error = null
      })
      .addCase(fetchCardActivitiesAPI.fulfilled, (state, action) => {
        const { activities, currentPage, totalPages, totalActivities } = action.payload
        
        if (currentPage === 1) {
          // Thay thế activities nếu là trang đầu tiên
          state.cardActivities.activities = activities
        } else {
          // Thêm activities nếu không phải trang đầu (pagination)
          state.cardActivities.activities = [...state.cardActivities.activities, ...activities]
        }
        
        state.cardActivities.currentPage = currentPage
        state.cardActivities.totalPages = totalPages
        state.cardActivities.totalActivities = totalActivities
        state.cardActivities.isLoading = false
      })
      .addCase(fetchCardActivitiesAPI.rejected, (state, action) => {
        state.cardActivities.isLoading = false
        state.cardActivities.error = action.error.message
      })
  }
})

// Export actions - Để các components bên dưới gọi bằng dispatch()
export const {
  addNewActivity,
  setUserFilter,
  setActionFilter,
  setDateFilter,
  clearFilters,
  clearBoardActivities,
  clearCardActivities
} = activitiesSlice.actions

// Selectors: Để các components bên dưới gọi bằng useSelector()
export const selectBoardActivities = (state) => state.activities.boardActivities
export const selectCardActivities = (state) => state.activities.cardActivities
export const selectActivityFilters = (state) => state.activities.filters

// Filtered activities selector với logic filter phức tạp
export const selectFilteredBoardActivities = (state) => {
  const { activities } = state.activities.boardActivities
  const { userFilter, actionFilter, dateFilter } = state.activities.filters
  
  let filtered = [...activities]
  
  // Apply user filter
  if (userFilter) {
    filtered = filtered.filter(activity => activity.userId === userFilter)
  }
  
  // Apply action filter
  if (actionFilter) {
    filtered = filtered.filter(activity => activity.action === actionFilter)
  }
  
  // Apply date filter
  if (dateFilter !== 'all') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    filtered = filtered.filter(activity => {
      const activityDate = new Date(activity.createdAt)
      
      switch (dateFilter) {
        case 'today':
          return activityDate >= today
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          return activityDate >= weekAgo
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          return activityDate >= monthAgo
        default:
          return true
      }
    })
  }
  
  return filtered
}

// Export reducer cho store
export const activitiesReducer = activitiesSlice.reducer 