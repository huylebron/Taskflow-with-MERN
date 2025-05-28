import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

const ColumnColorGrid = styled(Box)(({ theme, isMobile }) => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(6, 1fr)', // 4 cột trên mobile, 6 cột trên desktop
  gap: isMobile ? '4px' : '6px', // gap nhỏ hơn trên mobile
  marginTop: '8px'
}))

const ColumnColorBox = styled(Box)(({ theme, isGradient }) => ({
  height: '32px', // nhỏ hơn card color picker (40px -> 32px)
  width: '32px',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: theme.palette.mode === 'dark' 
    ? '1px solid rgba(255, 255, 255, 0.2)' 
    : '1px solid rgba(0, 0, 0, 0.1)',
  '&:hover': {
    transform: 'scale(1.1)', // hover effect nhẹ hơn
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
    borderColor: theme.palette.primary.main
  },
  '&:focus': {
    outline: `2px solid ${theme.palette.primary.main}`,
    transform: 'scale(1.1)',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
  }
}))

function ColumnColorPicker({ colors, isGradient = false, onSelectColor }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleKeyDown = (e, color) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelectColor(color)
    }
  }

  return (
    <ColumnColorGrid isMobile={isMobile}>
      {colors.map((color, index) => (
        <ColumnColorBox
          key={index}
          isGradient={isGradient}
          sx={{
            background: color
          }}
          onClick={() => onSelectColor(color)}
          tabIndex={0}
          role="button"
          aria-label={`Color option ${index + 1}`}
          onKeyDown={(e) => handleKeyDown(e, color)}
        />
      ))}
    </ColumnColorGrid>
  )
}

export default ColumnColorPicker 