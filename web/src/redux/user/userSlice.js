import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'
import { toast } from 'react-toastify'

// Khởi tạo giá trị State của một cái Slice trong redux
const initialState = {
  currentUser: null,
  // Forgot Password states
  forgotPassword: {
    isLoading: false,
    isSuccess: false,
    error: null
  },
  // Reset Password states  
  resetPassword: {
    isLoading: false,
    isSuccess: false,
    error: null
  }
}

export const logoutUserAPI = createAsyncThunk(
  'user/logoutUserAPI',
  async (showSuccessMessage = true) => {
    const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/users/logout`)
    if (showSuccessMessage) {
      toast.success('Logged out successfully!')
    }
    return response.data
  }
)

// Các hành động gọi api (bất đồng bộ) và cập nhật dữ liệu vào Redux, dùng Middleware createAsyncThunk đi kèm với extraReducers
// https://redux-toolkit.js.org/api/createAsyncThunk
export const loginUserAPI = createAsyncThunk(
  'user/loginUserAPI',
  async (data) => {
    const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/login`, data)
    // Lưu ý: axios sẽ trả kết quả về qua property của nó là data
    return response.data
  }
)

export const updateUserAPI = createAsyncThunk(
  'user/updateUserAPI',
  async (data) => {
    const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/update`, data)
    return response.data
  }
)

export const forgotPasswordAPI = createAsyncThunk(
  'user/forgotPasswordAPI',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/forgot-password`, data)
      return response.data
    } catch (error) {
      // Trả về error message để handle trong rejected case
      return rejectWithValue(error.response?.data?.message || 'Something went wrong')
    }
  }
)

export const resetPasswordAPI = createAsyncThunk(
  'user/resetPasswordAPI', 
  async (data, { rejectWithValue }) => {
    try {
      const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/reset-password/${data.token}`, {
        newPassword: data.newPassword
      })
      return response.data
    } catch (error) {
      // Trả về error message để handle trong rejected case
      return rejectWithValue(error.response?.data?.message || 'Something went wrong')
    }
  }
)

// Khởi tạo một cái Slice trong kho lưu trữ - Redux Store
export const userSlice = createSlice({
  name: 'user',
  initialState,
  // Reducers: Nơi xử lý dữ liệu đồng bộ
  reducers: {
    // Reset forgot password state
    clearForgotPasswordState: (state) => {
      state.forgotPassword = {
        isLoading: false,
        isSuccess: false,
        error: null
      }
    },
    // Reset reset password state
    clearResetPasswordState: (state) => {
      state.resetPassword = {
        isLoading: false,
        isSuccess: false,
        error: null
      }
    }
  },
  // ExtraReducers: Nơi xử lý dữ liệu bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(loginUserAPI.fulfilled, (state, action) => {
      // action.payload ở dây chính là cái response.data trả về ở trên
      const user = action.payload
      state.currentUser = user
    })
    builder.addCase(logoutUserAPI.fulfilled, (state) => {
      /**
       * API logout sau khi gọi thành công thì sẽ clear thông tin currentUser về null ở đây
       * Kết hợp ProtectedRoute đã làm ở App.js => code sẽ điều hướng chuẩn về trang Login
       */
      state.currentUser = null
    })
    builder.addCase(updateUserAPI.fulfilled, (state, action) => {
      const user = action.payload
      state.currentUser = user
    })

    // Forgot Password Cases
    builder.addCase(forgotPasswordAPI.pending, (state) => {
      state.forgotPassword.isLoading = true
      state.forgotPassword.isSuccess = false
      state.forgotPassword.error = null
    })
    builder.addCase(forgotPasswordAPI.fulfilled, (state, action) => {
      state.forgotPassword.isLoading = false
      state.forgotPassword.isSuccess = true
      state.forgotPassword.error = null
      // Có thể lưu message từ response nếu cần
      // state.forgotPassword.message = action.payload.message
    })
    builder.addCase(forgotPasswordAPI.rejected, (state, action) => {
      state.forgotPassword.isLoading = false
      state.forgotPassword.isSuccess = false
      state.forgotPassword.error = action.payload || action.error.message
    })

    // Reset Password Cases
    builder.addCase(resetPasswordAPI.pending, (state) => {
      state.resetPassword.isLoading = true
      state.resetPassword.isSuccess = false
      state.resetPassword.error = null
    })
    builder.addCase(resetPasswordAPI.fulfilled, (state, action) => {
      state.resetPassword.isLoading = false
      state.resetPassword.isSuccess = true
      state.resetPassword.error = null
      // Có thể lưu message từ response nếu cần
      // state.resetPassword.message = action.payload.message
    })
    builder.addCase(resetPasswordAPI.rejected, (state, action) => {
      state.resetPassword.isLoading = false
      state.resetPassword.isSuccess = false
      state.resetPassword.error = action.payload || action.error.message
    })
  }
})

// Action creators are generated for each case reducer function
// Actions: Là nơi dành cho các components bên dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu thông qua reducer (chạy đồng bộ)
export const { clearForgotPasswordState, clearResetPasswordState } = userSlice.actions

// Selectors: Là nơi dành cho các components bên dưới gọi bằng hook useSelector() để lấy dữ liệu từ trong kho redux store ra sử dụng
export const selectCurrentUser = (state) => {
  return state.user.currentUser
}

export const selectForgotPasswordState = (state) => {
  return state.user.forgotPassword
}

export const selectResetPasswordState = (state) => {
  return state.user.resetPassword
}

export const userReducer = userSlice.reducer
