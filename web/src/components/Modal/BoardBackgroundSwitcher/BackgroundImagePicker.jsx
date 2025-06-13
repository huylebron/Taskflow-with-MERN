import { useState, useMemo } from 'react'
import { Box, Typography, Skeleton } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { BACKGROUND_IMAGES, BACKGROUND_TYPES } from '~/utils/backgroundConstants'

const ImageGrid = styled(Box)(({ theme, isMobile }) => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', // 2 cột trên mobile, 3 cột trên desktop
  gap: isMobile ? '12px' : '16px',
  marginTop: '16px'
}))

const ImageBox = styled(Box)(({ theme, isSelected }) => ({
  position: 'relative',
  width: '100%',
  aspectRatio: '16/10', // Tỷ lệ phù hợp cho background images
  borderRadius: '12px',
  cursor: 'pointer',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  border: isSelected
    ? `3px solid ${theme.palette.primary.main}`
    : '2px solid transparent',
  boxShadow: isSelected
    ? `0 4px 20px ${theme.palette.primary.main}40`
    : '0 2px 8px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    borderColor: theme.palette.primary.light,
    '& .image-overlay': {
      opacity: 1
    }
  },
  '&:focus': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
    transform: 'scale(1.02)'
  },
  '&:active': {
    transform: 'scale(0.98)'
  }
}))

const ImageElement = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block'
})

const ImageOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}))

const SelectedIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '8px',
  right: '8px',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
  zIndex: 2
}))

const LoadingSkeleton = styled(Skeleton)(({ theme }) => ({
  width: '100%',
  aspectRatio: '16/10',
  borderRadius: '12px'
}))

function BackgroundImagePicker({ selectedBackground, onSelectImage }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [loadedImages, setLoadedImages] = useState(new Set())
  const [failedImages, setFailedImages] = useState(new Set())
  const [visibleItems, setVisibleItems] = useState(6) // Initial number of items to show

  const handleImageLoad = (imageUrl) => {
    setLoadedImages(prev => new Set([...prev, imageUrl]))
  }

  const handleImageError = (imageUrl) => {
    setFailedImages(prev => new Set([...prev, imageUrl]))
  }

  const handleKeyDown = (e, imageUrl) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelectImage(imageUrl)
    }
  }

  const isImageSelected = (imageUrl) => {
    return selectedBackground?.type === BACKGROUND_TYPES.IMAGE &&
           selectedBackground?.value === imageUrl
  }

  const isImageLoaded = (imageUrl) => {
    return loadedImages.has(imageUrl)
  }

  const isImageFailed = (imageUrl) => {
    return failedImages.has(imageUrl)
  }

  // Add image size parameter for optimization
  const getOptimizedImageUrl = (url, width = 400) => {
    if (url.includes('unsplash.com')) {
      return `${url}?w=${width}&q=80&fm=jpg&fit=crop`
    }
    return url
  }

  // Handle loading more images when scrolling to the bottom
  const handleScroll = (e) => {
    const container = e.target
    // Check if scrolled near bottom
    if (container.scrollHeight - container.scrollTop - container.clientHeight < 100) {
      // Load more images if we haven't reached the end
      if (visibleItems < BACKGROUND_IMAGES.length) {
        setVisibleItems(prev => Math.min(prev + 6, BACKGROUND_IMAGES.length))
      }
    }
  }

  // Memoize visible images to avoid unnecessary re-renders
  const visibleImages = useMemo(() => {
    return BACKGROUND_IMAGES.slice(0, visibleItems)
  }, [visibleItems])

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom sx={{
        fontWeight: 600,
        color: 'text.primary',
        mb: 1
      }}>
        Chọn hình nền
      </Typography>

      <Typography variant="body2" sx={{
        color: 'text.secondary',
        mb: 2
      }}>
        Chọn một hình ảnh từ bộ sưu tập để làm nền cho board
      </Typography>

      <Box
        sx={{
          maxHeight: '400px',
          overflow: 'auto',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: theme.palette.background.default
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.divider,
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: theme.palette.action.hover
          }
        }}
        onScroll={handleScroll}
      >
        <ImageGrid isMobile={isMobile}>
          {visibleImages.map((imageUrl, index) => (
            <ImageBox
              key={`${imageUrl}-${index}`}
              isSelected={isImageSelected(imageUrl)}
              onClick={() => onSelectImage(imageUrl)}
              tabIndex={0}
              role="button"
              aria-label={`Background image option ${index + 1}`}
              onKeyDown={(e) => handleKeyDown(e, imageUrl)}
            >
              {/* Loading skeleton */}
              {!isImageLoaded(imageUrl) && !isImageFailed(imageUrl) && (
                <LoadingSkeleton
                  variant="rectangular"
                  animation="wave"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 1
                  }}
                />
              )}

              {/* Image element */}
              {!isImageFailed(imageUrl) && (
                <ImageElement
                  src={getOptimizedImageUrl(imageUrl)}
                  alt={`Background option ${index + 1}`}
                  onLoad={() => handleImageLoad(imageUrl)}
                  onError={() => handleImageError(imageUrl)}
                  style={{
                    opacity: isImageLoaded(imageUrl) ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                  }}
                  loading="lazy"
                />
              )}

              {/* Error fallback */}
              {isImageFailed(imageUrl) && (
                <Box sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'grey.200',
                  color: 'text.secondary'
                }}>
                  <Typography variant="caption">
                    Không thể tải ảnh
                  </Typography>
                </Box>
              )}

              {/* Hover overlay */}
              <ImageOverlay className="image-overlay">
                <Typography variant="body2" sx={{
                  color: 'white',
                  fontWeight: 500,
                  textAlign: 'center',
                  px: 2
                }}>
                  Chọn hình này
                </Typography>
              </ImageOverlay>

              {/* Selected indicator */}
              {isImageSelected(imageUrl) && (
                <SelectedIndicator>
                  <CheckCircleIcon
                    sx={{
                      color: 'white',
                      fontSize: '20px'
                    }}
                  />
                </SelectedIndicator>
              )}
            </ImageBox>
          ))}
        </ImageGrid>

        {/* Loading indicator for infinite scroll */}
        {visibleItems < BACKGROUND_IMAGES.length && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Kéo xuống để xem thêm hình ảnh...
            </Typography>
          </Box>
        )}
      </Box>

      {/* Info text */}
      <Box sx={{
        mt: 3,
        p: 2,
        backgroundColor: 'background.default',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="caption" sx={{
          color: 'text.secondary',
          display: 'block',
          textAlign: 'center'
        }}>
          💡 Tip: Hình ảnh sẽ được tự động resize để phù hợp với kích thước board
        </Typography>
      </Box>
    </Box>
  )
}

export default BackgroundImagePicker