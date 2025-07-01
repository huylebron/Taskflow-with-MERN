/**
 * TrungQuanDev: https://youtube.com/@trungquandev
 */

// Một vài biểu thức chính quy - Regular Expression và custom message.
// Về Regular Expression khá hại não: https://viblo.asia/p/hoc-regular-expression-va-cuoc-doi-ban-se-bot-kho-updated-v22-Az45bnoO5xY
export const FIELD_REQUIRED_MESSAGE = 'Trường này là bắt buộc.'
export const EMAIL_RULE = /^\S+@\S+\.\S+$/
export const EMAIL_RULE_MESSAGE = 'Email không hợp lệ. (vd: example@email.com)'
export const PASSWORD_RULE = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d\W]{8,256}$/
export const PASSWORD_RULE_MESSAGE = 'Mật khẩu phải bao gồm ít nhất 1 chữ cái, 1 số và tối thiểu 8 ký tự.'


// Liên quan đến Validate File
export const LIMIT_COMMON_FILE_SIZE = 10485760 // byte = 10 MB
export const ALLOW_COMMON_FILE_TYPES = ['image/jpg', 'image/jpeg', 'image/png']

// Mở rộng các loại file cho Attachment feature
export const ALLOW_ATTACHMENT_FILE_TYPES = [
  // Images
  'image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
  // Documents
  'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PowerPoint
  'text/plain' // Text
]

// Kiểm tra một file
export const singleFileValidator = (file) => {
  if (!file || !file.name || !file.size || !file.type) {
    return 'Vui lòng chọn file.'
  }
  if (file.size > LIMIT_COMMON_FILE_SIZE) {
    return 'Kích thước file vượt quá giới hạn. (10MB)'
  }
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.type)) {
    return 'Loại file không hợp lệ. Chỉ chấp nhận jpg, jpeg và png'
  }
  return null
}

// Kiểm tra nhiều file (cho tính năng Attachment)
export const multipleFilesValidator = (files) => {
  if (!files || files.length === 0) {
    return 'Vui lòng chọn ít nhất một file.'
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    if (!file || !file.name || !file.size || !file.type) {
      return `File #${i + 1} không hợp lệ.`
    }

    if (file.size > LIMIT_COMMON_FILE_SIZE) {
      return `File "${file.name}" vượt quá kích thước tối đa 10MB.`
    }

    if (!ALLOW_ATTACHMENT_FILE_TYPES.includes(file.type)) {
      return `File "${file.name}" không được hỗ trợ. Loại file cho phép: hình ảnh, PDF, tài liệu Office, văn bản.`
    }
  }

  return null
}
