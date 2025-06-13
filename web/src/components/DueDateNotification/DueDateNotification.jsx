import { forwardRef } from 'react'
import {
  Alert,
  AlertTitle,
  Box,
  Chip,
  Typography,
  IconButton
} from '@mui/material'
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  Close,
  WatchLaterOutlined
} from '@mui/icons-material'
import {
  getDueDateStatus,
  formatDueDateDisplay,
  getDueDateColors,
  getUrgencyText
} from '~/utils/dueDateConstants'

/**
 * Enhanced Due Date Notification Component
 */
const DueDateNotification = forwardRef(({
  type = 'success',
  title,
  message,
  cardTitle,
  oldDueDate,
  newDueDate,
  onClose,
  showDetails = true,
  ...props
}, ref) => {
  const getIcon = () => {
    switch (type) {
    case 'success': return <CheckCircle />
    case 'error': return <Error />
    case 'warning': return <Warning />
    default: return <Info />
    }
  }

  const getSeverity = () => {
    switch (type) {
    case 'success': return 'success'
    case 'error': return 'error'
    case 'warning': return 'warning'
    default: return 'info'
    }
  }

  return (
    <Alert
      ref={ref}
      severity={getSeverity()}
      icon={getIcon()}
      action={
        onClose && (
          <IconButton size="small" onClick={onClose}>
            <Close fontSize="inherit" />
          </IconButton>
        )
      }
      sx={{
        mb: 2,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
      {...props}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      <Typography variant="body2">{message}</Typography>

      {showDetails && cardTitle && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            📝 {cardTitle}
          </Typography>
        </Box>
      )}
    </Alert>
  )
})

DueDateNotification.displayName = 'DueDateNotification'
export default DueDateNotification