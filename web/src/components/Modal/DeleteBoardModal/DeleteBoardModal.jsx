import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
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
  
  // State cho confirmation input
  const [confirmationText, setConfirmationText] = useState('')
  const [isConfirmationValid, setIsConfirmationValid] = useState(false)
  
  const boardTitle = board?.title || ''

  // Modal styles
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: isMobile ? '90%' : 500,  // Tăng độ rộng để chứa thêm nội dung
    maxWidth: '95vw',
    maxHeight: '90vh',
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 0,
    outline: 'none',
    overflow: 'hidden'
  }

  // Reset confirmation text khi modal mở/đóng
  useEffect(() => {
    if (isOpen) {
      setConfirmationText('')
      setIsConfirmationValid(false)
    }
  }, [isOpen])

  // Validate confirmation text
  useEffect(() => {
    const isValid = confirmationText.trim() === boardTitle.trim()
    setIsConfirmationValid(isValid)
  }, [confirmationText, boardTitle])

  const handleConfirm = () => {
    if (onConfirm && !isLoading && isConfirmationValid) {
      onConfirm()
    }
  }

  const handleCancel = () => {
    if (onClose && !isLoading) {
      onClose()
    }
  }

  const handleConfirmationTextChange = (event) => {
    setConfirmationText(event.target.value)
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
                Xóa Board
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
              Bạn có chắc chắn muốn xóa board
            </Typography>
            
            <Typography
              variant="h6"
              sx={{ 
                mb: 2, 
                fontWeight: 'bold',
                color: '#000000',  // Font chữ đen để làm nổi bật
                textAlign: 'center',
                p: 2,
                bgcolor: 'error.light',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'error.main'
              }}
            >
              "{board?.title || 'Board không xác định'}"
            </Typography>

            <Typography
              variant="body2"
              sx={{ 
                mb: 3, 
                color: 'text.secondary',
                fontStyle: 'italic'
              }}
            >
              ⚠️ Hành động này không thể hoàn tác. Tất cả các cột, thẻ và tệp đính kèm sẽ bị xóa vĩnh viễn.
            </Typography>

            {/* Confirmation Text Input */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                sx={{ 
                  mb: 1, 
                  color: 'text.primary',
                  fontWeight: 'medium'
                }}
              >
                Để xác nhận, hãy gõ tên board <strong>"{boardTitle}"</strong> vào ô bên dưới:
              </Typography>
              
              <TextField
                fullWidth
                variant="outlined"
                placeholder={`Gõ "${boardTitle}" để xác nhận`}
                value={confirmationText}
                onChange={handleConfirmationTextChange}
                disabled={isLoading}
                error={confirmationText.length > 0 && !isConfirmationValid}
                helperText={
                  confirmationText.length > 0 && !isConfirmationValid
                    ? 'Tên board không khớp. Vui lòng gõ chính xác.'
                    : isConfirmationValid
                    ? '✓ Tên board đã khớp'
                    : ''
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-error': {
                      '& fieldset': {
                        borderColor: 'error.main',
                      },
                    },
                    '&.Mui-focused': {
                      '& fieldset': {
                        borderColor: isConfirmationValid ? 'success.main' : 'primary.main',
                      },
                    },
                  },
                  '& .MuiFormHelperText-root': {
                    color: isConfirmationValid ? 'success.main' : 'error.main',
                    fontWeight: isConfirmationValid ? 'medium' : 'normal'
                  }
                }}
                autoFocus
              />
            </Box>

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
                Hủy
              </Button>
              
              <Button
                variant="contained"
                color="error"
                onClick={handleConfirm}
                disabled={isLoading || !isConfirmationValid}
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
                    bgcolor: isConfirmationValid ? 'error.dark' : 'error.main'
                  },
                  '&:disabled': {
                    bgcolor: 'error.light',
                    opacity: isConfirmationValid ? 0.7 : 0.3
                  }
                }}
              >
                {isLoading ? 'Đang xóa...' : 'Xóa Board'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default DeleteBoardModal 