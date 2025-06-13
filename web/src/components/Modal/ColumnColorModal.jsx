import { useState, useCallback } from 'react'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import CancelIcon from '@mui/icons-material/Cancel'
import ColumnColorPicker from './ColumnColorPicker'
import { COLUMN_COLORS } from '~/utils/constants'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

function ColumnColorModal({ isOpen, onClose, onSelectColor }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const colorOptions = Object.values(COLUMN_COLORS)

  // Xử lý keyboard navigation và accessibility
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  const handleColorSelect = (color, type = 'color') => {
    onSelectColor(color, type)
    onClose()
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="column-color-modal"
      aria-describedby="modal to select column color options">
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: isMobile ? '90%' : 360, // Responsive width
        maxWidth: '360px',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: isMobile ? 2 : 3, // Smaller padding on mobile
        outline: 'none', // Remove default focus outline
        '&:focus': {
          outline: 'none'
        }
      }}
      tabIndex={-1}
      role="dialog"
      aria-modal="true">
        <Box sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          cursor: 'pointer'
        }}>
          <CancelIcon
            color="error"
            sx={{ '&:hover': { color: 'error.light' } }}
            onClick={onClose}
            aria-label="Close dialog"
          />
        </Box>

        <Typography id="column-color-modal-title" variant="h6" component="h2" gutterBottom>
          Đổi màu cột
        </Typography>

        <Box>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            Chọn màu cho cột
          </Typography>

          <ColumnColorPicker
            colors={colorOptions}
            onSelectColor={(color) => handleColorSelect(color, 'color')}
          />

          {/* Option để reset về màu mặc định */}
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Mặc định
            </Typography>
            <Box
              sx={{
                height: '32px',
                width: '32px',
                borderRadius: '4px',
                cursor: 'pointer',
                border: theme => theme.palette.mode === 'dark'
                  ? '2px dashed rgba(255, 255, 255, 0.3)'
                  : '2px dashed rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  borderColor: theme => theme.palette.primary.main,
                  backgroundColor: theme => theme.palette.action.hover
                }
              }}
              onClick={() => handleColorSelect(null, 'default')}
              role="button"
              tabIndex={0}
              aria-label="Reset to default color"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleColorSelect(null, 'default')
                }
              }}
            >
              <Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary' }}>
                Xóa
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

export default ColumnColorModal