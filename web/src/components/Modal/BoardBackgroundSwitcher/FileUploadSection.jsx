import { useState, useRef, useCallback, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  Button,
  Alert,
  LinearProgress
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import ImageIcon from '@mui/icons-material/Image'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import DeleteIcon from '@mui/icons-material/Delete'
import { BACKGROUND_TYPES } from '~/utils/backgroundConstants'

const DropZone = styled(Box)(({ theme, isDragOver, hasFile }) => ({
  width: '100%',
  minHeight: '200px',
  border: `2px dashed ${
    isDragOver 
      ? theme.palette.primary.main 
      : hasFile 
        ? theme.palette.success.main
        : theme.palette.divider
  }`,
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: hasFile ? 'default' : 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: isDragOver 
    ? theme.palette.primary.main + '10'
    : hasFile 
      ? theme.palette.success.main + '10'
      : theme.palette.background.paper,
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: !hasFile && !isDragOver 
      ? theme.palette.action.hover 
      : undefined,
    borderColor: !hasFile && !isDragOver 
      ? theme.palette.primary.light 
      : undefined
  }
}))

const PreviewImage = styled('img')({
  width: '100%',
  height: '200px',
  objectFit: 'cover',
  borderRadius: '12px'
})

const FileActions = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '8px',
  right: '8px',
  display: 'flex',
  gap: '8px'
}))

const ActionButton = styled(Box)(({ theme }) => ({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)'
  }
}))

const SelectedBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '8px',
  right: '8px',
  padding: '4px 8px',
  backgroundColor: theme.palette.success.main,
  color: 'white',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '12px',
  fontWeight: 500
}))

