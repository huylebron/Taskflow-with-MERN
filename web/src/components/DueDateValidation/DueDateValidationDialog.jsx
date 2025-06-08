import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Alert,
  Chip,
  Stack,
  Divider
} from '@mui/material'
import {
  Warning,
  Error,
  Schedule,
  CalendarToday,
  CheckCircle
} from '@mui/icons-material'
import {
  getDueDateStatus,
  formatDueDateDisplay,
  getDueDateColors,
  getUrgencyText,
  DUE_DATE_STATUS
} from '~/utils/dueDateConstants'

/**
 * Due Date Validation Dialog Component
 * Provides user feedback and confirmation for due date operations
 */
const DueDateValidationDialog = ({
  open,
  onClose,
  onConfirm,
  onCancel,
  type = 'warning', // 'warning', 'error', 'info', 'success'
  title,
  message,
  cardTitle,
  currentDueDate,
  newDueDate,
  showComparison = true,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  severity = 'medium' // 'low', 'medium', 'high', 'critical'
}) => {
  const [isConfirming, setIsConfirming] = useState(false)

  // Get icon based on type
  const getDialogIcon = () => {
    switch (type) {
      case 'warning':
        return <Warning sx={{ color: '#f57c00', fontSize: '2rem' }} />
      case 'error':
        return <Error sx={{ color: '#d32f2f', fontSize: '2rem' }} />
      case 'success':
        return <CheckCircle sx={{ color: '#388e3c', fontSize: '2rem' }} />
      default:
        return <Schedule sx={{ color: '#1976d2', fontSize: '2rem' }} />
    }
  }

  // Get severity color scheme
  const getSeverityColors = () => {
    switch (severity) {
      case 'critical':
        return { primary: '#d32f2f', background: '#ffebee' }
      case 'high':
        return { primary: '#f57c00', background: '#fff8e1' }
      case 'medium':
        return { primary: '#1976d2', background: '#e3f2fd' }
      default:
        return { primary: '#757575', background: '#f5f5f5' }
    }
  }

  // Handle confirm action
  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      await onConfirm?.()
    } finally {
      setIsConfirming(false)
    }
  }

  // Handle cancel action
  const handleCancel = () => {
    onCancel?.()
    onClose?.()
  }

  // Render due date comparison
  const renderDueDateComparison = () => {
    if (!showComparison) return null

    const currentStatus = currentDueDate ? getDueDateStatus(currentDueDate) : null
    const newStatus = newDueDate ? getDueDateStatus(newDueDate) : null

    return (
      <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarToday fontSize="small" />
          So sánh deadline
        </Typography>
        
        <Stack spacing={2}>
          {/* Current Due Date */}
          {currentDueDate && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Deadline hiện tại:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Chip
                  icon={<Schedule />}
                  label={formatDueDateDisplay(currentDueDate)}
                  size="small"
                  sx={{
                    backgroundColor: currentStatus ? getDueDateColors(currentStatus).secondary : 'default',
                    color: currentStatus ? getDueDateColors(currentStatus).text : 'default'
                  }}
                />
                {currentStatus && (
                  <Typography variant="caption" color="text.secondary">
                    ({getUrgencyText(currentStatus)})
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {/* Arrow or separator */}
          {currentDueDate && newDueDate && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                ↓
              </Typography>
            </Box>
          )}

          {/* New Due Date */}
          {newDueDate ? (
            <Box>
              <Typography variant="caption" color="text.secondary">
                {currentDueDate ? 'Deadline mới:' : 'Thiết lập deadline:'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Chip
                  icon={<Schedule />}
                  label={formatDueDateDisplay(newDueDate)}
                  size="small"
                  sx={{
                    backgroundColor: newStatus ? getDueDateColors(newStatus).secondary : 'default',
                    color: newStatus ? getDueDateColors(newStatus).text : 'default',
                    fontWeight: 600,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                {newStatus && (
                  <Typography variant="caption" color="text.secondary">
                    ({getUrgencyText(newStatus)})
                  </Typography>
                )}
              </Box>
            </Box>
          ) : currentDueDate && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Hành động:
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label="Xóa deadline"
                  size="small"
                  variant="outlined"
                  sx={{ color: 'text.secondary' }}
                />
              </Box>
            </Box>
          )}
        </Stack>
      </Box>
    )
  }

  const severityColors = getSeverityColors()

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        backgroundColor: severityColors.background,
        borderBottom: `3px solid ${severityColors.primary}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {getDialogIcon()}
          <Box>
            <Typography variant="h6" component="div">
              {title || 'Xác nhận thay đổi deadline'}
            </Typography>
            {cardTitle && (
              <Typography variant="body2" color="text.secondary">
                Card: {cardTitle}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Main message */}
        <Typography variant="body1" gutterBottom>
          {message || 'Bạn có chắc chắn muốn thực hiện thay đổi này không?'}
        </Typography>

        {/* Warning or info alert */}
        {type === 'warning' && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Thay đổi này sẽ ảnh hưởng đến lịch trình và thông báo của card.
            </Typography>
          </Alert>
        )}

        {type === 'error' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Ngày được chọn có thể gây ra vấn đề với lịch trình hiện tại.
            </Typography>
          </Alert>
        )}

        {/* Due date comparison */}
        {renderDueDateComparison()}

        {/* Additional warnings based on new due date status */}
        {newDueDate && getDueDateStatus(newDueDate) === DUE_DATE_STATUS.OVERDUE && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">
              ⚠️ <strong>Cảnh báo:</strong> Deadline được chọn đã ở trong quá khứ. 
              Card sẽ được đánh dấu là quá hạn ngay lập tức.
            </Typography>
          </Alert>
        )}

        {newDueDate && getDueDateStatus(newDueDate) === DUE_DATE_STATUS.DUE_SOON && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              🔔 <strong>Lưu ý:</strong> Deadline được chọn trong vòng 24 giờ tới. 
              Bạn sẽ nhận được thông báo nhắc nhở.
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={handleCancel}
          variant="outlined"
          disabled={isConfirming}
          sx={{ minWidth: 100 }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={isConfirming}
          sx={{
            minWidth: 100,
            backgroundColor: severityColors.primary,
            '&:hover': {
              backgroundColor: severityColors.primary,
              opacity: 0.9
            }
          }}
        >
          {isConfirming ? 'Đang xử lý...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DueDateValidationDialog 