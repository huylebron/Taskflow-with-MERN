import { Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { BACKGROUND_COLORS_ARRAY, BACKGROUND_TYPES } from '~/utils/backgroundConstants'

const BackgroundColorGrid = styled(Box)(({ theme, isMobile }) => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(5, 1fr)', // 4 cột trên mobile, 5 cột trên desktop
  gap: isMobile ? '8px' : '12px', // gap lớn hơn so với column color picker
  marginTop: '16px'
}))

const BackgroundColorBox = styled(Box)(({ theme, isSelected }) => ({
  height: '48px', // Lớn hơn column color picker (32px -> 48px)
  width: '100%',
  aspectRatio: '1', // Đảm bảo vuông
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: isSelected 
    ? `3px solid ${theme.palette.primary.main}` 
    : theme.palette.mode === 'dark' 
      ? '2px solid rgba(255, 255, 255, 0.1)' 
      : '2px solid rgba(0, 0, 0, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    borderColor: theme.palette.primary.main,
    zIndex: 1
  },
  '&:focus': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 1
  },
  // Add ripple effect
  '&:active': {
    transform: 'scale(0.98)'
  }
}))

const SelectedIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: theme.palette.common.white,
  border: `2px solid ${theme.palette.primary.main}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::after': {
    content: '""',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main
  }
}))

const DefaultColorBox = styled(Box)(({ theme, isSelected }) => ({
  height: '48px',
  width: '100%',
  aspectRatio: '1',
  borderRadius: '8px',
  cursor: 'pointer',
  border: isSelected 
    ? `3px solid ${theme.palette.primary.main}` 
    : theme.palette.mode === 'dark' 
      ? '2px dashed rgba(255, 255, 255, 0.3)' 
      : '2px dashed rgba(0, 0, 0, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)'
    : 'linear-gradient(45deg, transparent 30%, rgba(0,0,0,0.1) 50%, transparent 70%)',
  position: 'relative',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
    transform: 'scale(1.05)'
  },
  '&:focus': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
    transform: 'scale(1.05)'
  }
}))

function BackgroundColorPicker({ selectedBackground, onSelectColor }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleKeyDown = (e, color) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelectColor(color)
    }
  }

  const handleDefaultSelect = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelectColor(null) // null sẽ được xử lý trong component cha
    }
  }

  const isColorSelected = (color) => {
    return selectedBackground?.type === BACKGROUND_TYPES.COLOR && 
           selectedBackground?.value === color
  }

  const isDefaultSelected = () => {
    return !selectedBackground || selectedBackground?.value === null
  }

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom sx={{ 
        fontWeight: 600,
        color: 'text.primary',
        mb: 1
      }}>
        Chọn màu nền
      </Typography>
      
      <Typography variant="body2" sx={{ 
        color: 'text.secondary',
        mb: 2
      }}>
        Chọn một màu từ bảng màu bên dưới để thay đổi nền của board
      </Typography>

      {/* Color Grid */}
      <BackgroundColorGrid isMobile={isMobile}>
        {BACKGROUND_COLORS_ARRAY.map((color, index) => (
          <BackgroundColorBox
            key={`${color}-${index}`}
            isSelected={isColorSelected(color)}
            sx={{
              background: color,
              // Add subtle gradient overlay for better visual depth
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%)',
                pointerEvents: 'none'
              }
            }}
            onClick={() => onSelectColor(color)}
            tabIndex={0}
            role="button"
            aria-label={`Background color option ${index + 1}: ${color}`}
            onKeyDown={(e) => handleKeyDown(e, color)}
          >
            {isColorSelected(color) && <SelectedIndicator />}
          </BackgroundColorBox>
        ))}
      </BackgroundColorGrid>
      
      {/* Default/Reset Option */}
      <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2" gutterBottom sx={{ 
          fontWeight: 600,
          color: 'text.primary',
          mb: 2
        }}>
          Mặc định
        </Typography>
        
        <Box sx={{ width: isMobile ? '100px' : '120px' }}>
          <DefaultColorBox
            isSelected={isDefaultSelected()}
            onClick={() => onSelectColor(null)}
            role="button"
            tabIndex={0}
            aria-label="Reset to default background"
            onKeyDown={handleDefaultSelect}
          >
            {isDefaultSelected() && <SelectedIndicator />}
            <Typography variant="caption" sx={{ 
              fontSize: '11px', 
              color: 'text.secondary',
              fontWeight: 500,
              zIndex: 1
            }}>
              Không màu
            </Typography>
          </DefaultColorBox>
        </Box>
      </Box>
    </Box>
  )
}

export default BackgroundColorPicker 