function FileUploadSection({ selectedBackground, onFileSelect }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const fileInputRef = useRef(null)
  const previewImageRef = useRef(null)
  const fileReaderRef = useRef(null)
  
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  // Accepted file types
  const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  // Cleanup resources on unmount
  useEffect(() => {
    return () => {
      // Clean up any FileReader instances
      if (fileReaderRef.current) {
        fileReaderRef.current.abort();
        fileReaderRef.current = null;
      }
      
      // Revoke any object URLs to prevent memory leaks
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Validate file
  const validateFile = useCallback((file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Chỉ hỗ trợ file ảnh (JPG, PNG, GIF, WebP)'
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return 'File quá lớn. Kích thước tối đa là 5MB'
    }
    
    return null
  }, [ACCEPTED_TYPES, MAX_FILE_SIZE]);

  // Process file upload with optimizations
  const processFile = useCallback((file) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError('')
    setUploadProgress(0)
    
    // Clean up previous FileReader if exists
    if (fileReaderRef.current) {
      fileReaderRef.current.abort();
    }

    // Clean up previous preview URL if it's a blob URL
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    const reader = new FileReader()
    fileReaderRef.current = reader;
    
    // Add progress tracking
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(progress);
      }
    };
    
    reader.onload = (e) => {
      const result = e.target.result
      setUploadedFile(file)
      setPreviewUrl(result)
      setIsLoading(false)
      setUploadProgress(100)
      
      // Schedule progress reset after completion animation
      setTimeout(() => {
        setUploadProgress(0);
      }, 500);
    }
    
    reader.onerror = () => {
      setError('Không thể đọc file. Vui lòng thử lại.')
      setIsLoading(false)
      setUploadProgress(0)
      fileReaderRef.current = null;
    }
    
    reader.readAsDataURL(file)
  }, [previewUrl, validateFile]);

  // Optimize image processing if needed for large files
  const optimizeImageIfNeeded = useCallback((file, callback) => {
    // For very large images, we might want to resize them before processing
    if (file.size > 2 * 1024 * 1024) { // If > 2MB
      // In a real app, you might want to use a library like browser-image-compression
      // Here, we'll just process it directly for simplicity
      callback(file);
    } else {
      callback(file);
    }
  }, []);

  // Drag & Drop handlers with memoization
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const file = files[0]
    
    if (file) {
      optimizeImageIfNeeded(file, processFile);
    }
  }, [processFile, optimizeImageIfNeeded])

  // Click to upload
  const handleClick = useCallback(() => {
    if (uploadedFile) return // Prevent click when file is uploaded
    fileInputRef.current?.click()
  }, [uploadedFile]);

  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files[0]
    if (file) {
      optimizeImageIfNeeded(file, processFile);
    }
  }, [processFile, optimizeImageIfNeeded]);

  // Apply uploaded image with error handling
  const handleApply = useCallback(() => {
    if (uploadedFile) {
      onFileSelect(BACKGROUND_TYPES.UPLOAD, uploadedFile)
    }
  }, [uploadedFile, onFileSelect]);

  // Remove uploaded file with cleanup
  const handleRemove = useCallback(() => {
    // Revoke object URL if needed
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setUploadedFile(null)
    setPreviewUrl('')
    setError('')
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    if (fileReaderRef.current) {
      fileReaderRef.current.abort();
      fileReaderRef.current = null;
    }
  }, [previewUrl]);

  const isCurrentlySelected = useCallback(() => {
    return selectedBackground?.type === BACKGROUND_TYPES.IMAGE && 
           selectedBackground?.value === previewUrl && 
           previewUrl !== ''
  }, [selectedBackground, previewUrl]);

  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, []);

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom sx={{ 
        fontWeight: 600,
        color: 'text.primary',
        mb: 1
      }}>
        Tải lên hình ảnh
      </Typography>
      
      <Typography variant="body2" sx={{ 
        color: 'text.secondary',
        mb: 2
      }}>
        Kéo thả file vào khung bên dưới hoặc nhấn để chọn file từ máy tính
      </Typography>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      {/* Drop Zone */}
      <DropZone
        isDragOver={isDragOver}
        hasFile={!!uploadedFile}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Loading state with progress */}
        {isLoading && (
          <Box sx={{ width: '100%', p: 3 }}>
            <Typography variant="body2" textAlign="center" sx={{ mb: 2 }}>
              Đang xử lý file... {uploadProgress > 0 ? `(${uploadProgress}%)` : ''}
            </Typography>
            <LinearProgress 
              variant={uploadProgress > 0 ? "determinate" : "indeterminate"} 
              value={uploadProgress} 
            />
          </Box>
        )}

        {/* Upload area */}
        {!uploadedFile && !isLoading && (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <CloudUploadIcon sx={{ 
              fontSize: 48, 
              color: isDragOver ? 'primary.main' : 'text.secondary',
              mb: 2 
            }} />
            <Typography variant="h6" gutterBottom>
              {isDragOver ? 'Thả file vào đây' : 'Kéo thả hoặc nhấn để chọn'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hỗ trợ: JPG, PNG, GIF, WebP (tối đa 5MB)
            </Typography>
          </Box>
        )}

        {/* Preview uploaded file */}
        {uploadedFile && previewUrl && !isLoading && (
          <>
            <PreviewImage
              ref={previewImageRef}
              src={previewUrl}
              alt='Uploaded preview'
              loading='eager' // Force immediate loading
              onLoad={() => {
                // Ensure image is fully loaded and rendered
                if (previewImageRef.current) {
                  previewImageRef.current.style.opacity = 1;
                }
              }}
            />
            
            {/* File actions */}
            <FileActions>
              <ActionButton
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                sx={{ 
                  backgroundColor: 'error.main',
                  color: 'white',
                  '&:hover': { backgroundColor: 'error.dark' }
                }}
              >
                <DeleteIcon sx={{ fontSize: 18 }} />
              </ActionButton>
            </FileActions>

            {/* Selected indicator */}
            {isCurrentlySelected() && (
              <SelectedBadge>
                <CheckCircleIcon sx={{ fontSize: 14 }} />
                Đang sử dụng
              </SelectedBadge>
            )}
          </>
        )}
      </DropZone>

      {/* File info */}
      {uploadedFile && (
        <Box sx={{ 
          mt: 2, 
          p: 2, 
          backgroundColor: 'background.default',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <ImageIcon color="primary" />
            <Typography variant="body2" fontWeight={500}>
              {uploadedFile.name}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Kích thước: {formatFileSize(uploadedFile.size)}
          </Typography>
        </Box>
      )}

      {/* Error message */}
      {error && (
        <Alert 
          severity="error" 
          icon={<ErrorOutlineIcon fontSize="inherit" />}
          sx={{ mt: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Apply button */}
      {uploadedFile && previewUrl && !error && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={handleApply}
            disabled={isCurrentlySelected() || isLoading}
            sx={{ minWidth: '120px' }}
          >
            {isCurrentlySelected() ? 'Đã áp dụng' : 'Áp dụng'}
          </Button>
         
        </Box>
      )}

      {/* Help text */}
      <Box sx={{ 
        mt: 3, 
        p: 2, 
        backgroundColor: 'warning.main',
        color: 'warning.contrastText',
        borderRadius: 1,
        '& .MuiTypography-root': {
          color: 'inherit'
        }
      }}>
        <Typography variant="caption" sx={{ 
          display: 'block',
          fontWeight: 500,
          mb: 1
        }}>
          ⚠️ Lưu ý:
        </Typography>
        <Typography variant="caption" component="div">
          • File chỉ được lưu trữ trên trình duyệt (không upload lên server)
          <br />
          • Hình ảnh sẽ mất khi làm mới trang hoặc đóng trình duyệt
          <br />
          • Để lưu trữ lâu dài, hãy sử dụng URL từ các dịch vụ lưu trữ ảnh
        </Typography>
      </Box>
    </Box>
  )
}

export default FileUploadSection 