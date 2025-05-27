import { Modal, Box, IconButton, useMediaQuery, useTheme, Slider, Tooltip, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import { useState, useEffect, useRef } from 'react'

function ImageLightbox({ isOpen, onClose, imageSrc }) {
  const [show, setShow] = useState(false)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const imageContainerRef = useRef(null)
  
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    setShow(isOpen)
    // Reset zoom level and position when opening
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [isOpen])

  const handleClose = () => {
    setShow(false)
    onClose()
  }

  // Xử lý click ra ngoài để đóng lightbox
  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleZoomIn = (e) => {
    e.stopPropagation()
    setScale(prevScale => Math.min(prevScale + 0.25, 3))
  }

  const handleZoomOut = (e) => {
    e.stopPropagation()
    setScale(prevScale => Math.max(prevScale - 0.25, 0.5))
  }

  const handleReset = (e) => {
    e.stopPropagation()
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const toggleFullscreen = (e) => {
    e.stopPropagation()
    
    if (!document.fullscreenElement) {
      if (imageContainerRef.current.requestFullscreen) {
        imageContainerRef.current.requestFullscreen()
        setIsFullscreen(true)
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  const handleSliderChange = (e, newValue) => {
    setScale(newValue)
  }

  // Xử lý di chuyển ảnh khi đã zoom
  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      
      setPosition({
        x: newX,
        y: newY
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Xử lý touch events cho mobile
  const handleTouchStart = (e) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      })
    }
  }

  const handleTouchMove = (e) => {
    if (isDragging && scale > 1) {
      const newX = e.touches[0].clientX - dragStart.x
      const newY = e.touches[0].clientY - dragStart.y
      
      setPosition({
        x: newX,
        y: newY
      })
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Xử lý wheel scroll để zoom
  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY * -0.01
    const newScale = Math.max(0.5, Math.min(3, scale + delta))
    setScale(newScale)
  }

  useEffect(() => {
    // Cleanup effect
    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  // Add global event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('touchend', handleTouchEnd)
    } else {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, dragStart, scale])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  return (
    <Modal
      open={show}
      onClose={handleClose}
      aria-labelledby="image-lightbox-modal"
      aria-describedby="enlarged view of image"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(5px)',
        padding: 0,
        overflowY: 'auto'
      }}
      onClick={handleModalClick}
    >
      <Box
        sx={{
          position: 'relative',
          width: isMobile ? '100%' : 1100,
          maxWidth: '100vw',
          maxHeight: '100vh',
          outline: 'none',
          borderRadius: isMobile ? 0 : '8px',
          overflow: 'hidden',
          boxShadow: 24,
          display: 'flex',
          flexDirection: 'column',
          margin: '0 auto'
        }}
      >
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          padding: '12px 16px', 
          display: 'flex', 
          justifyContent: 'space-between',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1,
          backdropFilter: 'blur(4px)'
        }}>
          {/* Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Tooltip title="Thu nhỏ">
              <IconButton
                onClick={handleZoomOut}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
                }}
                size={isMobile ? 'small' : 'medium'}
              >
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            
            <Slider
              value={scale}
              min={0.5}
              max={3}
              step={0.1}
              onChange={handleSliderChange}
              sx={{ 
                width: isMobile ? '80px' : '200px', 
                color: 'white',
                '& .MuiSlider-thumb': {
                  width: isMobile ? 14 : 20,
                  height: isMobile ? 14 : 20,
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0px 0px 0px 8px rgba(255, 255, 255, 0.16)'
                  }
                },
                '& .MuiSlider-rail': {
                  opacity: 0.5
                }
              }}
            />
            
            <Tooltip title="Phóng to">
              <IconButton
                onClick={handleZoomIn}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
                }}
                size={isMobile ? 'small' : 'medium'}
              >
                <ZoomInIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Khôi phục">
              <IconButton
                onClick={handleReset}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                  display: scale !== 1 || position.x !== 0 || position.y !== 0 ? 'flex' : 'none'
                }}
                size={isMobile ? 'small' : 'medium'}
              >
                <RestartAltIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}>
              <IconButton
                onClick={toggleFullscreen}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
                }}
                size={isMobile ? 'small' : 'medium'}
              >
                <FullscreenIcon />
              </IconButton>
            </Tooltip>

            {!isMobile && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  ml: 1, 
                  fontSize: '0.85rem' 
                }}
              >
                {Math.round(scale * 100)}%
              </Typography>
            )}
          </Box>
          
          <Tooltip title="Đóng">
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.5)'
                }
              }}
              size={isMobile ? 'small' : 'medium'}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box 
          ref={imageContainerRef}
          sx={{ 
            overflow: 'hidden', 
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: isMobile ? 'calc(80vh - 60px)' : 'calc(90vh - 60px)',
            minHeight: '500px',
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            padding: '20px',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: 'radial-gradient(circle at center, rgba(40, 40, 40, 0.2) 0%, rgba(0, 0, 0, 0.9) 100%)',
              pointerEvents: 'none'
            }
          }}
          onWheel={handleWheel}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <img
              src={imageSrc}
              alt="Enlarged view"
              draggable="false"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              style={{
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                display: 'block',
                userSelect: 'none',
                boxShadow: '0 5px 25px rgba(0, 0, 0, 0.25)'
              }}
            />
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

export default ImageLightbox 