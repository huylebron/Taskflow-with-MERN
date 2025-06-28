import { useState, useEffect, useRef, useCallback } from 'react'
import { Badge, IconButton, Tooltip, Box, Typography, Popover, List, ListItem, Divider } from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import PersonIcon from '@mui/icons-material/Person'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { useSelector } from 'react-redux'
import { socketIoInstance } from '~/socketClient'
import { selectCurrentUser } from '~/redux/user/userSlice'

function CardNotificationBell({ cardId, boardId, onNotification }) {
  const [isShaking, setIsShaking] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [isConnected, setIsConnected] = useState(true)
  const [anchorEl, setAnchorEl] = useState(null)
  const shakeTimeoutRef = useRef(null)
  const debounceTimeoutRef = useRef(null)
  const cleanupIntervalRef = useRef(null)
  
  // Get current user to filter notifications
  const currentUser = useSelector(selectCurrentUser)

  // Storage key for card-specific notifications
  const getStorageKey = () => `card_notifications_${cardId}_${currentUser?._id}`

  // Load notifications from localStorage
  const loadNotifications = useCallback(() => {
    try {
      const storageKey = getStorageKey()
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsedNotifications = JSON.parse(stored)
        // Filter notifications within 3 days (shorter than board notifications)
        const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000)
        const validNotifications = parsedNotifications.filter(
          notification => new Date(notification.timestamp).getTime() > threeDaysAgo
        )
        setNotifications(validNotifications)
        
        // Update localStorage with filtered notifications
        if (validNotifications.length !== parsedNotifications.length) {
          localStorage.setItem(storageKey, JSON.stringify(validNotifications))
        }
        
        return validNotifications
      }
    } catch (error) {
      console.error('Error loading card notifications:', error)
    }
    return []
  }, [cardId, currentUser?._id])

  // Save notifications to localStorage
  const saveNotifications = useCallback((notificationsList) => {
    try {
      const storageKey = getStorageKey()
      localStorage.setItem(storageKey, JSON.stringify(notificationsList))
    } catch (error) {
      console.error('Error saving card notifications:', error)
    }
  }, [cardId, currentUser?._id])

  // Add new notification
  const addNotification = useCallback((notificationData) => {
    const newNotification = {
      id: Date.now() + Math.random(), // Unique ID
      ...notificationData,
      timestamp: notificationData.timestamp || new Date().toISOString(),
      isRead: false,
      cardId: cardId
    }

    setNotifications(prev => {
      const updated = [newNotification, ...prev]
      saveNotifications(updated)
      return updated
    })

    return newNotification
  }, [saveNotifications, cardId])

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
    
    const days = Math.floor(hours / 24)
    if (days < 3) return `${days} ngày trước`
    
    return formatTimestamp(timestamp)
  }

  // Debounced trigger shake animation to prevent rapid notifications
  const triggerShake = useCallback((notificationData) => {
    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Debounce rapid notifications (300ms for card-level)
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
      }, 400) // 0.4s shorter than board notifications
    }, 300)
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

  // Auto-cleanup old notifications every 3 minutes
  useEffect(() => {
    cleanupIntervalRef.current = setInterval(() => {
      loadNotifications() // This will auto-filter old notifications
    }, 3 * 60 * 1000) // 3 minutes

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

  // Socket connection monitoring và event handlers cho card-specific events
  useEffect(() => {
    if (!cardId || !boardId || !socketIoInstance || !currentUser?._id) return

    // Card-specific event handlers
    const handleCardCommentAdded = (data) => {
      if (data.cardId !== cardId) return // Only process events for this card
      
      const userName = data.userInfo?.displayName || 'Người dùng'
      const isCurrentUser = data.userInfo?._id === currentUser?._id
      
      if (!isCurrentUser) {
        const notificationData = {
          type: 'CARD_COMMENT_ADDED',
          title: '💬 Bình luận mới',
          message: `${userName} đã thêm bình luận vào thẻ này`,
          userInfo: data.userInfo,
          timestamp: data.timestamp,
          data: data
        }

        triggerShake(notificationData)

        // Callback to parent component if provided
        if (onNotification) {
          onNotification(notificationData)
        }
      }
    }

    const handleCardMemberUpdated = (data) => {
      if (data.cardId !== cardId) return // Only process events for this card
      
      const userName = data.userInfo?.displayName || 'Người dùng'
      const targetUserName = data.targetUser?.displayName || 'thành viên'
      const isCurrentUser = data.userInfo?._id === currentUser?._id
      const isCurrentUserTarget = data.targetUser?._id === currentUser?._id
      
      if (!isCurrentUser && !isCurrentUserTarget) {
        const action = data.action === 'ADD' ? 'thêm' : 'xóa'
        const preposition = data.action === 'ADD' ? 'vào' : 'khỏi'
        
        const notificationData = {
          type: 'CARD_MEMBER_UPDATED',
          title: '👥 Thành viên thay đổi',
          message: `${userName} đã ${action} ${targetUserName} ${preposition} thẻ này`,
          userInfo: data.userInfo,
          timestamp: data.timestamp,
          data: data
        }

        triggerShake(notificationData)

        if (onNotification) {
          onNotification(notificationData)
        }
      }
    }

    const handleCardUpdated = (data) => {
      if (data.cardId !== cardId) return // Only process events for this card
      
      const userName = data.userInfo?.displayName || 'Người dùng'
      const isCurrentUser = data.userInfo?._id === currentUser?._id
      
      if (!isCurrentUser) {
        let title = '📝 Thẻ được cập nhật'
        let message = `${userName} đã cập nhật thẻ này`
        
        // Specific messages based on update type
        if (data.updateType === 'title') {
          title = '✏️ Tiêu đề thay đổi'
          message = `${userName} đã đổi tiêu đề thẻ thành "${data.newTitle}"`
        } else if (data.updateType === 'description') {
          title = '📄 Mô tả cập nhật'
          message = `${userName} đã cập nhật mô tả thẻ`
        } else if (data.updateType === 'dueDate') {
          title = '⏰ Hạn hoàn thành thay đổi'
          message = `${userName} đã cập nhật hạn hoàn thành`
        } else if (data.updateType === 'cover') {
          title = '🖼️ Ảnh bìa thay đổi'
          message = `${userName} đã cập nhật ảnh bìa thẻ`
        }
        
        const notificationData = {
          type: 'CARD_UPDATED',
          title: title,
          message: message,
          userInfo: data.userInfo,
          timestamp: data.timestamp,
          data: data
        }

        triggerShake(notificationData)

        if (onNotification) {
          onNotification(notificationData)
        }
      }
    }

    const handleChecklistUpdated = (data) => {
      if (data.cardId !== cardId) return // Only process events for this card
      
      const userName = data.userInfo?.displayName || 'Người dùng'
      const isCurrentUser = data.userInfo?._id === currentUser?._id
      
      if (!isCurrentUser) {
        let title = '✅ Checklist cập nhật'
        let message = `${userName} đã cập nhật checklist`
        
        // Specific messages based on checklist action
        if (data.action === 'created') {
          title = '📋 Checklist mới'
          message = `${userName} đã tạo "${data.checklistName || 'checklist'}"`
        } else if (data.action === 'item_added') {
          title = '➕ Mục mới'
          message = `${userName} đã thêm "${data.itemName || 'mục'}" vào "${data.checklistName || 'checklist'}"`
        } else if (data.action === 'item_toggled') {
          const status = data.completed ? 'hoàn thành' : 'bỏ hoàn thành'
          title = data.completed ? '✅ Mục hoàn thành' : '🔄 Mục chưa hoàn thành'
          message = `${userName} đã ${status} "${data.itemName || 'mục'}" trong "${data.checklistName || 'checklist'}"`
        }
        
        const notificationData = {
          type: 'CARD_CHECKLIST_UPDATED',
          title: title,
          message: message,
          userInfo: data.userInfo,
          timestamp: data.timestamp,
          data: data
        }

        triggerShake(notificationData)

        if (onNotification) {
          onNotification(notificationData)
        }
      }
    }

    const handleCardCoverUpdated = (data) => {
      console.log('🔔 CardNotificationBell: Received BE_CARD_COVER_UPDATED:', {
        receivedCardId: data.cardId,
        expectedCardId: cardId,
        action: data.action,
        data: data
      })
      
      if (data.cardId !== cardId) {
        console.log('🔔 CardNotificationBell: Ignoring cover event - different card')
        return // Only process events for this card
      }
      
      console.log('🔔 CardNotificationBell: Processing card cover update for correct card')
      
      const userName = data.userInfo?.displayName || data.userInfo?.username || 'Người dùng'
      const isCurrentUser = data.userInfo?._id === currentUser?._id
      
      console.log('🔔 CardNotificationBell: Cover update details:', {
        userName,
        isCurrentUser,
        action: data.action,
        coverType: data.coverType
      })
      
      if (!isCurrentUser) {
        let title = '🖼️ Ảnh bìa thay đổi'
        let message = `${userName} đã cập nhật ảnh bìa thẻ`
        
        // Specific messages based on cover action
        if (data.action === 'UPDATE_COVER_COLOR') {
          const coverTypeText = data.coverType === 'gradient' ? 'gradient' : 'màu nền'
          title = '🎨 Ảnh bìa cập nhật'
          message = `${userName} đã thay đổi ảnh bìa thành ${coverTypeText}`
        } else if (data.action === 'UPLOAD_COVER_IMAGE') {
          title = '📷 Ảnh bìa mới'
          const fileName = data.fileName ? ` (${data.fileName})` : ''
          message = `${userName} đã tải lên ảnh bìa mới${fileName}`
        } else if (data.action === 'DELETE_COVER') {
          title = '🗑️ Ảnh bìa đã xóa'
          message = `${userName} đã xóa ảnh bìa thẻ`
        }
        
        const notificationData = {
          type: 'CARD_COVER_UPDATED',
          title: title,
          message: message,
          userInfo: data.userInfo,
          timestamp: data.timestamp,
          data: data
        }

        console.log('🔔 CardNotificationBell: Triggering shake for cover update:', notificationData)
        triggerShake(notificationData)

        if (onNotification) {
          onNotification(notificationData)
        }
      } else {
        console.log('🔔 CardNotificationBell: Skipping cover notification - current user is actor')
      }
    }

    const handleConnect = () => {
      setIsConnected(true)
    }

    const handleDisconnect = () => {
      setIsConnected(false)
    }

    const handleReconnect = () => {
      setIsConnected(true)
      // Reload notifications after reconnection
      loadNotifications()
    }

    // Register socket event listeners for card-specific events
    socketIoInstance.on('BE_NEW_COMMENT', handleCardCommentAdded)
    socketIoInstance.on('BE_CARD_MEMBER_UPDATED', handleCardMemberUpdated)
    socketIoInstance.on('BE_CARD_UPDATED', handleCardUpdated)
    socketIoInstance.on('BE_CARD_COVER_UPDATED', handleCardCoverUpdated)
    socketIoInstance.on('BE_CHECKLIST_CREATED', handleChecklistUpdated)
    socketIoInstance.on('BE_CHECKLIST_ITEM_ADDED', handleChecklistUpdated)
    socketIoInstance.on('BE_CHECKLIST_ITEM_TOGGLED', handleChecklistUpdated)
    socketIoInstance.on('connect', handleConnect)
    socketIoInstance.on('disconnect', handleDisconnect)
    socketIoInstance.on('reconnect', handleReconnect)

    return () => {
      // Cleanup event listeners
      socketIoInstance.off('BE_NEW_COMMENT', handleCardCommentAdded)
      socketIoInstance.off('BE_CARD_MEMBER_UPDATED', handleCardMemberUpdated)
      socketIoInstance.off('BE_CARD_UPDATED', handleCardUpdated)
      socketIoInstance.off('BE_CARD_COVER_UPDATED', handleCardCoverUpdated)
      socketIoInstance.off('BE_CHECKLIST_CREATED', handleChecklistUpdated)
      socketIoInstance.off('BE_CHECKLIST_ITEM_ADDED', handleChecklistUpdated)
      socketIoInstance.off('BE_CHECKLIST_ITEM_TOGGLED', handleChecklistUpdated)
      socketIoInstance.off('connect', handleConnect)
      socketIoInstance.off('disconnect', handleDisconnect)
      socketIoInstance.off('reconnect', handleReconnect)
      
      // Clear timeouts
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current)
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current)
      }
    }
  }, [cardId, boardId, currentUser?._id, triggerShake, onNotification, loadNotifications])

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length

  const getAriaLabel = () => {
    if (!isConnected) return 'Mất kết nối'
    if (unreadCount > 0) return `${unreadCount} thông báo mới cho thẻ này`
    return 'Không có thông báo mới cho thẻ này'
  }

  const getTooltipTitle = () => {
    if (!isConnected) return 'Mất kết nối'
    if (unreadCount > 0) return `${unreadCount} thông báo mới cho thẻ này`
    return 'Thông báo cho thẻ này'
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'CARD_COMMENT_ADDED':
        return '💬'
      case 'CARD_MEMBER_UPDATED':
        return '👥'
      case 'CARD_UPDATED':
        return '📝'
      case 'CARD_COVER_UPDATED':
        return '🖼️'
      case 'CARD_CHECKLIST_UPDATED':
        return '✅'
      default:
        return '🔔'
    }
  }

  const open = Boolean(anchorEl)
  const id = open ? 'card-notifications-popover' : undefined

  return (
    <>
      <Tooltip title={getTooltipTitle()}>
        <IconButton
          aria-label={getAriaLabel()}
          onClick={handleBellClick}
          size="small"
          sx={{
            color: (theme) => theme.palette.mode === 'dark' ? '#90caf9' : '#172b4d',
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
            border: '1px solid',
            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
            '&:hover': {
              backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
              borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'
            },
            animation: isShaking ? 'shake 0.4s ease-in-out' : 'none',
            '@keyframes shake': {
              '0%': { transform: 'translateX(0)' },
              '25%': { transform: 'translateX(-2px)' },
              '50%': { transform: 'translateX(2px)' },
              '75%': { transform: 'translateX(-2px)' },
              '100%': { transform: 'translateX(0)' }
            }
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.6rem',
                height: 16,
                minWidth: 16
              }
            }}
          >
            {isConnected ? (
              unreadCount > 0 ? 
                <NotificationsActiveIcon fontSize="small" /> : 
                <NotificationsIcon fontSize="small" />
            ) : (
              <NotificationsIcon fontSize="small" sx={{ opacity: 0.5 }} />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPaper-root': {
            mt: 1,
            borderRadius: 2,
            boxShadow: (theme) => theme.palette.mode === 'dark' 
              ? '0 8px 24px rgba(0, 0, 0, 0.4)' 
              : '0 8px 24px rgba(0, 0, 0, 0.1)',
            border: (theme) => theme.palette.mode === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid rgba(0, 0, 0, 0.05)'
          }
        }}
      >
        <Box sx={{ width: 320, maxHeight: 400 }}>
          <Box sx={{ 
            p: 2, 
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
              🔔 Thông báo thẻ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {notifications.length === 0 ? 'Chưa có thông báo nào' : `${notifications.length} thông báo gần đây`}
            </Typography>
          </Box>
          
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Không có thông báo nào cho thẻ này
              </Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: 280, overflow: 'auto', p: 0 }}>
              {notifications.map((notification, index) => (
                <Box key={notification.id}>
                  <ListItem 
                    sx={{ 
                      py: 1.5,
                      px: 2,
                      backgroundColor: notification.isRead ? 'transparent' : (theme) => 
                        theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'rgba(25, 118, 210, 0.04)',
                      borderLeft: notification.isRead ? 'none' : (theme) => 
                        `3px solid ${theme.palette.primary.main}`,
                      '&:hover': {
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                      }
                    }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Typography sx={{ fontSize: '1.2rem', mt: 0.25 }}>
                          {getTypeIcon(notification.type)}
                        </Typography>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: notification.isRead ? 400 : 600,
                              color: notification.isRead ? 'text.secondary' : 'text.primary',
                              lineHeight: 1.3,
                              mb: 0.5
                            }}
                          >
                            {notification.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              lineHeight: 1.4,
                              mb: 0.5,
                              wordBreak: 'break-word'
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                            <Typography variant="caption" color="text.disabled">
                              {formatRelativeTime(notification.timestamp)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  )
}

export default CardNotificationBell 