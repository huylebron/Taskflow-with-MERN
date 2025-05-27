import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

const ColorGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: '8px',
  marginTop: '8px'
}))

const ColorBox = styled(Box)(({ theme, isGradient }) => ({
  height: '40px',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
  }
}))

function ColorPicker({ colors, isGradient = false, onSelectColor }) {
  return (
    <ColorGrid>
      {colors.map((color, index) => (
        <ColorBox
          key={index}
          isGradient={isGradient}
          sx={{
            background: color,
            border: theme => 
              theme.palette.mode === 'dark' 
                ? '1px solid rgba(255, 255, 255, 0.2)' 
                : '1px solid rgba(0, 0, 0, 0.1)'
          }}
          onClick={() => onSelectColor(color)}
        />
      ))}
    </ColorGrid>
  )
}

export default ColorPicker 