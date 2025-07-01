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
        // Filter notifications within 7 days
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
        const validNotifications = parsedNotifications.filter(
          notification => new Date(notification.timestamp).getTime() > sevenDaysAgo
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
    
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} ngày trước`
    
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

    // Handle card completed status change with Universal Notifications pattern
    const handleCardCompleted = (data) => {
      try {
        console.log('✅ NotificationBell: Card completed status event received (all members):', {
          boardId: data.boardId,
          currentBoard: boardId,
          isTargetBoard: data.boardId === boardId,
          userInfo: data.userInfo,
          currentUser: currentUser.displayName,
          isFromCurrentUser: data.userInfo?._id === currentUser._id
        })

        // Show notification for ALL members in the correct board
        if (data.boardId === boardId && data.userInfo) {
          const userName = data.userInfo?.displayName || data.userInfo?.username || 'Người dùng không xác định'
          const cardTitle = data.cardTitle || 'thẻ không có tên'
          const actionText = data.isCardCompleted ? 'hoàn thành' : 'bỏ hoàn thành'
          const isCurrentUser = data.userInfo._id === currentUser._id
          const notificationText = isCurrentUser
            ? `Bạn đã ${actionText} thẻ '${cardTitle}'`
            : `${userName} đã ${actionText} thẻ '${cardTitle}'`

          console.log('✅ NotificationBell: Card completed notification for all members:', {
            userName,
            cardTitle,
            isCurrentUser,
            notificationText,
            timestamp: data.timestamp
          })

          // Trigger shake with card completed notification data for all members
          triggerShake({
            type: 'CARD_COMPLETED',
            userName,
            cardTitle,
            isCardCompleted: data.isCardCompleted,
            notificationText,
            isCurrentUser,
            timestamp: data.timestamp || new Date().toISOString(),
            userAvatar: data.userInfo?.avatar,
            originalData: data
          })
        } else {
          console.log('✅ NotificationBell: Card completed event ignored:', {
            reason: data.boardId !== boardId ? 'Different board' : 'Missing user info'
          })
        }
      } catch (error) {
        console.error('✅ NotificationBell: Error handling card completed event:', error)
      }
    }

    // Handle card movement between columns with Universal Notifications pattern
    const handleCardMoved = (data) => {
      try {
        console.log('🔄 NotificationBell: Card movement event received (all members):', {
          boardId: data.boardId,
          currentBoard: boardId,
          isTargetBoard: data.boardId === boardId,
          userInfo: data.userInfo,
          currentUser: currentUser.displayName,
          isFromCurrentUser: data.userInfo?._id === currentUser._id,
          cardMovement: `${data.cardTitle}: ${data.fromColumnTitle} → ${data.toColumnTitle}`
        })

        if (data.boardId === boardId && data.userInfo) {
          const isCurrentUser = data.userInfo._id === currentUser._id
          const userName = data.userInfo.displayName || data.userInfo.username || 'Unknown User'
          const cardTitle = data.cardTitle || 'Untitled Card'
          const fromColumn = data.fromColumnTitle || 'Unknown Column'
          const toColumn = data.toColumnTitle || 'Unknown Column'
          
          // Message format for notification bell
          const notificationText = isCurrentUser
            ? `Bạn đã di chuyển '${cardTitle}' từ '${fromColumn}' sang '${toColumn}'`
            : `${userName} đã di chuyển '${cardTitle}' từ '${fromColumn}' sang '${toColumn}'`

          console.log('🔄 NotificationBell: Card movement notification for all members:', {
            userName,
            cardMovement: `${fromColumn} → ${toColumn}`,
            isCurrentUser,
            notificationText,
            timestamp: data.timestamp
          })
          
          // Trigger shake with card movement notification data for all members
          triggerShake({
            type: 'CARD_MOVED',
            userName,
            cardTitle,
            fromColumnTitle: fromColumn,
            toColumnTitle: toColumn,
            notificationText,
            isCurrentUser,
            timestamp: data.timestamp || new Date().toISOString(),
            userAvatar: data.userInfo?.avatar,
            originalData: data // For debugging
          })
        } else {
          console.log('🔄 NotificationBell: Card movement event ignored:', {
            reason: data.boardId !== boardId ? 'Different board' : 'Missing user info'
          })
        }
      } catch (error) {
        console.error('🔄 NotificationBell: Error handling card movement event:', error)
      }
    }

    // Handle card cover updates with Universal Notifications pattern
    const handleCardCoverUpdated = (data) => {
      try {
        console.log('🖼️ NotificationBell: Card cover updated event received (all members):', {
          boardId: data.boardId,
          currentBoard: boardId,
          isTargetBoard: data.boardId === boardId,
          userInfo: data.userInfo,
          currentUser: currentUser.displayName,
          isFromCurrentUser: data.userInfo?._id === currentUser._id,
          cardTitle: data.cardTitle,
          action: data.action
        })

        if (data.boardId === boardId && data.userInfo) {
          const isCurrentUser = data.userInfo._id === currentUser._id
          const userName = data.userInfo.displayName || data.userInfo.username || 'Unknown User'
          const cardTitle = data.cardTitle || 'Untitled Card'
          
          // Message format for notification bell
          let notificationText = ''
          
          if (data.action === 'UPDATE_COVER_COLOR') {
            const coverTypeText = data.coverType === 'gradient' ? 'gradient' : 'màu nền'
            notificationText = isCurrentUser
              ? `Bạn đã thay đổi ảnh bìa thành ${coverTypeText} cho '${cardTitle}'`
              : `${userName} đã thay đổi ảnh bìa thành ${coverTypeText} cho '${cardTitle}'`
          } else if (data.action === 'UPLOAD_COVER_IMAGE') {
            notificationText = isCurrentUser
              ? `Bạn đã tải lên ảnh bìa mới cho '${cardTitle}'`
              : `${userName} đã tải lên ảnh bìa mới cho '${cardTitle}'`
          } else if (data.action === 'DELETE_COVER') {
            notificationText = isCurrentUser
              ? `Bạn đã xóa ảnh bìa của '${cardTitle}'`
              : `${userName} đã xóa ảnh bìa của '${cardTitle}'`
          }

          console.log('🖼️ NotificationBell: Card cover notification for all members:', {
            userName,
            cardTitle,
            action: data.action,
            isCurrentUser,
            notificationText,
            timestamp: data.timestamp
          })
          
          // Trigger shake with card cover notification data for all members
          triggerShake({
            type: 'CARD_COVER_UPDATED',
            userName,
            cardTitle,
            action: data.action,
            coverType: data.coverType,
            fileName: data.fileName,
            notificationText,
            isCurrentUser,
            timestamp: data.timestamp || new Date().toISOString(),
            userAvatar: data.userInfo?.avatar,
            originalData: data // For debugging
          })
        } else {
          console.log('🖼️ NotificationBell: Card cover event ignored:', {
            reason: data.boardId !== boardId ? 'Different board' : 'Missing user info'
          })
        }
      } catch (error) {
        console.error('🖼️ NotificationBell: Error handling card cover event:', error)
      }
    }

    // Handler for card creation (Universal Notifications Pattern)
    const handleCardCreated = (data) => {
      try {
        console.log('🔔 NotificationBell: Card created event received:', {
          cardTitle: data.cardTitle,
          columnTitle: data.columnTitle,
          userInfo: data.userInfo,
          boardId: data.boardId,
          currentBoard: boardId,
          currentUser: currentUser.displayName,
          fullData: data
        })
        
        if (data.boardId === boardId && data.userInfo) {
          const isCurrentUser = data.userInfo._id === currentUser._id
          const userName = data.userInfo.displayName || data.userInfo.username || 'Unknown User'
          const cardTitle = data.cardTitle || 'thẻ không có tên'
          const columnTitle = data.columnTitle || 'cột'
          
          const notificationText = isCurrentUser
            ? `Bạn đã tạo thẻ mới '${cardTitle}' trong '${columnTitle}'`
            : `${userName} đã tạo thẻ mới '${cardTitle}' trong '${columnTitle}'`
          
          console.log('🔔 NotificationBell: Triggering card creation notification:', {
            notificationText,
            isCurrentUser,
            userName,
            cardTitle,
            columnTitle
          })
          
          triggerShake({ 
            type: 'CARD_CREATED', 
            notificationText, 
            isCurrentUser,
            userName,
            cardTitle,
            columnTitle,
            timestamp: data.timestamp || new Date().toISOString(),
            userAvatar: data.userInfo?.avatar
          })
        } else {
          console.log('🔔 NotificationBell: Card creation event ignored:', {
            reason: !data.userInfo ? 'Missing user info' : 
                    data.boardId !== boardId ? 'Different board' : 'Unknown'
          })
        }
      } catch (error) {
        console.error('🔔 NotificationBell: Error handling card creation event:', error)
      }
    }

    // Handle attachment upload with Universal Notifications pattern
    const handleAttachmentUploaded = (data) => {
      try {
        console.log('📎 NotificationBell: Attachment uploaded event received (all members):', {
          boardId: data.boardId,
          currentBoard: boardId,
          isTargetBoard: data.boardId === boardId,
          userInfo: data.userInfo,
          currentUser: currentUser.displayName,
          isFromCurrentUser: data.userInfo?._id === currentUser._id,
          cardTitle: data.cardTitle,
          attachmentsCount: data.attachmentsCount
        })
        
        if (data.boardId === boardId && data.userInfo) {
          const isCurrentUser = data.userInfo._id === currentUser._id
          const userName = data.userInfo.displayName || data.userInfo.username || 'Người dùng'
          const cardTitle = data.cardTitle || 'thẻ'
          const filesText = data.attachmentsCount > 1 ? `${data.attachmentsCount} tệp` : '1 tệp'
          
          const notificationText = isCurrentUser
            ? `Bạn đã tải lên ${filesText} cho thẻ '${cardTitle}'`
            : `${userName} đã tải lên ${filesText} cho thẻ '${cardTitle}'`
          
          console.log('📎 NotificationBell: Triggering attachment upload notification:', {
            notificationText,
            isCurrentUser,
            userName,
            cardTitle,
            attachmentsCount: data.attachmentsCount
          })
          
          triggerShake({ 
            type: 'ATTACHMENT_UPLOADED', 
            notificationText, 
            isCurrentUser,
            userName,
            cardTitle,
            attachmentsCount: data.attachmentsCount,
            timestamp: data.timestamp || new Date().toISOString(),
            userAvatar: data.userInfo?.avatar
          })
        } else {
          console.log('📎 NotificationBell: Attachment upload event ignored:', {
            reason: !data.userInfo ? 'Missing user info' : 
                    data.boardId !== boardId ? 'Different board' : 'Unknown'
          })
        }
      } catch (error) {
        console.error('📎 NotificationBell: Error handling attachment upload event:', error)
      }
    }

    // Handle attachment deletion with Universal Notifications pattern
    const handleAttachmentDeleted = (data) => {
      try {
        console.log('🗑️ NotificationBell: Attachment deleted event received (all members):', {
          boardId: data.boardId,
          currentBoard: boardId,
          isTargetBoard: data.boardId === boardId,
          userInfo: data.userInfo,
          currentUser: currentUser.displayName,
          isFromCurrentUser: data.userInfo?._id === currentUser._id,
          cardTitle: data.cardTitle,
          attachmentName: data.attachmentName
        })
        
        if (data.boardId === boardId && data.userInfo) {
          const isCurrentUser = data.userInfo._id === currentUser._id
          const userName = data.userInfo.displayName || data.userInfo.username || 'Người dùng'
          const cardTitle = data.cardTitle || 'thẻ'
          const fileName = data.attachmentName || 'tệp'
          const shortName = fileName.length > 25 ? fileName.substring(0, 22) + '...' : fileName
          
          const notificationText = isCurrentUser
            ? `Bạn đã xóa "${shortName}" khỏi thẻ '${cardTitle}'`
            : `${userName} đã xóa "${shortName}" khỏi thẻ '${cardTitle}'`
          
          console.log('🗑️ NotificationBell: Triggering attachment delete notification:', {
            notificationText,
            isCurrentUser,
            userName,
            cardTitle,
            attachmentName: fileName
          })
          
          triggerShake({ 
            type: 'ATTACHMENT_DELETED', 
            notificationText, 
            isCurrentUser,
            userName,
            cardTitle,
            attachmentName: fileName,
            timestamp: data.timestamp || new Date().toISOString(),
            userAvatar: data.userInfo?.avatar
          })
        } else {
          console.log('🗑️ NotificationBell: Attachment delete event ignored:', {
            reason: !data.userInfo ? 'Missing user info' : 
                    data.boardId !== boardId ? 'Different board' : 'Unknown'
          })
        }
      } catch (error) {
        console.error('🗑️ NotificationBell: Error handling attachment delete event:', error)
      }
    }

    // Handle label updates with Universal Notifications pattern
    const handleLabelUpdated = (data) => {
      try {
        console.log('🏷️ NotificationBell: Label updated event received (all members):', {
          boardId: data.boardId,
          currentBoard: boardId,
          isTargetBoard: data.boardId === boardId,
          userInfo: data.userInfo,
          currentUser: currentUser.displayName,
          isFromCurrentUser: data.userInfo?._id === currentUser._id,
          action: data.action,
          labelName: data.labelName,
          cardTitle: data.cardTitle
        })
        
        if (data.boardId === boardId && data.userInfo) {
          const isCurrentUser = data.userInfo._id === currentUser._id
          const userName = data.userInfo.displayName || data.userInfo.username || 'Người dùng'
          const action = data.action === 'ADD' ? 'thêm' : 'xóa'
          const preposition = data.action === 'ADD' ? 'vào' : 'khỏi'
          const labelName = data.labelName || 'nhãn'
          const cardTitle = data.cardTitle || 'thẻ'
          
          // Shorten names if too long for notification
          const shortLabelName = labelName.length > 15 ? labelName.substring(0, 12) + '...' : labelName
          const shortCardTitle = cardTitle.length > 25 ? cardTitle.substring(0, 22) + '...' : cardTitle
          
          const notificationText = isCurrentUser
            ? `Bạn đã ${action} nhãn '${shortLabelName}' ${preposition} thẻ '${shortCardTitle}'`
            : `${userName} đã ${action} nhãn '${shortLabelName}' ${preposition} thẻ '${shortCardTitle}'`
          
          console.log('🏷️ NotificationBell: Triggering label notification:', {
            notificationText,
            isCurrentUser,
            userName,
            action,
            labelName: shortLabelName,
            cardTitle: shortCardTitle
          })
          
          triggerShake({ 
            type: 'LABEL_UPDATED', 
            notificationText, 
            isCurrentUser,
            userName,
            action: data.action,
            labelName: shortLabelName,
            cardTitle: shortCardTitle,
            timestamp: data.timestamp || new Date().toISOString(),
            userAvatar: data.userInfo?.avatar
          })
        } else {
          console.log('🏷️ NotificationBell: Label updated event ignored:', {
            reason: !data.userInfo ? 'Missing user info' : 
                    data.boardId !== boardId ? 'Different board' : 'Unknown'
          })
        }
      } catch (error) {
        console.error('🏷️ NotificationBell: Error handling label updated event:', error)
      }
    }

    const handleChecklistDeleted = (data) => {
      try {
        console.log('📝 NotificationBell: Checklist deleted event received:', {
          boardId: data.boardId,
          currentBoard: boardId,
          isTargetBoard: data.boardId === boardId,
          userInfo: data.userInfo,
          currentUser: currentUser.displayName,
          isFromCurrentUser: data.userInfo?._id === currentUser._id,
          checklistName: data.checklistName,
          cardTitle: data.cardTitle
        })
        
        if (data.boardId === boardId && data.userInfo) {
          const isCurrentUser = data.userInfo._id === currentUser._id
          const userName = data.userInfo.displayName || data.userInfo.username || 'Người dùng'
          const checklistName = data.checklistName || 'checklist'
          const cardTitle = data.cardTitle || 'thẻ'
          
          // Shorten names if too long for notification
          const shortChecklistName = checklistName.length > 20 ? checklistName.substring(0, 17) + '...' : checklistName
          const shortCardTitle = cardTitle.length > 25 ? cardTitle.substring(0, 22) + '...' : cardTitle
          
          const notificationText = isCurrentUser
            ? `Bạn đã xóa checklist '${shortChecklistName}' khỏi thẻ '${shortCardTitle}'`
            : `${userName} đã xóa checklist '${shortChecklistName}' khỏi thẻ '${shortCardTitle}'`
          
          console.log('📝 NotificationBell: Triggering checklist deletion notification:', {
            notificationText,
            isCurrentUser,
            userName,
            checklistName: shortChecklistName,
            cardTitle: shortCardTitle
          })
          
          triggerShake({ 
            type: 'CHECKLIST_DELETED', 
            notificationText, 
            isCurrentUser,
            userName,
            checklistName: shortChecklistName,
            cardTitle: shortCardTitle,
            timestamp: data.timestamp || new Date().toISOString(),
            userAvatar: data.userInfo?.avatar
          })
        } else {
          console.log('📝 NotificationBell: Checklist deleted event ignored:', {
            reason: !data.userInfo ? 'Missing user info' : 
                    data.boardId !== boardId ? 'Different board' : 'Unknown'
          })
        }
      } catch (error) {
        console.error('📝 NotificationBell: Error handling checklist deleted event:', error)
      }
    }

    const handleChecklistItemDeleted = (data) => {
      try {
        console.log('📝 NotificationBell: Checklist item deleted event received:', {
          boardId: data.boardId,
          currentBoard: boardId,
          isTargetBoard: data.boardId === boardId,
          userInfo: data.userInfo,
          currentUser: currentUser.displayName,
          isFromCurrentUser: data.userInfo?._id === currentUser._id,
          itemName: data.itemName,
          checklistName: data.checklistName
        })
        
        if (data.boardId === boardId && data.userInfo) {
          const isCurrentUser = data.userInfo._id === currentUser._id
          const userName = data.userInfo.displayName || data.userInfo.username || 'Người dùng'
          const itemName = data.itemName || 'item'
          const checklistName = data.checklistName || 'checklist'
          
          // Shorten names if too long for notification
          const shortItemName = itemName.length > 20 ? itemName.substring(0, 17) + '...' : itemName
          const shortChecklistName = checklistName.length > 20 ? checklistName.substring(0, 17) + '...' : checklistName
          
          const notificationText = isCurrentUser
            ? `Bạn đã xóa '${shortItemName}' khỏi checklist '${shortChecklistName}'`
            : `${userName} đã xóa '${shortItemName}' khỏi checklist '${shortChecklistName}'`
          
          console.log('📝 NotificationBell: Triggering checklist item deletion notification:', {
            notificationText,
            isCurrentUser,
            userName,
            itemName: shortItemName,
            checklistName: shortChecklistName
          })
          
          triggerShake({ 
            type: 'CHECKLIST_ITEM_DELETED', 
            notificationText, 
            isCurrentUser,
            userName,
            itemName: shortItemName,
            checklistName: shortChecklistName,
            timestamp: data.timestamp || new Date().toISOString(),
            userAvatar: data.userInfo?.avatar
          })
        } else {
          console.log('📝 NotificationBell: Checklist item deleted event ignored:', {
            reason: !data.userInfo ? 'Missing user info' : 
                    data.boardId !== boardId ? 'Different board' : 'Unknown'
          })
        }
      } catch (error) {
        console.error('📝 NotificationBell: Error handling checklist item deleted event:', error)
      }
    }

    const handleChecklistCreated = (data) => {
      try {
        console.log('📝 NotificationBell: Checklist created event received:', {
          boardId: data.boardId,
          currentBoard: boardId,
          isTargetBoard: data.boardId === boardId,
          userInfo: data.userInfo,
          currentUser: currentUser.displayName,
          isFromCurrentUser: data.userInfo?._id === currentUser._id,
          checklistName: data.checklistName,
          cardTitle: data.cardTitle
        })
        
        if (data.boardId === boardId && data.userInfo) {
          const isCurrentUser = data.userInfo._id === currentUser._id
          const userName = data.userInfo.displayName || data.userInfo.username || 'Người dùng'
          const checklistName = data.checklistName || 'checklist'
          const cardTitle = data.cardTitle || 'thẻ'
          
          // Shorten names if too long for notification
          const shortChecklistName = checklistName.length > 20 ? checklistName.substring(0, 17) + '...' : checklistName
          const shortCardTitle = cardTitle.length > 25 ? cardTitle.substring(0, 22) + '...' : cardTitle
          
          const notificationText = isCurrentUser
            ? `Bạn đã tạo checklist '${shortChecklistName}' trong thẻ '${shortCardTitle}'`
            : `${userName} đã tạo checklist '${shortChecklistName}' trong thẻ '${shortCardTitle}'`
          
          console.log('📝 NotificationBell: Triggering checklist creation notification:', {
            notificationText,
            isCurrentUser,
            userName,
            checklistName: shortChecklistName,
            cardTitle: shortCardTitle
          })
          
          triggerShake({ 
            type: 'CHECKLIST_CREATED', 
            notificationText, 
            isCurrentUser,
            userName,
            checklistName: shortChecklistName,
            cardTitle: shortCardTitle,
            timestamp: data.timestamp || new Date().toISOString(),
            userAvatar: data.userInfo?.avatar
          })
        } else {
          console.log('📝 NotificationBell: Checklist created event ignored:', {
            reason: !data.userInfo ? 'Missing user info' : 
                    data.boardId !== boardId ? 'Different board' : 'Unknown'
          })
        }
      } catch (error) {
        console.error('📝 NotificationBell: Error handling checklist created event:', error)
      }
    }

    const handleChecklistItemCreated = (data) => {
      try {
        console.log('📝 NotificationBell: Checklist item created event received:', {
          boardId: data.boardId,
          currentBoard: boardId,
          isTargetBoard: data.boardId === boardId,
          userInfo: data.userInfo,
          currentUser: currentUser.displayName,
          isFromCurrentUser: data.userInfo?._id === currentUser._id,
          itemName: data.itemName,
          checklistName: data.checklistName
        })
        
        if (data.boardId === boardId && data.userInfo) {
          const isCurrentUser = data.userInfo._id === currentUser._id
          const userName = data.userInfo.displayName || data.userInfo.username || 'Người dùng'
          const itemName = data.itemName || 'item'
          const checklistName = data.checklistName || 'checklist'
          
          // Shorten names if too long for notification
          const shortItemName = itemName.length > 20 ? itemName.substring(0, 17) + '...' : itemName
          const shortChecklistName = checklistName.length > 20 ? checklistName.substring(0, 17) + '...' : checklistName
          
          const notificationText = isCurrentUser
            ? `Bạn đã thêm '${shortItemName}' vào checklist '${shortChecklistName}'`
            : `${userName} đã thêm '${shortItemName}' vào checklist '${shortChecklistName}'`
          
          console.log('📝 NotificationBell: Triggering checklist item creation notification:', {
            notificationText,
            isCurrentUser,
            userName,
            itemName: shortItemName,
            checklistName: shortChecklistName
          })
          
          triggerShake({ 
            type: 'CHECKLIST_ITEM_CREATED', 
            notificationText, 
            isCurrentUser,
            userName,
            itemName: shortItemName,
            checklistName: shortChecklistName,
            timestamp: data.timestamp || new Date().toISOString(),
            userAvatar: data.userInfo?.avatar
          })
        } else {
          console.log('📝 NotificationBell: Checklist item created event ignored:', {
            reason: !data.userInfo ? 'Missing user info' : 
                    data.boardId !== boardId ? 'Different board' : 'Unknown'
          })
        }
      } catch (error) {
        console.error('📝 NotificationBell: Error handling checklist item created event:', error)
      }
    }

    const handleChecklistItemStatusUpdated = (data) => {
      try {
        console.log('📝 NotificationBell: Checklist item status updated event received:', {
          boardId: data.boardId,
          currentBoard: boardId,
          isTargetBoard: data.boardId === boardId,
          userInfo: data.userInfo,
          currentUser: currentUser.displayName,
          isFromCurrentUser: data.userInfo?._id === currentUser._id,
          itemName: data.itemName,
          checklistName: data.checklistName,
          isCompleted: data.isCompleted
        })
        
        if (data.boardId === boardId && data.userInfo) {
          const isCurrentUser = data.userInfo._id === currentUser._id
          const userName = data.userInfo.displayName || data.userInfo.username || 'Người dùng'
          const itemName = data.itemName || 'item'
          const checklistName = data.checklistName || 'checklist'
          const statusText = data.isCompleted ? 'hoàn thành' : 'bỏ hoàn thành'
          
          // Shorten names if too long for notification
          const shortItemName = itemName.length > 20 ? itemName.substring(0, 17) + '...' : itemName
          const shortChecklistName = checklistName.length > 20 ? checklistName.substring(0, 17) + '...' : checklistName
          
          const notificationText = isCurrentUser
            ? `Bạn đã ${statusText} '${shortItemName}' trong checklist '${shortChecklistName}'`
            : `${userName} đã ${statusText} '${shortItemName}' trong checklist '${shortChecklistName}'`
          
          console.log('📝 NotificationBell: Triggering checklist item status notification:', {
            notificationText,
            isCurrentUser,
            userName,
            itemName: shortItemName,
            checklistName: shortChecklistName,
            statusText
          })
          
          triggerShake({ 
            type: 'CHECKLIST_ITEM_STATUS_UPDATED', 
            notificationText, 
            isCurrentUser,
            userName,
            itemName: shortItemName,
            checklistName: shortChecklistName,
            statusText,
            isCompleted: data.isCompleted,
            timestamp: data.timestamp || new Date().toISOString(),
            userAvatar: data.userInfo?.avatar
          })
        } else {
          console.log('📝 NotificationBell: Checklist item status event ignored:', {
            reason: !data.userInfo ? 'Missing user info' : 
                    data.boardId !== boardId ? 'Different board' : 'Unknown'
          })
        }
      } catch (error) {
        console.error('📝 NotificationBell: Error handling checklist item status event:', error)
      }
    }

    const handleChecklistUpdated = (data) => {
      try {
        console.log('📝 NotificationBell: Checklist updated event received:', {
          boardId: data.boardId,
          currentBoard: boardId,
          isTargetBoard: data.boardId === boardId,
          userInfo: data.userInfo,
          currentUser: currentUser.displayName,
          isFromCurrentUser: data.userInfo?._id === currentUser._id,
          oldTitle: data.oldTitle,
          newTitle: data.newTitle,
          cardTitle: data.cardTitle
        })
        
        if (data.boardId === boardId && data.userInfo) {
          const isCurrentUser = data.userInfo._id === currentUser._id
          const userName = data.userInfo.displayName || data.userInfo.username || 'Người dùng'
          const oldTitle = data.oldTitle || 'checklist'
          const newTitle = data.newTitle || 'checklist'
          const cardTitle = data.cardTitle || 'thẻ'
          
          // Shorten names if too long for notification
          const shortOldTitle = oldTitle.length > 20 ? oldTitle.substring(0, 17) + '...' : oldTitle
          const shortNewTitle = newTitle.length > 20 ? newTitle.substring(0, 17) + '...' : newTitle
          const shortCardTitle = cardTitle.length > 25 ? cardTitle.substring(0, 22) + '...' : cardTitle
          
          const notificationText = isCurrentUser
            ? `Bạn đã đổi tên checklist '${shortOldTitle}' thành '${shortNewTitle}' trong thẻ '${shortCardTitle}'`
            : `${userName} đã đổi tên checklist '${shortOldTitle}' thành '${shortNewTitle}' trong thẻ '${shortCardTitle}'`
          
          console.log('📝 NotificationBell: Triggering checklist update notification:', {
            notificationText,
            isCurrentUser,
            userName,
            oldTitle: shortOldTitle,
            newTitle: shortNewTitle,
            cardTitle: shortCardTitle
          })
          
          triggerShake({ 
            type: 'CHECKLIST_UPDATED', 
            notificationText, 
            isCurrentUser,
            userName,
            oldTitle: shortOldTitle,
            newTitle: shortNewTitle,
            cardTitle: shortCardTitle,
            timestamp: data.timestamp || new Date().toISOString(),
            userAvatar: data.userInfo?.avatar
          })
        } else {
          console.log('📝 NotificationBell: Checklist updated event ignored:', {
            reason: !data.userInfo ? 'Missing user info' : 
                    data.boardId !== boardId ? 'Different board' : 'Unknown'
          })
        }
      } catch (error) {
        console.error('📝 NotificationBell: Error handling checklist updated event:', error)
      }
    }

    const handleChecklistItemUpdated = (data) => {
      try {
        console.log('📝 NotificationBell: Checklist item updated event received:', {
          boardId: data.boardId,
          currentBoard: boardId,
          isTargetBoard: data.boardId === boardId,
          userInfo: data.userInfo,
          currentUser: currentUser.displayName,
          isFromCurrentUser: data.userInfo?._id === currentUser._id,
          oldTitle: data.oldTitle,
          newTitle: data.newTitle,
          checklistName: data.checklistName
        })
        
        if (data.boardId === boardId && data.userInfo) {
          const isCurrentUser = data.userInfo._id === currentUser._id
          const userName = data.userInfo.displayName || data.userInfo.username || 'Người dùng'
          const oldTitle = data.oldTitle || 'item'
          const newTitle = data.newTitle || 'item'
          const checklistName = data.checklistName || 'checklist'
          
          // Shorten names if too long for notification
          const shortOldTitle = oldTitle.length > 20 ? oldTitle.substring(0, 17) + '...' : oldTitle
          const shortNewTitle = newTitle.length > 20 ? newTitle.substring(0, 17) + '...' : newTitle
          const shortChecklistName = checklistName.length > 20 ? checklistName.substring(0, 17) + '...' : checklistName
          
          const notificationText = isCurrentUser
            ? `Bạn đã đổi tên '${shortOldTitle}' thành '${shortNewTitle}' trong checklist '${shortChecklistName}'`
            : `${userName} đã đổi tên '${shortOldTitle}' thành '${shortNewTitle}' trong checklist '${shortChecklistName}'`
          
          console.log('📝 NotificationBell: Triggering checklist item update notification:', {
            notificationText,
            isCurrentUser,
            userName,
            oldTitle: shortOldTitle,
            newTitle: shortNewTitle,
            checklistName: shortChecklistName
          })
          
          triggerShake({ 
            type: 'CHECKLIST_ITEM_UPDATED', 
            notificationText, 
            isCurrentUser,
            userName,
            oldTitle: shortOldTitle,
            newTitle: shortNewTitle,
            checklistName: shortChecklistName,
            timestamp: data.timestamp || new Date().toISOString(),
            userAvatar: data.userInfo?.avatar
          })
        } else {
          console.log('📝 NotificationBell: Checklist item updated event ignored:', {
            reason: !data.userInfo ? 'Missing user info' : 
                    data.boardId !== boardId ? 'Different board' : 'Unknown'
          })
        }
      } catch (error) {
        console.error('📝 NotificationBell: Error handling checklist item updated event:', error)
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
    // Add card completed listener
    socketIoInstance.on('BE_CARD_COMPLETED', handleCardCompleted)
    // Add card movement listener
    socketIoInstance.on('BE_CARD_MOVED', handleCardMoved)
    // Add card cover updated listener
    socketIoInstance.on('BE_CARD_COVER_UPDATED', handleCardCoverUpdated)
    // Add card creation listener
    socketIoInstance.on('BE_CARD_CREATED', handleCardCreated)
    // Add attachment listeners
    socketIoInstance.on('BE_ATTACHMENT_UPLOADED', handleAttachmentUploaded)
    socketIoInstance.on('BE_ATTACHMENT_DELETED', handleAttachmentDeleted)
    // Add label listener
    socketIoInstance.on('BE_LABEL_UPDATED', handleLabelUpdated)
    // Add checklist listeners
    socketIoInstance.on('BE_CHECKLIST_DELETED', handleChecklistDeleted)
    socketIoInstance.on('BE_CHECKLIST_ITEM_DELETED', handleChecklistItemDeleted)
    socketIoInstance.on('BE_CHECKLIST_CREATED', handleChecklistCreated)
    socketIoInstance.on('BE_CHECKLIST_ITEM_CREATED', handleChecklistItemCreated)
    socketIoInstance.on('BE_CHECKLIST_ITEM_STATUS_UPDATED', handleChecklistItemStatusUpdated)
    socketIoInstance.on('BE_CHECKLIST_UPDATED', handleChecklistUpdated)
    socketIoInstance.on('BE_CHECKLIST_ITEM_UPDATED', handleChecklistItemUpdated)

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
      // Remove card completed listener
      socketIoInstance.off('BE_CARD_COMPLETED', handleCardCompleted)
      // Remove card movement listener
      socketIoInstance.off('BE_CARD_MOVED', handleCardMoved)
      // Remove card cover updated listener
      socketIoInstance.off('BE_CARD_COVER_UPDATED', handleCardCoverUpdated)
      // Remove card creation listener
      socketIoInstance.off('BE_CARD_CREATED', handleCardCreated)
      // Remove attachment listeners
      socketIoInstance.off('BE_ATTACHMENT_UPLOADED', handleAttachmentUploaded)
      socketIoInstance.off('BE_ATTACHMENT_DELETED', handleAttachmentDeleted)
      // Remove label listener
      socketIoInstance.off('BE_LABEL_UPDATED', handleLabelUpdated)
      // Remove checklist listeners
      socketIoInstance.off('BE_CHECKLIST_DELETED', handleChecklistDeleted)
      socketIoInstance.off('BE_CHECKLIST_ITEM_DELETED', handleChecklistItemDeleted)
      socketIoInstance.off('BE_CHECKLIST_CREATED', handleChecklistCreated)
      socketIoInstance.off('BE_CHECKLIST_ITEM_CREATED', handleChecklistItemCreated)
      socketIoInstance.off('BE_CHECKLIST_ITEM_STATUS_UPDATED', handleChecklistItemStatusUpdated)
      socketIoInstance.off('BE_CHECKLIST_UPDATED', handleChecklistUpdated)
      socketIoInstance.off('BE_CHECKLIST_ITEM_UPDATED', handleChecklistItemUpdated)
      
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
            Lịch sử trong 7 ngày qua
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
                          : notification.type === 'CARD_COMPLETED'
                            ? 'rgba(76, 175, 80, 0.15)' // Green for card completion actions
                                                    : notification.type === 'CARD_MOVED'
                          ? 'rgba(33, 150, 243, 0.15)' // Blue for card movement actions
                          : notification.type === 'CARD_COVER_UPDATED'
                            ? 'rgba(156, 39, 176, 0.15)' // Purple for card cover actions
                            : notification.type === 'CARD_CREATED'
                              ? 'rgba(33, 150, 243, 0.15)' // Blue for card creation actions
                              : notification.type === 'ATTACHMENT_UPLOADED'
                                ? 'rgba(33, 150, 243, 0.15)' // Blue for attachment upload actions
                                : notification.type === 'ATTACHMENT_DELETED'
                                  ? 'rgba(255, 152, 0, 0.15)' // Orange for attachment delete actions
                                  : notification.type === 'LABEL_UPDATED'
                                    ? (notification.action === 'ADD' 
                                        ? 'rgba(33, 150, 243, 0.15)'  // Blue for label add actions
                                        : 'rgba(255, 152, 0, 0.15)')  // Orange for label remove actions
                                    : notification.type === 'CHECKLIST_DELETED'
                                      ? 'rgba(255, 152, 0, 0.15)' // Orange for checklist delete actions
                                      : notification.type === 'CHECKLIST_ITEM_DELETED'
                                        ? 'rgba(255, 152, 0, 0.15)' // Orange for checklist item delete actions
                                        : 'rgba(255, 152, 0, 0.1)', // Default orange
                    borderLeft: notification.isRead 
                      ? 'none'
                      : notification.type === 'COLUMN_DELETED'
                        ? '3px solid #ff9800' // Orange border for delete actions
                        : notification.type === 'COLUMN_TITLE_UPDATED'
                          ? '3px solid #2196f3' // Blue border for title update actions
                          : notification.type === 'CARD_COMPLETED'
                            ? '3px solid #4caf50' // Green border for card completion actions
                            : notification.type === 'CARD_MOVED'
                              ? '3px solid #2196f3' // Blue border for card movement actions
                              : notification.type === 'CARD_COVER_UPDATED'
                                ? '3px solid #9c27b0' // Purple border for card cover actions
                                : notification.type === 'CARD_CREATED'
                                  ? '3px solid #2196f3' // Blue border for card creation actions
                                  : notification.type === 'ATTACHMENT_UPLOADED'
                                    ? '3px solid #2196f3' // Blue border for attachment upload actions
                                    : notification.type === 'ATTACHMENT_DELETED'
                                      ? '3px solid #ff9800' // Orange border for attachment delete actions
                                      : notification.type === 'LABEL_UPDATED'
                                        ? (notification.action === 'ADD' 
                                            ? '3px solid #2196f3'  // Blue border for label add actions
                                            : '3px solid #ff9800')  // Orange border for label remove actions
                                        : notification.type === 'CHECKLIST_DELETED'
                                          ? '3px solid #ff9800' // Orange border for checklist delete actions
                                          : notification.type === 'CHECKLIST_ITEM_DELETED'
                                            ? '3px solid #ff9800' // Orange border for checklist item delete actions
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
                        ) : notification.type === 'CARD_MOVED' ? (
                          // Card movement action icon with appropriate color
                          <Box sx={{ 
                            fontSize: '16px',
                            color: notification.isCurrentUser ? '#4caf50' : '#2196f3',
                          }}>
                            {notification.isCurrentUser ? '✅' : '🔄'}
                          </Box>
                        ) : notification.type === 'CARD_COVER_UPDATED' ? (
                          // Card cover update action icon with appropriate color
                          <Box sx={{ 
                            fontSize: '16px',
                            color: notification.isCurrentUser ? '#4caf50' : '#9c27b0',
                          }}>
                            {notification.isCurrentUser ? '✅' : '🖼️'}
                          </Box>
                        ) : notification.type === 'CARD_CREATED' ? (
                          // Card creation action icon with appropriate color
                          <Box sx={{ 
                            fontSize: '16px',
                            color: notification.isCurrentUser ? '#4caf50' : '#2196f3',
                          }}>
                            {notification.isCurrentUser ? '✅' : '📝'}
                          </Box>
                        ) : notification.type === 'ATTACHMENT_UPLOADED' ? (
                          // Attachment upload action icon with appropriate color
                          <Box sx={{ 
                            fontSize: '16px',
                            color: notification.isCurrentUser ? '#4caf50' : '#2196f3',
                          }}>
                            {notification.isCurrentUser ? '✅' : '📎'}
                          </Box>
                        ) : notification.type === 'ATTACHMENT_DELETED' ? (
                          // Attachment delete action icon with appropriate color
                          <Box sx={{ 
                            fontSize: '16px',
                            color: notification.isCurrentUser ? '#4caf50' : '#ff9800',
                          }}>
                            {notification.isCurrentUser ? '✅' : '🗑️'}
                          </Box>
                        ) : notification.type === 'LABEL_UPDATED' ? (
                          // Label update action icon with appropriate color
                          <Box sx={{ 
                            fontSize: '16px',
                            color: notification.isCurrentUser ? '#4caf50' : (notification.action === 'ADD' ? '#2196f3' : '#ff9800'),
                          }}>
                            {notification.isCurrentUser ? '✅' : (notification.action === 'ADD' ? '🏷️' : '🗑️')}
                          </Box>
                        ) : notification.type === 'CHECKLIST_DELETED' ? (
                          // Checklist delete action icon with appropriate color
                          <Box sx={{ 
                            fontSize: '16px',
                            color: notification.isCurrentUser ? '#4caf50' : '#ff9800',
                          }}>
                            {notification.isCurrentUser ? '✅' : '🗑️'}
                          </Box>
                        ) : notification.type === 'CHECKLIST_ITEM_DELETED' ? (
                          // Checklist item delete action icon with appropriate color
                          <Box sx={{ 
                            fontSize: '16px',
                            color: notification.isCurrentUser ? '#4caf50' : '#ff9800',
                          }}>
                            {notification.isCurrentUser ? '✅' : '🗑️'}
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
                              : notification.type === 'CARD_COMPLETED'
                                ? (notification.isCurrentUser ? '#4caf50' : '#66bb6a')
                                : notification.type === 'CARD_MOVED'
                                  ? (notification.isCurrentUser ? '#4caf50' : '#2196f3')
                                  : notification.type === 'CARD_CREATED'
                                    ? (notification.isCurrentUser ? '#4caf50' : '#2196f3')
                                    : notification.type === 'ATTACHMENT_UPLOADED'
                                      ? (notification.isCurrentUser ? '#4caf50' : '#2196f3')
                                      : notification.type === 'ATTACHMENT_DELETED'
                                        ? (notification.isCurrentUser ? '#4caf50' : '#ff9800')
                                        : notification.type === 'LABEL_UPDATED'
                                          ? (notification.isCurrentUser ? '#4caf50' : (notification.action === 'ADD' ? '#2196f3' : '#ff9800'))
                                          : notification.type === 'CHECKLIST_DELETED'
                                            ? (notification.isCurrentUser ? '#4caf50' : '#ff9800')
                                            : notification.type === 'CHECKLIST_ITEM_DELETED'
                                              ? (notification.isCurrentUser ? '#4caf50' : '#ff9800')
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