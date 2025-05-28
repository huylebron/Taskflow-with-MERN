import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import CancelIcon from '@mui/icons-material/Cancel'
import ColumnColorPicker from './ColumnColorPicker'
import { COLUMN_COLORS } from '~/utils/constants'

function ColumnColorModal({ isOpen, onClose, onSelectColor }) {
  const [isLoading, setIsLoading] = useState(false)

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
        width: 360, // nhỏ hơn CoverOptionsModal (400px -> 360px)
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 3 // padding nhỏ hơn
      }}>
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
            colors={Object.values(COLUMN_COLORS)} 
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