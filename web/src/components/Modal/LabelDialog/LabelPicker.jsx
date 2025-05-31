import React from 'react'
import { Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import PropTypes from 'prop-types'
import { LABEL_COLORS } from '~/utils/labelConstants'
import { getContrastText } from '~/utils/labelHelpers'

const ColorGrid = styled(Box)(({ theme, isMobile }) => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(5, 1fr)', // 4 cột trên mobile, 5 cột trên desktop
  gap: isMobile ? '4px' : '8px', // gap nhỏ hơn trên mobile
  marginTop: '8px'
}))

const ColorBox = styled(Box)(({ theme, selected }) => ({
  height: '36px',
  width: '100%',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: selected 
    ? `2px solid ${theme.palette.common.white}`
    : theme.palette.mode === 'dark' 
      ? '1px solid rgba(255, 255, 255, 0.2)' 
      : '1px solid rgba(0, 0, 0, 0.1)',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: selected ? '0 0 0 2px #000' : 'none',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: selected 
      ? '0 0 0 2px #000'
      : '0 2px 6px rgba(0, 0, 0, 0.2)',
    opacity: 0.9
  },
  '&:focus': {
    outline: `2px solid ${theme.palette.primary.main}`,
    transform: 'scale(1.05)',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
  }
}))

/**
 * LabelPicker component để chọn màu cho label
 * @param {Object} props - Component props
 * @param {Array} [props.colors=Object.values(LABEL_COLORS)] - Mảng các màu để hiển thị
 * @param {string} [props.selectedColor] - Màu đang được chọn
 * @param {Function} props.onColorSelect - Callback khi chọn màu
 * @returns {JSX.Element} - LabelPicker component
 */
const LabelPicker = ({ 
  colors = Object.values(LABEL_COLORS),
  selectedColor,
  onColorSelect
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleKeyDown = (e, color) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onColorSelect(color)
    }
  }

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
        Chọn màu
      </Typography>
      <ColorGrid isMobile={isMobile}>
        {colors.map((color, index) => {
          const isSelected = color === selectedColor
          const textColor = getContrastText(color)
          
          return (
            <ColorBox
              key={index}
              selected={isSelected}
              sx={{ background: color }}
              onClick={() => onColorSelect(color)}
              tabIndex={0}
              role="button"
              aria-label={`Color option ${index + 1}${isSelected ? ' (selected)' : ''}`}
              onKeyDown={(e) => handleKeyDown(e, color)}
            >
              {isSelected && (
                <Box 
                  component="span" 
                  sx={{ 
                    color: textColor,
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  ✓
                </Box>
              )}
            </ColorBox>
          )
        })}
      </ColorGrid>
    </Box>
  )
}

LabelPicker.propTypes = {
  colors: PropTypes.array,
  selectedColor: PropTypes.string,
  onColorSelect: PropTypes.func.isRequired
}

export default LabelPicker 