import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

const ColumnColorGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)', // 6 cột thay vì 5 để hiển thị gọn hơn
  gap: '6px', // gap nhỏ hơn
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
  }
}))

function ColumnColorPicker({ colors, isGradient = false, onSelectColor }) {
  return (
    <ColumnColorGrid>
      {colors.map((color, index) => (
        <ColumnColorBox
          key={index}
          isGradient={isGradient}
          sx={{
            background: color
          }}
          onClick={() => onSelectColor(color)}
        />
      ))}
    </ColumnColorGrid>
  )
}

export default ColumnColorPicker 