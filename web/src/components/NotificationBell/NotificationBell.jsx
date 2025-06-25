import { useState, useEffect, useRef, useCallback } from 'react'
import { Badge, IconButton, Tooltip, Box, Typography, Popover, List, ListItem, Divider } from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import PersonIcon from '@mui/icons-material/Person'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { useSelector } from 'react-redux'
import { socketIoInstance } from '~/socketClient'
import { selectCurrentUser } from '~/redux/user/userSlice'

function NotificationBell({ boardId, onNotification }) {
  const [isShaking, setIsShaking] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [isConnected, setIsConnected] = useState(true)
  const [anchorEl, setAnchorEl] = useState(null)
  const shakeTimeoutRef = useRef(null)
  const debounceTimeoutRef = useRef(null)
  const cleanupIntervalRef = useRef(null)
  
  // Get current user to filter notifications
  const currentUser = useSelector(selectCurrentUser)

  // Storage key for notifications
  const getStorageKey = () => `notifications_${boardId}_${currentUser?._id}`

  // Load notifications from localStorage
  const loadNotifications = useCallback(() => {
    try {
      const storageKey = getStorageKey()
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsedNotifications = JSON.parse(stored)
        // Filter notifications within 1 hour
        const oneHourAgo = Date.now() - (60 * 60 * 1000)
        const validNotifications = parsedNotifications.filter(
          notification => new Date(notification.timestamp).getTime() > oneHourAgo
        )
        setNotifications(validNotifications)
        
        // Update localStorage with filtered notifications
        if (validNotifications.length !== parsedNotifications.length) {
          localStorage.setItem(storageKey, JSON.stringify(validNotifications))
        }
        
        return validNotifications
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
    return []
  }, [boardId, currentUser?._id])

  // Save notifications to localStorage
  const saveNotifications = useCallback((notificationsList) => {
    try {
      const storageKey = getStorageKey()
      localStorage.setItem(storageKey, JSON.stringify(notificationsList))
    } catch (error) {
      console.error('Error saving notifications:', error)
    }
  }, [boardId, currentUser?._id])

  // Add new notification
  const addNotification = useCallback((notificationData) => {
    const newNotification = {
      id: Date.now() + Math.random(), // Unique ID
      ...notificationData,
      timestamp: notificationData.timestamp || new Date().toISOString(),
      isRead: false
    }

    setNotifications(prev => {
      const updated = [newNotification, ...prev]
      saveNotifications(updated)
      return updated
    })

    return newNotification
  }, [saveNotifications])

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => {
      const updated = prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
      saveNotifications(updated)
      return updated
    })
  }, [saveNotifications])

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(notification => ({ ...notification, isRead: true }))
      saveNotifications(updated)
      return updated
    })
  }, [saveNotifications])

  // Format timestamp cho hiển thị
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    
    // Nếu cùng ngày, chỉ hiển thị giờ
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
    
    // Nếu khác ngày, hiển thị ngày + giờ
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit', 
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Format relative time (VD: "5 phút trước")
  const formatRelativeTime = (timestamp) => {
    const now = Date.now()
    const diff = now - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (minutes < 1) return 'Vừa xong'
    if (minutes < 60) return `${minutes} phút trước`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} giờ trước`
    
    return formatTimestamp(timestamp)
  }

  // Debounced trigger shake animation to prevent rapid notifications
  const triggerShake = useCallback((notificationData) => {
    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Debounce rapid notifications (500ms)
    debounceTimeoutRef.current = setTimeout(() => {
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current)
      }

      // Add notification to history
      addNotification(notificationData)

      setIsShaking(true)

      // Reset shake animation after duration
      shakeTimeoutRef.current = setTimeout(() => {
        setIsShaking(false)
      }, 600) // 0.6s match với CSS animation duration
    }, 500)
  }, [addNotification])

  // Handle bell click to show notification history
  const handleBellClick = (event) => {
    setAnchorEl(event.currentTarget)
    // Mark all as read when opened
    markAllAsRead()
  }

  // Close notification popover
  const handleClosePopover = () => {
    setAnchorEl(null)
  }

  // Auto-cleanup old notifications every 5 minutes
  useEffect(() => {
    cleanupIntervalRef.current = setInterval(() => {
      loadNotifications() // This will auto-filter old notifications
    }, 5 * 60 * 1000) // 5 minutes

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current)
      }
    }
  }, [loadNotifications])

  // Load notifications on component mount
  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // Socket connection monitoring và event handlers
  useEffect(() => {
    if (!boardId || !socketIoInstance || !currentUser?._id) return

    const handleColumnCreated = (data) => {
      try {
        console.log('🔔 NotificationBell: Column created event received (all members):', {
          boardId: data.boardId,
          currentBoard: boardId,
          isTargetBoard: data.boardId === boardId,
          userInfo: data.userInfo,
          currentUser: currentUser.displayName,
          isFromCurrentUser: data.userInfo?._id === currentUser._id
        })
        
        // Show notification for ALL members in the correct board
        // This ensures complete synchronization and consistent UX
        if (data.boardId === boardId && data.userInfo) {
          console.log('🔔 NotificationBell: Processing notification for all members', {
            columnTitle: data.columnTitle,
            createdBy: data.userInfo?.displayName,
            currentUser: currentUser.displayName,
            isCurrentUser: data.userInfo._id === currentUser._id,
            fullData: data
          })
          
          // Enhanced fallback logic
          const userName = data.userInfo?.displayName || 
                          data.userInfo?.username || 
                          'Người dùng không xác định'
          
          const columnName = data.columnTitle || 
                           data.title || 
                           'cột không có tên'
          
          // Different notification text for actor vs observers
          const isCurrentUser = data.userInfo._id === currentUser._id
          const notificationText = isCurrentUser
            ? `Bạn đã tạo cột '${columnName}'`
            : `${userName} đã tạo cột '${columnName}'`
          
          console.log('🔔 NotificationBell: Notification for all members:', {
            userName,
            columnName,
            isCurrentUser,
            notificationText,
            timestamp: data.timestamp
          })
          
          // Trigger shake with notification data for all members
          triggerShake({
            type: 'COLUMN_CREATED',
            userName,
            columnName,
            notificationText,
            isCurrentUser,
            timestamp: data.timestamp || new Date().toISOString(),
            userAvatar: data.userInfo?.avatar,
            originalData: data // For debugging
          })
        } else {
          console.log('🔔 NotificationBell: Event ignored:', {
            reason: data.boardId !== boardId ? 'Different board' : 'Missing user info'
          })
        }
      } catch (error) {
        console.error('🔔 NotificationBell: Error handling column created event:', error)
      }
    }

    // Handle column deletion with Universal Notifications pattern
    const handleColumnDeleted = (data) => {
      try {
        console.log('🗑️ NotificationBell: Column deleted event received (all members):', {
          boardId: data.boardId,
          currentBoard: boardId,
          isTargetBoard: data.boardId === boardId,
          userInfo: data.userInfo,
          currentUser: currentUser.displayName,
          isFromCurrentUser: data.userInfo?._id === currentUser._id
        })
        
        // Show notification for ALL members in the correct board
        // This ensures complete synchronization and consistent UX for delete actions
        if (data.boardId === boardId && data.userInfo) {
          console.log('🗑️ NotificationBell: Processing delete notification for all members', {
            columnTitle: data.columnTitle,
            deletedBy: data.userInfo?.displayName,
            currentUser: currentUser.displayName,
            isCurrentUser: data.userInfo._id === currentUser._id,
            fullData: data
          })
          
          // Enhanced fallback logic
          const userName = data.userInfo?.displayName || 
                          data.userInfo?.username || 
                          'Người dùng không xác định'
          
          const columnName = data.columnTitle || 
                           data.title || 
                           'cột không có tên'
          
          // Different notification text for actor vs observers in delete action
          const isCurrentUser = data.userInfo._id === currentUser._id
          const notificationText = isCurrentUser
            ? `Bạn đã xóa cột '${columnName}'`
            : `${userName} đã xóa cột '${columnName}'`
          
          console.log('🗑️ NotificationBell: Delete notification for all members:', {
            userName,
            columnName,
            isCurrentUser,
            notificationText,
            timestamp: data.timestamp
          })
          
          // Trigger shake with delete notification data for all members
          triggerShake({
            type: 'COLUMN_DELETED',
            userName,
            columnName,
            notificationText,
            isCurrentUser,
            timestamp: data.timestamp || new Date().toISOString(),
            userAvatar: data.userInfo?.avatar,
            originalData: data // For debugging
          })
        } else {
          console.log('🗑️ NotificationBell: Delete event ignored:', {
            reason: data.boardId !== boardId ? 'Different board' : 'Missing user info'
          })
        }
      } catch (error) {
        console.error('🗑️ NotificationBell: Error handling column deleted event:', error)
      }
    }

    // Handle column title update with Universal Notifications pattern
    const handleColumnTitleUpdated = (data) => {
      try {
        console.log('📝 NotificationBell: Column title updated event received (all members):', {
          boardId: data.boardId,
          currentBoard: boardId,
          isTargetBoard: data.boardId === boardId,
          userInfo: data.userInfo,
          currentUser: currentUser.displayName,
          isFromCurrentUser: data.userInfo?._id === currentUser._id
        })
        
        // Show notification for ALL members in the correct board
        // This ensures complete synchronization and consistent UX for title update actions
        if (data.boardId === boardId && data.userInfo) {
          console.log('📝 NotificationBell: Processing title update notification for all members', {
            oldTitle: data.oldTitle,
            newTitle: data.newTitle,
            updatedBy: data.userInfo?.displayName,
            currentUser: currentUser.displayName,
            isCurrentUser: data.userInfo._id === currentUser._id,
            fullData: data
          })
          
          // Enhanced fallback logic
          const userName = data.userInfo?.displayName || 
                          data.userInfo?.username || 
                          'Người dùng không xác định'
          
          const oldTitle = data.oldTitle || 'cột không có tên'
          const newTitle = data.newTitle || 'cột không có tên'
          
          // Different notification text for actor vs observers in title update action
          const isCurrentUser = data.userInfo._id === currentUser._id
          const notificationText = isCurrentUser
            ? `Bạn đã đổi tên cột từ '${oldTitle}' thành '${newTitle}'`
            : `${userName} đã đổi tên cột từ '${oldTitle}' thành '${newTitle}'`
          
          console.log('📝 NotificationBell: Title update notification for all members:', {
            userName,
            titleChange: `${oldTitle} → ${newTitle}`,
            isCurrentUser,
            notificationText,
            timestamp: data.timestamp
          })
          
          // Trigger shake with title update notification data for all members
          triggerShake({
            type: 'COLUMN_TITLE_UPDATED',
            userName,
            oldTitle,
            newTitle,
            notificationText,
            isCurrentUser,
            timestamp: data.timestamp || new Date().toISOString(),
            userAvatar: data.userInfo?.avatar,
            originalData: data // For debugging
          })
        } else {
          console.log('📝 NotificationBell: Title update event ignored:', {
            reason: data.boardId !== boardId ? 'Different board' : 'Missing user info'
          })
        }
      } catch (error) {
        console.error('📝 NotificationBell: Error handling column title updated event:', error)
      }
    }

    // Socket connection event handlers
    const handleConnect = () => {
      console.log('🔔 NotificationBell: Socket connected')
      setIsConnected(true)
    }

    const handleDisconnect = () => {
      console.log('🔔 NotificationBell: Socket disconnected')
      setIsConnected(false)
    }

    const handleReconnect = () => {
      console.log('🔔 NotificationBell: Socket reconnected')
      setIsConnected(true)
      // Rejoin board room after reconnection
      socketIoInstance.emit('joinBoard', boardId)
    }

    console.log(`🔔 NotificationBell: Setting up listener for board ${boardId}, user ${currentUser.displayName}`)

    // Listen to socket events
    socketIoInstance.on('connect', handleConnect)
    socketIoInstance.on('disconnect', handleDisconnect)
    socketIoInstance.on('reconnect', handleReconnect)
    socketIoInstance.on('BE_COLUMN_CREATED', handleColumnCreated)
    socketIoInstance.on('BE_COLUMN_DELETED', handleColumnDeleted)
    socketIoInstance.on('BE_COLUMN_UPDATED', handleColumnTitleUpdated)

    // Check initial connection state
    setIsConnected(socketIoInstance.connected)

    // Cleanup
    return () => {
      console.log(`🔔 NotificationBell: Cleaning up listener for board ${boardId}`)
      socketIoInstance.off('connect', handleConnect)
      socketIoInstance.off('disconnect', handleDisconnect)
      socketIoInstance.off('reconnect', handleReconnect)
      socketIoInstance.off('BE_COLUMN_CREATED', handleColumnCreated)
      socketIoInstance.off('BE_COLUMN_DELETED', handleColumnDeleted)
      socketIoInstance.off('BE_COLUMN_UPDATED', handleColumnTitleUpdated)
      
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current)
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [boardId, currentUser?._id, triggerShake])

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.isRead).length
  const hasUnreadNotifications = unreadCount > 0

  // Accessibility: Screen reader announcements
  const getAriaLabel = () => {
    if (!isConnected) return 'Thông báo - Mất kết nối'
    if (hasUnreadNotifications) {
      return `Thông báo - ${unreadCount} thông báo mới`
    }
    return `Thông báo - ${notifications.length} thông báo`
  }

  const getTooltipTitle = () => {
    if (!isConnected) return 'Mất kết nối socket'
    if (hasUnreadNotifications) {
      return `${unreadCount} thông báo mới`
    }
    return `${notifications.length} thông báo`
  }

  const open = Boolean(anchorEl)

  return (
    <>
      <Tooltip title={getTooltipTitle()}>
        <IconButton
          onClick={handleBellClick}
          className={isShaking ? 'notification-bell-shake' : ''}
          aria-label={getAriaLabel()}
          aria-live="polite"
          role="button"
          disabled={!isConnected}
          sx={{
            color: !isConnected 
              ? 'rgba(255, 255, 255, 0.3)' 
              : hasUnreadNotifications 
                ? '#ff9800' 
                : 'rgba(255, 255, 255, 0.7)',
            transition: 'color 0.3s ease, opacity 0.3s ease',
            opacity: !isConnected ? 0.5 : 1,
            '&:hover': {
              color: !isConnected 
                ? 'rgba(255, 255, 255, 0.3)'
                : hasUnreadNotifications 
                  ? '#f57c00' 
                  : 'white',
              backgroundColor: !isConnected 
                ? 'transparent' 
                : 'rgba(255, 255, 255, 0.1)'
            },
            '&.notification-bell-shake': {
              transformOrigin: 'center center'
            },
            '&:disabled': {
              color: 'rgba(255, 255, 255, 0.3)'
            }
          }}
        >
          <Badge
            badgeContent={hasUnreadNotifications ? unreadCount : 0}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: '#ff5722',
                color: '#ffffff',
                fontSize: '0.7rem',
                minWidth: '16px',
                height: '16px'
              }
            }}
          >
            {hasUnreadNotifications && isConnected ? (
              <NotificationsActiveIcon fontSize="small" />
            ) : (
              <NotificationsIcon fontSize="small" />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Notification History Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 320,
            maxWidth: 400,
            maxHeight: 500,
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            color: '#ff9800',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            🔔 Thông báo ({notifications.length})
          </Typography>
          <Typography variant="caption" sx={{ 
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            Lịch sử trong 1 giờ qua
          </Typography>
        </Box>
        
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ 
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                Chưa có thông báo nào
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <Box key={notification.id}>
                  <ListItem sx={{ 
                    py: 2, 
                    px: 2,
                    backgroundColor: notification.isRead 
                      ? 'transparent' 
                      : notification.type === 'COLUMN_DELETED'
                        ? 'rgba(255, 152, 0, 0.15)' // Orange for delete actions
                        : notification.type === 'COLUMN_TITLE_UPDATED'
                          ? 'rgba(33, 150, 243, 0.15)' // Blue for title update actions
                          : 'rgba(255, 152, 0, 0.1)', // Default orange
                    borderLeft: notification.isRead 
                      ? 'none'
                      : notification.type === 'COLUMN_DELETED'
                        ? '3px solid #ff9800' // Orange border for delete actions
                        : notification.type === 'COLUMN_TITLE_UPDATED'
                          ? '3px solid #2196f3' // Blue border for title update actions
                          : '3px solid #ff9800' // Default orange border
                  }}>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {/* Visual distinction for different notification types */}
                        {notification.type === 'COLUMN_DELETED' ? (
                          // Delete action icon with appropriate color
                          <Box sx={{ 
                            fontSize: '16px',
                            color: notification.isCurrentUser ? '#4caf50' : '#ff9800',
                          }}>
                            {notification.isCurrentUser ? '✅' : '🗑️'}
                          </Box>
                        ) : notification.type === 'COLUMN_TITLE_UPDATED' ? (
                          // Title update action icon with appropriate color
                          <Box sx={{ 
                            fontSize: '16px',
                            color: notification.isCurrentUser ? '#4caf50' : '#2196f3',
                          }}>
                            {notification.isCurrentUser ? '✅' : '📝'}
                          </Box>
                        ) : (
                          // Default person icon for other actions  
                          <PersonIcon sx={{ 
                            fontSize: '16px', 
                            color: notification.isCurrentUser ? '#4caf50' : '#3498db'
                          }} />
                        )}
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600,
                          color: notification.type === 'COLUMN_DELETED' 
                            ? (notification.isCurrentUser ? '#4caf50' : '#ff9800')
                            : notification.type === 'COLUMN_TITLE_UPDATED'
                              ? (notification.isCurrentUser ? '#4caf50' : '#2196f3')
                              : (notification.isCurrentUser ? '#4caf50' : '#3498db')
                        }}>
                          {notification.isCurrentUser ? 'Bạn' : notification.userName}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" sx={{ 
                        mb: 1,
                        lineHeight: 1.4,
                        color: 'white'
                      }}>
                        {notification.notificationText || `đã tạo cột "${notification.columnName}"`}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon sx={{ 
                          fontSize: '14px', 
                          color: 'rgba(255, 255, 255, 0.6)' 
                        }} />
                        <Typography variant="caption" sx={{ 
                          color: 'rgba(255, 255, 255, 0.6)'
                        }}>
                          {formatRelativeTime(notification.timestamp)} • {formatTimestamp(notification.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                  {index < notifications.length - 1 && (
                    <Divider sx={{ 
                      borderColor: 'rgba(255, 255, 255, 0.1)' 
                    }} />
                  )}
                </Box>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  )
}

export default NotificationBell 