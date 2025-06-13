import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Skeleton
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import LinkIcon from '@mui/icons-material/Link'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { BACKGROUND_TYPES } from '~/utils/backgroundConstants'

const PreviewContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  aspectRatio: '16/10',
  borderRadius: '12px',
  overflow: 'hidden',
  position: 'relative',
  marginTop: '16px',
  border: `2px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default
}))

const PreviewImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block'
})

const PreviewPlaceholder = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.background.paper
}))

const SelectedBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '8px',
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

// Debounce function
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

function CustomUrlInput({ selectedBackground, onApplyUrl }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const imageRef = useRef(null)

  const [url, setUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isValidImage, setIsValidImage] = useState(false)
  const [isAutoPreview, setIsAutoPreview] = useState(false)

  // Debounce the url input for auto preview
  const debouncedUrl = useDebounce(url, 800)

  // Validate URL format
  const isValidUrl = useCallback((string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }, [])

  // Check if URL points to an image
  const isImageUrl = useCallback((url) => {
    return /\.(jpg|jpeg|png|gif|bmp|webp|svg)(\?.*)?$/i.test(url) ||
           url.includes('unsplash.com') ||
           url.includes('pixabay.com') ||
           url.includes('pexels.com')
  }, [])

  // Auto preview when debounced URL changes
  useEffect(() => {
    if (isAutoPreview && debouncedUrl && debouncedUrl !== previewUrl) {
      if (isValidUrl(debouncedUrl) && isImageUrl(debouncedUrl)) {
        handlePreviewInternal(debouncedUrl)
      }
    }
  }, [debouncedUrl, isAutoPreview, previewUrl, isValidUrl, isImageUrl])

  const handleUrlChange = (event) => {
    const newUrl = event.target.value
    setUrl(newUrl)
    setError('')

    // Clear preview if URL is empty
    if (!newUrl.trim()) {
      setPreviewUrl('')
      setIsValidImage(false)
      return
    }
  }

  // Internal preview handler that can be called programmatically
  const handlePreviewInternal = useCallback((urlToPreview) => {
    setIsLoading(true)
    setError('')
    setPreviewUrl(urlToPreview)
  }, [])

  const handlePreview = () => {
    if (!url.trim()) {
      setError('Vui lòng nhập URL hình ảnh')
      return
    }

    if (!isValidUrl(url)) {
      setError('URL không hợp lệ. Vui lòng kiểm tra lại.')
      return
    }

    if (!isImageUrl(url)) {
      setError('URL phải trỏ đến một file hình ảnh (jpg, png, gif, etc.)')
      return
    }

    handlePreviewInternal(url)
  }

  const handleImageLoad = () => {
    setIsLoading(false)
    setIsValidImage(true)
    setError('')

    // Set auto preview after first successful load
    setIsAutoPreview(true)

    // Cache image for better performance
    if (imageRef.current) {
      imageRef.current.style.display = 'block'
    }
  }

  const handleImageError = () => {
    setIsLoading(false)
    setIsValidImage(false)
    setPreviewUrl('')
    setError('Không thể tải hình ảnh từ URL này. Vui lòng kiểm tra lại.')

    // Disable auto preview on error to avoid endless attempts
    setIsAutoPreview(false)
  }

  const handleApply = () => {
    if (isValidImage && previewUrl) {
      onApplyUrl(BACKGROUND_TYPES.URL, previewUrl)
      // Don't clear the URL after applying
      // Keep the preview visible
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (isValidImage) {
        handleApply()
      } else {
        handlePreview()
      }
    }
  }

  const isCurrentlySelected = () => {
    return selectedBackground?.type === BACKGROUND_TYPES.IMAGE &&
           selectedBackground?.value === previewUrl &&
           previewUrl !== ''
  }

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom sx={{
        fontWeight: 600,
        color: 'text.primary',
        mb: 1
      }}>
        Nhập URL hình ảnh
      </Typography>

      <Typography variant="body2" sx={{
        color: 'text.secondary',
        mb: 2
      }}>
        Nhập đường dẫn URL đến hình ảnh bạn muốn sử dụng làm nền
      </Typography>

      {/* URL Input */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="https://example.com/image.jpg"
          value={url}
          onChange={handleUrlChange}
          onKeyDown={handleKeyDown}
          error={!!error}
          InputProps={{
            startAdornment: (
              <LinkIcon sx={{ color: 'text.secondary', mr: 1 }} />
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'divider'
              }
            }
          }}
        />

        <Button
          variant="outlined"
          onClick={handlePreview}
          disabled={!url.trim() || isLoading}
          sx={{
            minWidth: isMobile ? '80px' : '100px',
            whiteSpace: 'nowrap'
          }}
        >
          Xem trước
        </Button>
      </Box>

      {/* Auto Preview Indicator */}
      {isAutoPreview && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            mb: 2,
            fontStyle: 'italic',
            textAlign: 'right'
          }}
        >
          ✓ Tự động xem trước đang bật
        </Typography>
      )}

      {/* Error Message */}
      {error && (
        <Alert
          severity="error"
          icon={<ErrorOutlineIcon fontSize="inherit" />}
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Preview Container */}
      <PreviewContainer>
        {!previewUrl && !isLoading && (
          <PreviewPlaceholder>
            <LinkIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2" textAlign="center">
              Nhập URL và nhấn "Xem trước" để xem hình ảnh
            </Typography>
          </PreviewPlaceholder>
        )}

        {isLoading && (
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            animation="wave"
          />
        )}

        {previewUrl && !isLoading && (
          <>
            <PreviewImage
              ref={imageRef}
              src={previewUrl}
              alt="Preview"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{
                opacity: isValidImage ? 1 : 0,
                transition: 'opacity 0.3s ease'
              }}
            />

            {isCurrentlySelected() && (
              <SelectedBadge>
                <CheckCircleIcon sx={{ fontSize: 14 }} />
                Đang sử dụng
              </SelectedBadge>
            )}
          </>
        )}
      </PreviewContainer>

      {/* Apply Button */}
      {isValidImage && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={handleApply}
            disabled={isCurrentlySelected()}
            sx={{ minWidth: '120px' }}
          >
            {isCurrentlySelected() ? 'Đã áp dụng' : 'Áp dụng'}
          </Button>
        </Box>
      )}

      {/* Help Text */}
      <Box sx={{
        mt: 3,
        p: 2,
        backgroundColor: 'info.main',
        color: 'info.contrastText',
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
          💡 Mẹo sử dụng:
        </Typography>
        <Typography variant="caption" component="div">
          • Sử dụng URL từ các trang ảnh như Unsplash, Pixabay, Pexels
          <br />
          • Đảm bảo URL kết thúc bằng .jpg, .png, .gif, etc.
          <br />
          • Hình ảnh nên có tỷ lệ khung hình 16:10 để hiển thị tốt nhất
        </Typography>
      </Box>
    </Box>
  )
}

export default CustomUrlInput