import { useState } from 'react'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import CancelIcon from '@mui/icons-material/Cancel'

/**
 * DeleteBoardModal - Component xác nhận xóa board
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Trạng thái hiển thị của modal
 * @param {function} props.onClose - Callback khi đóng modal
 * @param {function} props.onConfirm - Callback khi xác nhận xóa
 * @param {Object} props.board - Thông tin board cần xóa
 * @param {boolean} props.isLoading - Trạng thái loading
 */
function DeleteBoardModal({ isOpen, onClose, onConfirm, board, isLoading = false }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // Modal styles
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: isMobile ? '90%' : 450,
    maxWidth: '95vw',
    maxHeight: '90vh',
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 0,
    outline: 'none',
    overflow: 'hidden'
  }

  const handleConfirm = () => {
    if (onConfirm && !isLoading) {
      onConfirm()
    }
  }

  const handleCancel = () => {
    if (onClose && !isLoading) {
      onClose()
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={handleCancel}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
      aria-labelledby="delete-board-modal-title"
      aria-describedby="delete-board-modal-description"
    >
      <Fade in={isOpen}>
        <Box sx={modalStyle}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 3,
              bgcolor: 'error.main',
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningAmberIcon />
              <Typography
                id="delete-board-modal-title"
                variant="h6"
                component="h2"
                fontWeight="bold"
              >
                Delete Board
              </Typography>
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ p: 3 }}>
            <Typography
              id="delete-board-modal-description"
              variant="body1"
              sx={{ mb: 2, color: 'text.primary' }}
            >
              Are you sure you want to delete the board
            </Typography>
            
            <Typography
              variant="h6"
              sx={{ 
                mb: 2, 
                fontWeight: 'bold',
                color: 'error.main',
                textAlign: 'center',
                p: 2,
                bgcolor: 'error.light',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'error.main'
              }}
            >
              "{board?.title || 'Unknown Board'}"
            </Typography>

            <Typography
              variant="body2"
              sx={{ 
                mb: 3, 
                color: 'text.secondary',
                fontStyle: 'italic'
              }}
            >
              ⚠️ This action cannot be undone. All columns, cards, and attachments will be permanently deleted.
            </Typography>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'flex-end',
                mt: 3
              }}
            >
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={isLoading}
                startIcon={<CancelIcon />}
                sx={{
                  minWidth: 100,
                  borderColor: 'grey.400',
                  color: 'grey.700',
                  '&:hover': {
                    borderColor: 'grey.600',
                    bgcolor: 'grey.50'
                  }
                }}
              >
                Cancel
              </Button>
              
              <Button
                variant="contained"
                color="error"
                onClick={handleConfirm}
                disabled={isLoading}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <DeleteForeverIcon />
                  )
                }
                sx={{
                  minWidth: 120,
                  bgcolor: 'error.main',
                  '&:hover': {
                    bgcolor: 'error.dark'
                  },
                  '&:disabled': {
                    bgcolor: 'error.light'
                  }
                }}
              >
                {isLoading ? 'Deleting...' : 'Delete Board'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default DeleteBoardModal 