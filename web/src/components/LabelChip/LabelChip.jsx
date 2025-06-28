import React from 'react'
import { Chip, Box, Tooltip } from '@mui/material'
import { styled } from '@mui/material/styles'
import PropTypes from 'prop-types'
import { getContrastText } from '~/utils/labelHelpers'

// Styled Chip component with dynamic background and text color
const StyledChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'labelColor' && prop !== 'textColor'
})(({ theme, labelColor, textColor }) => ({
  backgroundColor: labelColor,
  color: textColor,
  fontWeight: 600,
  fontSize: '12px',
  height: '20px',
  minWidth: '40px',
  borderRadius: '3px',
  '& .MuiChip-label': {
    padding: '0 8px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    lineHeight: 1.2
  },
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
  },
  transition: 'all 0.2s ease'
}))

/**
 * LabelChip component để hiển thị label dưới dạng chip
 * @param {Object} props - Component props
 * @param {Object} props.label - Label object { id, name, color }
 * @param {string} [props.size='small'] - Kích thước chip: 'small', 'medium'
 * @param {string} [props.variant='filled'] - Variant của chip: 'filled', 'outlined'
 * @param {boolean} [props.showTooltip=true] - Hiển thị tooltip khi hover
 * @param {Object} [props.sx] - Additional MUI sx props
 * @returns {JSX.Element} - LabelChip component
 */
const LabelChip = ({ label, size = 'small', variant = 'filled', showTooltip = true, sx = {} }) => {
  if (!label || !label.color) return null

  const textColor = getContrastText(label.color)

  const chipContent = (
    <StyledChip
      size={size}
      variant={variant}
      label={label.name || ''}
      labelColor={label.color}
      textColor={textColor}
      sx={sx}
    />
  )

  // Nếu không cần tooltip hoặc không có tên, trả về chip trực tiếp
  if (!showTooltip || !label.name) {
    return chipContent
  }

  // Bọc trong tooltip nếu cần
  return (
    <Tooltip title={label.name} placement="top">
      <Box component="span" sx={{ display: 'inline-block' }}>
        {chipContent}
      </Box>
    </Tooltip>
  )
}

LabelChip.propTypes = {
  label: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    color: PropTypes.string.isRequired
  }).isRequired,
  size: PropTypes.oneOf(['small', 'medium']),
  variant: PropTypes.oneOf(['filled', 'outlined']),
  showTooltip: PropTypes.bool,
  sx: PropTypes.object
}

export default LabelChip