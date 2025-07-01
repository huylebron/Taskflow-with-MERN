/**
 * Attachment API Services
 * Thay thế MOCK_ATTACHMENTS bằng API calls thực tế
 */

import { toast } from 'react-toastify'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

/**
 * 🚨 CRITICAL: Upload attachments với multiple files
 * @param {string} cardId - ID của card
 * @param {FileList} files - Danh sách files để upload
 * @returns {Promise} Response data with uploadResults
 */
export const uploadAttachmentsAPI = async (cardId, files) => {
  try {
    // Validate input
    if (!cardId) {
      throw new Error('Card ID là bắt buộc')
    }

    if (!files || files.length === 0) {
      throw new Error('Vui lòng chọn ít nhất một file')
    }

    // ⚠️ CẨN THẬN: Tạo FormData đúng cách
    const formData = new FormData()

    // Append tất cả files vào FormData
    Array.from(files).forEach(file => {
      formData.append('attachments', file)
    })

    // 🚨 CRITICAL: Upload với progress tracking
    const response = await authorizedAxiosInstance.post(
      `${API_ROOT}/v1/cards/${cardId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        // Track upload progress (optional)
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          console.log(`Upload progress: ${percentCompleted}%`)
        }
      }
    )

    // Validate response format
    if (!response.data.success) {
      throw new Error(response.data.message || 'Tải lên thất bại')
    }

    return response.data

  } catch (error) {
    console.error('Upload attachments error:', error)

    // ⚠️ LƯU Ý: Handle different error types
    if (error.response?.status === 422) {
      toast.error(error.response.data.message || 'Định dạng hoặc kích thước file không hợp lệ')
    } else if (error.response?.status === 413) {
      toast.error('File quá lớn. Kích thước tối đa là 10MB')
    } else if (error.response?.status === 404) {
      toast.error('Không tìm thấy thẻ')
    } else {
      toast.error(error.message || 'Tải lên tệp đính kèm thất bại')
    }

    throw error
  }
}

/**
 * Lấy danh sách attachments của card
 * @param {string} cardId - ID của card
 * @returns {Promise} Attachments data
 */
export const getAttachmentsAPI = async (cardId) => {
  try {
    if (!cardId) {
      throw new Error('Card ID là bắt buộc')
    }

    const response = await authorizedAxiosInstance.get(
      `${API_ROOT}/v1/cards/${cardId}/attachments`
    )

    if (!response.data.success) {
      throw new Error(response.data.message || 'Không thể lấy danh sách tệp đính kèm')
    }

    return response.data.data

  } catch (error) {
    console.error('Get attachments error:', error)

    if (error.response?.status === 404) {
      toast.error('Không tìm thấy thẻ')
    } else {
      toast.error(error.message || 'Không thể tải danh sách tệp đính kèm')
    }

    throw error
  }
}

/**
 * 🚨 CRITICAL: Xóa attachment
 * @param {string} attachmentId - ID của attachment
 * @returns {Promise} Success status
 */
export const deleteAttachmentAPI = async (attachmentId) => {
  try {
    if (!attachmentId) {
      throw new Error('Attachment ID là bắt buộc')
    }

    const response = await authorizedAxiosInstance.delete(
      `${API_ROOT}/v1/attachments/${attachmentId}`
    )

    if (!response.data.success) {
      throw new Error(response.data.message || 'Không thể xóa tệp đính kèm')
    }

    return response.data

  } catch (error) {
    console.error('Delete attachment error:', error)

    if (error.response?.status === 404) {
      toast.error('Attachment not found')
    } else if (error.response?.status === 403) {
      toast.error('Not authorized to delete this attachment')
    } else {
      toast.error(error.message || 'Failed to delete attachment')
    }

    throw error
  }
}

/**
 * 🚨 CRITICAL: Download attachment với multiple fallback methods
 * @param {string} attachmentId - ID của attachment
 * @param {string} fileName - Tên file để download
 * @returns {Promise} Download URL hoặc file data
 */
export const downloadAttachmentAPI = async (attachmentId, fileName) => {
  try {
    if (!attachmentId) {
      throw new Error('Attachment ID là bắt buộc')
    }

    console.log('🔄 Starting download for attachment:', attachmentId, 'fileName:', fileName)

    const response = await authorizedAxiosInstance.get(
      `${API_ROOT}/v1/attachments/${attachmentId}/download`
    )

    console.log('📥 Download response:', response.data)

    if (!response.data.success) {
      throw new Error(response.data.message || 'Không thể tải xuống tệp đính kèm')
    }

    // 🔥 QUAN TRỌNG: Multiple download methods
    const downloadData = response.data.data

    // Method 1: Direct download URL
    if (downloadData.downloadUrl) {
      console.log('✅ Using direct download URL:', downloadData.downloadUrl)

      const link = document.createElement('a')
      link.href = downloadData.downloadUrl
      link.download = fileName || downloadData.fileName || 'attachment'
      link.target = '_blank'
      link.rel = 'noopener noreferrer'

      // Ensure link is added to DOM
      document.body.appendChild(link)
      link.click()

      // Clean up after a delay
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link)
        }
      }, 100)

      toast.success(`Đang tải xuống: ${fileName}`)
      return response.data
    }

    // Method 2: Redirect URL
    if (downloadData.redirectUrl) {
      console.log('✅ Using redirect URL:', downloadData.redirectUrl)
      window.open(downloadData.redirectUrl, '_blank')
      toast.success(`Đang tải xuống: ${fileName}`)
      return response.data
    }

    // Method 3: File URL (fallback)
    if (downloadData.url || downloadData.fileUrl) {
      const fileUrl = downloadData.url || downloadData.fileUrl
      console.log('✅ Using file URL:', fileUrl)

      const link = document.createElement('a')
      link.href = fileUrl
      link.download = fileName || 'attachment'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link)
        }
      }, 100)

      toast.success(`Đang tải xuống: ${fileName}`)
      return response.data
    }

    // No download method available
    throw new Error('Máy chủ không cung cấp URL tải xuống')

  } catch (error) {
    console.error('❌ Download attachment error:', error)

    if (error.response?.status === 404) {
      toast.error('Tệp đính kèm không tồn tại')
    } else if (error.response?.status === 403) {
      toast.error('Không có quyền tải xuống tệp này')
    } else {
      toast.error(error.message || 'Không thể tải xuống tệp đính kèm')
    }

    throw error
  }
}

/**
 * 🚀 BONUS: Update attachment metadata
 * @param {string} attachmentId - ID của attachment
 * @param {object} updateData - Data to update
 * @returns {Promise} Updated attachment data
 */
export const updateAttachmentAPI = async (attachmentId, updateData) => {
  try {
    if (!attachmentId) {
      throw new Error('Attachment ID là bắt buộc')
    }

    const response = await authorizedAxiosInstance.patch(
      `${API_ROOT}/v1/attachments/${attachmentId}`,
      updateData
    )

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update attachment')
    }

    return response.data

  } catch (error) {
    console.error('Update attachment error:', error)
    toast.error(error.message || 'Failed to update attachment')
    throw error
  }
}