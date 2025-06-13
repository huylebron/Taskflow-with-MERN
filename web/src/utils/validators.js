/**
 * TrungQuanDev: https://youtube.com/@trungquandev
 */

// Một vài biểu thức chính quy - Regular Expression và custom message.
// Về Regular Expression khá hại não: https://viblo.asia/p/hoc-regular-expression-va-cuoc-doi-ban-se-bot-kho-updated-v22-Az45bnoO5xY
export const FIELD_REQUIRED_MESSAGE = 'This field is required.'
export const EMAIL_RULE = /^\S+@\S+\.\S+$/
export const EMAIL_RULE_MESSAGE = 'Email is invalid. (example@trungquandev.com)'
export const PASSWORD_RULE = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d\W]{8,256}$/
export const PASSWORD_RULE_MESSAGE = 'Password must include at least 1 letter, a number, and at least 8 characters.'


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
    return 'File cannot be blank.'
  }
  if (file.size > LIMIT_COMMON_FILE_SIZE) {
    return 'Maximum file size exceeded. (10MB)'
  }
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.type)) {
    return 'File type is invalid. Only accept jpg, jpeg and png'
  }
  return null
}

// Kiểm tra nhiều file (cho tính năng Attachment)
export const multipleFilesValidator = (files) => {
  if (!files || files.length === 0) {
    return 'Please select at least one file.'
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    if (!file || !file.name || !file.size || !file.type) {
      return `File #${i + 1} is invalid.`
    }

    if (file.size > LIMIT_COMMON_FILE_SIZE) {
      return `File "${file.name}" exceeds maximum size of 10MB.`
    }

    if (!ALLOW_ATTACHMENT_FILE_TYPES.includes(file.type)) {
      return `File "${file.name}" is not supported. Allowed types: images, PDF, Office documents, text.`
    }
  }

  return null
}
