import { useEffect, useState } from 'react'
import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'

// import { mockData } from '~/apis/mock-data'
import {
  updateBoardDetailsAPI,
  updateColumnDetailsAPI,
  moveCardToDifferentColumnAPI
} from '~/apis'
import { cloneDeep } from 'lodash'
import {
  fetchBoardDetailsAPI,
  updateCurrentActiveBoard,
  selectCurrentActiveBoard,
  selectBoardBackground
} from '~/redux/activeBoard/activeBoardSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import ActiveCard from '~/components/Modal/ActiveCard/ActiveCard'
import { BACKGROUND_TYPES } from '~/utils/backgroundConstants'
import { socketIoInstance } from '~/socketClient'
import { toast } from 'react-toastify'

function Board() {
  const dispatch = useDispatch()
  // Không dùng State của component nữa mà chuyển qua dùng State của Redux
  // const [board, setBoard] = useState(null)
  const board = useSelector(selectCurrentActiveBoard)
  const currentUser = useSelector(selectCurrentUser)
  // Get board background từ Redux
  const boardBackground = useSelector(selectBoardBackground)

  const { boardId } = useParams()

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  useEffect(() => {
    // Call API
    dispatch(fetchBoardDetailsAPI(boardId))
    // Join room realtime
    socketIoInstance.emit('joinBoard', boardId)

    // Lắng nghe mọi event realtime và reload board với delay
    let reloadTimeout = null
    const reloadBoardWithDelay = () => {
      if (reloadTimeout) clearTimeout(reloadTimeout)
      reloadTimeout = setTimeout(() => {
        dispatch(fetchBoardDetailsAPI(boardId))
      }, 500)
    }
    const onRealtimeEvent = (data) => {
      // For checklist operations, we don't need to show additional toasts
      // since the user who performed the action already sees the toast
      console.log('🔄 Real-time event received:', data)
      reloadBoardWithDelay()
    }

    // Toast notification handler for column creation
    const onColumnCreated = (data) => {
      console.log('🔔 Board: Column created event received (all members):', {
        columnTitle: data.columnTitle,
        userInfo: data.userInfo,
        currentUser: currentUser?.displayName,
        boardId: data.boardId,
        fullData: data
      })
      
      // Show notification for ALL members (including the actor)
      // This ensures complete synchronization across all users
      if (data.userInfo && 
          data.boardId === boardId &&
          data.columnTitle) {
        
        // Enhanced fallback logic
        const userName = data.userInfo.displayName || 
                        data.userInfo.username || 
                        'Người dùng không xác định'
        
        const columnName = data.columnTitle || 
                          data.title || 
                          'cột không có tên'
        
        // Different message for actor vs observers for clarity
        const isCurrentUser = data.userInfo._id === currentUser?._id
        const message = isCurrentUser 
          ? `✅ Bạn đã tạo cột mới: "${columnName}"` 
          : `👤 ${userName} đã tạo cột mới: "${columnName}"`
        
        console.log('🔔 Board: Showing synchronized notification for all members:', {
          userName,
          columnName,
          isCurrentUser,
          message,
          boardId: data.boardId
        })
        
        // Unique toast ID to prevent duplicates across all members
        const toastId = `column-all-${data.boardId}-${data.columnId || Date.now()}`
        
        toast.info(message, {
          toastId, // Prevent duplicate toasts with board-specific ID
          position: 'bottom-left',
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            backgroundColor: isCurrentUser ? '#2e7d32' : '#1a2332',
            color: '#ffffff',
            border: isCurrentUser ? '1px solid #4caf50' : '1px solid #3498db',
            borderRadius: '12px',
            boxShadow: isCurrentUser 
              ? '0 6px 20px rgba(76, 175, 80, 0.3)' 
              : '0 6px 20px rgba(52, 152, 219, 0.3)',
            fontFamily: 'inherit'
          },
          bodyStyle: {
            fontSize: '14px',
            fontWeight: '600',
            padding: '4px 0'
          },
          progressStyle: {
            backgroundColor: isCurrentUser ? '#4caf50' : '#3498db',
            height: '3px'
          },
          icon: isCurrentUser ? '✅' : '🔔'
        })
      } else {
        console.log('🔔 Board: Notification not shown - validation failed:', {
          hasUserInfo: !!data.userInfo,
          isCorrectBoard: data.boardId === boardId,
          hasColumnTitle: !!data.columnTitle
        })
      }
      
      // Always reload the board for all members to ensure sync
      console.log('🔄 Board: Triggering synchronized board reload for all members');
      reloadBoardWithDelay()
    }

    // Toast notification handler for column deletion (Universal Notifications Pattern)
    const onColumnDeleted = (data) => {
      console.log('🗑️ Board: Column deleted event received (all members):', {
        columnTitle: data.columnTitle,
        userInfo: data.userInfo,
        currentUser: currentUser?.displayName,
        boardId: data.boardId,
        fullData: data
      })
      
      // Show notification for ALL members (including the actor)
      // This ensures complete synchronization across all users
      if (data.userInfo && 
          data.boardId === boardId &&
          data.columnTitle) {
        
        // Enhanced fallback logic
        const userName = data.userInfo.displayName || 
                        data.userInfo.username || 
                        'Người dùng không xác định'
        
        const columnName = data.columnTitle || 
                          data.title || 
                          'cột không có tên'
        
        // Different message for actor vs observers for delete action
        const isCurrentUser = data.userInfo._id === currentUser?._id
        const message = isCurrentUser 
          ? `✅ Bạn đã xóa cột: "${columnName}"` 
          : `🗑️ ${userName} đã xóa cột: "${columnName}"`
        
        console.log('🗑️ Board: Showing synchronized delete notification for all members:', {
          userName,
          columnName,
          isCurrentUser,
          message,
          boardId: data.boardId
        })
        
        // Unique toast ID to prevent duplicates across all members
        const toastId = `column-delete-all-${data.boardId}-${data.columnId || Date.now()}`
        
        toast.info(message, {
          toastId, // Prevent duplicate toasts with board-specific ID
          position: 'bottom-left',
          autoClose: 5000, // Slightly shorter for delete actions
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            backgroundColor: isCurrentUser ? '#2e7d32' : '#f57c00', // Green for actor, orange for observers
            color: '#ffffff',
            border: isCurrentUser ? '1px solid #4caf50' : '1px solid #ff9800',
            borderRadius: '12px',
            boxShadow: isCurrentUser 
              ? '0 6px 20px rgba(76, 175, 80, 0.3)' 
              : '0 6px 20px rgba(255, 152, 0, 0.3)', // Orange shadow for delete
            fontFamily: 'inherit'
          },
          bodyStyle: {
            fontSize: '14px',
            fontWeight: '600',
            padding: '4px 0'
          },
          progressStyle: {
            backgroundColor: isCurrentUser ? '#4caf50' : '#ff9800',
            height: '3px'
          },
          icon: isCurrentUser ? '✅' : '🗑️'
        })
      } else {
        console.log('🗑️ Board: Delete notification not shown - validation failed:', {
          hasUserInfo: !!data.userInfo,
          isCorrectBoard: data.boardId === boardId,
          hasColumnTitle: !!data.columnTitle
        })
      }
      
      // Always reload the board for all members to ensure sync
      console.log('🔄 Board: Triggering synchronized board reload for all members after deletion');
      reloadBoardWithDelay()
    }

    // Toast notification handler for column title update (Universal Notifications Pattern)
    const onColumnTitleUpdated = (data) => {
      console.log('📝 Board: Column title updated event received (all members):', {
        oldTitle: data.oldTitle,
        newTitle: data.newTitle,
        userInfo: data.userInfo,
        currentUser: currentUser?.displayName,
        boardId: data.boardId,
        fullData: data
      })
      
      // Show notification for ALL members (including the actor)
      // This ensures complete synchronization across all users
      if (data.userInfo && 
          data.boardId === boardId &&
          data.oldTitle && 
          data.newTitle) {
        
        // Enhanced fallback logic
        const userName = data.userInfo.displayName || 
                        data.userInfo.username || 
                        'Người dùng không xác định'
        
        const oldTitle = data.oldTitle || 'cột không có tên'
        const newTitle = data.newTitle || 'cột không có tên'
        
        // Different message for actor vs observers for title update
        const isCurrentUser = data.userInfo._id === currentUser?._id
        const message = isCurrentUser 
          ? `✅ Bạn đã đổi tên cột từ "${oldTitle}" thành "${newTitle}"` 
          : `📝 ${userName} đã đổi tên cột từ "${oldTitle}" thành "${newTitle}"`
        
        console.log('📝 Board: Showing synchronized title update notification for all members:', {
          userName,
          oldTitle,
          newTitle,
          isCurrentUser,
          message,
          boardId: data.boardId
        })
        
        // Unique toast ID to prevent duplicates across all members
        const toastId = `column-title-all-${data.boardId}-${data.columnId || Date.now()}`
        
        toast.info(message, {
          toastId, // Prevent duplicate toasts with board-specific ID
          position: 'bottom-left',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            backgroundColor: isCurrentUser ? '#2e7d32' : '#1976d2', // Green for actor, blue for observers
            color: '#ffffff',
            border: isCurrentUser ? '1px solid #4caf50' : '1px solid #2196f3',
            borderRadius: '12px',
            boxShadow: isCurrentUser 
              ? '0 6px 20px rgba(76, 175, 80, 0.3)' 
              : '0 6px 20px rgba(33, 150, 243, 0.3)', // Blue shadow for updates
            fontFamily: 'inherit'
          },
          bodyStyle: {
            fontSize: '14px',
            fontWeight: '600',
            padding: '4px 0'
          },
          progressStyle: {
            backgroundColor: isCurrentUser ? '#4caf50' : '#2196f3',
            height: '3px'
          },
          icon: isCurrentUser ? '✅' : '📝'
        })
      } else {
        console.log('📝 Board: Title update notification not shown - validation failed:', {
          hasUserInfo: !!data.userInfo,
          isCorrectBoard: data.boardId === boardId,
          hasOldTitle: !!data.oldTitle,
          hasNewTitle: !!data.newTitle
        })
      }
      
      // Always reload the board for all members to ensure sync
      console.log('🔄 Board: Triggering synchronized board reload for all members after title update');
      reloadBoardWithDelay()
    }

    // Toast notification handler for card completion status (Universal Notifications Pattern)
    const onCardCompleted = (data) => {
      console.log('✅ Board: Card completion status event received (all members):', {
        cardTitle: data.cardTitle,
        isCardCompleted: data.isCardCompleted,
        userInfo: data.userInfo,
        currentUser: currentUser?.displayName,
        boardId: data.boardId,
        fullData: data
      })
      
      // Show notification for ALL members (including the actor)
      // This ensures complete synchronization across all users
      if (data.userInfo && 
          data.boardId === boardId &&
          data.cardTitle !== undefined) {
        
        // Enhanced fallback logic
        const userName = data.userInfo.displayName || 
                        data.userInfo.username || 
                        'Người dùng không xác định'
        
        const cardTitle = data.cardTitle || 'thẻ không có tên'
        const actionText = data.isCardCompleted ? 'hoàn thành' : 'bỏ hoàn thành'
        
        // Different message for actor vs observers for card completion action
        const isCurrentUser = data.userInfo._id === currentUser?._id
        const message = isCurrentUser 
          ? `✅ Bạn đã ${actionText} thẻ: "${cardTitle}"` 
          : `✅ ${userName} đã ${actionText} thẻ: "${cardTitle}"`
        
        console.log('✅ Board: Showing synchronized card completion notification for all members:', {
          userName,
          cardTitle,
          actionText,
          isCurrentUser,
          message,
          boardId: data.boardId
        })
        
        // Unique toast ID to prevent duplicates across all members
        const toastId = `card-completion-all-${data.boardId}-${data.cardId || Date.now()}`
        
        toast.info(message, {
          toastId, // Prevent duplicate toasts with board-specific ID
          position: 'bottom-left',
          autoClose: 4000, // Standard duration for card actions
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            backgroundColor: isCurrentUser ? '#2e7d32' : '#4caf50', // Green for actor, lighter green for observers
            color: '#ffffff',
            border: isCurrentUser ? '1px solid #4caf50' : '1px solid #66bb6a',
            borderRadius: '12px',
            boxShadow: isCurrentUser 
              ? '0 6px 20px rgba(76, 175, 80, 0.3)' 
              : '0 6px 20px rgba(102, 187, 106, 0.3)', // Green theme for completion
            fontFamily: 'inherit'
          },
          bodyStyle: {
            fontSize: '14px',
            fontWeight: '600',
            padding: '4px 0'
          },
          progressStyle: {
            backgroundColor: isCurrentUser ? '#4caf50' : '#66bb6a',
            height: '3px'
          },
          icon: '✅'
        })
      } else {
        console.log('✅ Board: Card completion notification not shown - validation failed:', {
          hasUserInfo: !!data.userInfo,
          isCorrectBoard: data.boardId === boardId,
          hasCardTitle: data.cardTitle !== undefined
        })
      }
      
      // Always reload the board for all members to ensure sync
      console.log('🔄 Board: Triggering synchronized board reload for all members after card completion');
      reloadBoardWithDelay()
    }

    // Toast notification handler for card movement between columns
    const onCardMoved = (data) => {
      try {
        console.log('🔄 Board: Card movement event received (all members):', {
          cardTitle: data.cardTitle,
          columnMovement: `${data.fromColumnTitle} → ${data.toColumnTitle}`,
          userInfo: data.userInfo,
          currentUser: currentUser?.displayName,
          boardId: data.boardId,
          fullData: data
        })
        
        // Show notification for ALL members (including the actor)
        // This ensures complete synchronization across all users
        if (data.userInfo && 
            data.boardId === boardId &&
            data.cardTitle &&
            data.fromColumnTitle &&
            data.toColumnTitle) {
          
          const isCurrentUser = data.userInfo._id === currentUser?._id
          const userName = data.userInfo.displayName || data.userInfo.username || 'Unknown User'
          
          // Message format with movement context
          const message = isCurrentUser 
            ? `✅ Bạn đã di chuyển "${data.cardTitle}" từ "${data.fromColumnTitle}" sang "${data.toColumnTitle}"`
            : `🔄 ${userName} đã di chuyển "${data.cardTitle}" từ "${data.fromColumnTitle}" sang "${data.toColumnTitle}"`
          
          console.log('🔄 Board: Showing card movement toast for all members:', {
            message,
            isCurrentUser,
            userName,
            cardMovement: `${data.fromColumnTitle} → ${data.toColumnTitle}`
          })
          
          toast.info(message, {
            toastId: `card-moved-${data.boardId}-${data.cardId}`,
            position: 'bottom-left',
            autoClose: 4000,
            style: {
              backgroundColor: isCurrentUser ? '#2e7d32' : '#1976d2', // Green for actor, blue for observers
              color: '#ffffff',
              border: isCurrentUser ? '1px solid #4caf50' : '1px solid #2196f3'
            },
            icon: isCurrentUser ? '✅' : '🔄'
          })
        } else {
          console.log('🔄 Board: Card movement event ignored:', {
            reason: !data.userInfo ? 'Missing user info' : 
                    data.boardId !== boardId ? 'Different board' : 
                    !data.cardTitle ? 'Missing card title' :
                    !data.fromColumnTitle ? 'Missing from column title' :
                    !data.toColumnTitle ? 'Missing to column title' : 'Unknown'
          })
        }
      } catch (error) {
        console.error('🔄 Board: Error handling card movement event:', error)
      }
      reloadBoardWithDelay()
    }

    // Toast notification handler for card member updates (Universal Notifications Pattern)
    const onCardMemberUpdated = (data) => {
      console.log('👥 Board: Card member updated event received (all members):', {
        cardTitle: data.cardTitle,
        action: data.action,
        targetUser: data.targetUser,
        userInfo: data.userInfo,
        currentUser: currentUser?.displayName,
        boardId: data.boardId,
        fullData: data
      })
      
      // Show notification for ALL members (including the actor)
      if (data.userInfo && 
          data.boardId === boardId &&
          data.cardTitle &&
          data.targetUser &&
          data.action) {
        
        // Enhanced fallback logic
        const actorName = data.userInfo.displayName || 
                         data.userInfo.username || 
                         'Người dùng không xác định'
        
        const targetName = data.targetUser.displayName || 
                          data.targetUser.username || 
                          'thành viên'
        
        const cardTitle = data.cardTitle || 'thẻ không có tên'
        
        // Check if current user is the actor or the target
        const isCurrentUserActor = data.userInfo._id === currentUser?._id
        const isCurrentUserTarget = data.targetUser._id === currentUser?._id
        const isSelfAction = data.userInfo._id === data.targetUser._id // Actor và target là cùng một người
        
        let message = ''
        
        if (isCurrentUserActor && isSelfAction) {
          // Current user performed action on themselves (self join/leave)
          if (data.action === 'ADD') {
            message = `✅ Bạn đã tham gia thẻ: "${cardTitle}"`
          } else {
            message = `✅ Bạn đã rời khỏi thẻ: "${cardTitle}"`
          }
        } else if (isCurrentUserActor) {
          // Current user performed action on someone else
          if (data.action === 'ADD') {
            message = `✅ Bạn đã thêm ${targetName} vào thẻ: "${cardTitle}"`
          } else {
            message = `✅ Bạn đã xóa ${targetName} khỏi thẻ: "${cardTitle}"`
          }
        } else if (isCurrentUserTarget) {
          // Current user is the target of someone else's action
          if (data.action === 'ADD') {
            message = `👥 ${actorName} đã thêm bạn vào thẻ: "${cardTitle}"`
          } else {
            message = `👥 ${actorName} đã xóa bạn khỏi thẻ: "${cardTitle}"`
          }
        } else {
          // Current user is observer watching others' actions
          if (isSelfAction) {
            // Someone else performed self join/leave
            if (data.action === 'ADD') {
              message = `👥 ${actorName} đã tham gia thẻ: "${cardTitle}"`
            } else {
              message = `👥 ${actorName} đã rời khỏi thẻ: "${cardTitle}"`
            }
          } else {
            // Someone else performed action on another person
            if (data.action === 'ADD') {
              message = `👥 ${actorName} đã thêm ${targetName} vào thẻ: "${cardTitle}"`
            } else {
              message = `👥 ${actorName} đã xóa ${targetName} khỏi thẻ: "${cardTitle}"`
            }
          }
        }
        
        console.log('👥 Board: Showing synchronized card member notification for all members:', {
          actorName,
          targetName,
          cardTitle,
          action: data.action,
          isCurrentUserActor,
          isCurrentUserTarget,
          message,
          boardId: data.boardId
        })
        
        // Unique toast ID to prevent duplicates across all members
        const toastId = `card-member-all-${data.boardId}-${data.cardId}-${data.targetUser._id}-${data.action}`
        
        toast.info(message, {
          toastId, // Prevent duplicate toasts with specific ID
          position: 'bottom-left',
          autoClose: 4000, // Standard duration for card operations
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            backgroundColor: isCurrentUserActor ? '#2e7d32' : '#1976d2', // Green for actor, blue for observers/targets
            color: '#ffffff',
            border: isCurrentUserActor ? '1px solid #4caf50' : '1px solid #2196f3',
            borderRadius: '12px',
            boxShadow: isCurrentUserActor 
              ? '0 6px 20px rgba(76, 175, 80, 0.3)' 
              : '0 6px 20px rgba(33, 150, 243, 0.3)',
            fontFamily: 'inherit'
          },
          bodyStyle: {
            fontSize: '14px',
            fontWeight: '600',
            padding: '4px 0'
          },
          progressStyle: {
            backgroundColor: isCurrentUserActor ? '#4caf50' : '#2196f3',
            height: '3px'
          },
          icon: isCurrentUserActor ? '✅' : '👥'
        })
      } else {
        console.log('👥 Board: Card member notification not shown - validation failed:', {
          hasUserInfo: !!data.userInfo,
          isCorrectBoard: data.boardId === boardId,
          hasCardTitle: !!data.cardTitle,
          hasTargetUser: !!data.targetUser,
          hasAction: !!data.action
        })
      }
      
          // Always reload the board for all members to ensure sync
    console.log('👥 Board: Triggering synchronized board reload for card member update');
    reloadBoardWithDelay()
  }

  // Toast notification handler for card creation (Universal Notifications Pattern)
  const onCardCreated = (data) => {
    console.log('📝 Board: Card created event received (all members):', {
      cardTitle: data.cardTitle,
      columnTitle: data.columnTitle,
      userInfo: data.userInfo,
      currentUser: currentUser?.displayName,
      boardId: data.boardId,
      fullData: data
    })
    
    // Show notification for ALL members (including the actor)
    // This ensures complete synchronization across all users
    if (data.userInfo && 
        data.boardId === boardId &&
        data.cardTitle &&
        data.columnTitle) {
      
      // Enhanced fallback logic
      const userName = data.userInfo.displayName || 
                      data.userInfo.username || 
                      'Người dùng không xác định'
      
      const cardName = data.cardTitle || 'thẻ không có tên'
      const columnName = data.columnTitle || 'cột không có tên'
      
      // Different message for actor vs observers for card creation
      const isCurrentUser = data.userInfo._id === currentUser?._id
      const message = isCurrentUser 
        ? `✅ Bạn đã tạo thẻ mới: "${cardName}" trong "${columnName}"` 
        : `📝 ${userName} đã tạo thẻ mới: "${cardName}" trong "${columnName}"`
      
      console.log('📝 Board: Showing synchronized card creation notification for all members:', {
        userName,
        cardName,
        columnName,
        isCurrentUser,
        message,
        boardId: data.boardId
      })
      
      // Unique toast ID to prevent duplicates across all members
      const toastId = `card-create-all-${data.boardId}-${data.cardId || Date.now()}`
      
      toast.info(message, {
        toastId, // Prevent duplicate toasts with board-specific ID
        position: 'bottom-left',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: isCurrentUser ? '#2e7d32' : '#1976d2', // Green for actor, blue for observers
          color: '#ffffff',
          border: isCurrentUser ? '1px solid #4caf50' : '1px solid #2196f3',
          borderRadius: '12px',
          boxShadow: isCurrentUser 
            ? '0 6px 20px rgba(76, 175, 80, 0.3)' 
            : '0 6px 20px rgba(33, 150, 243, 0.3)', // Blue shadow for creation
          fontFamily: 'inherit'
        },
        bodyStyle: {
          fontSize: '14px',
          fontWeight: '600',
          padding: '4px 0'
        },
        progressStyle: {
          backgroundColor: isCurrentUser ? '#4caf50' : '#2196f3',
          height: '3px'
        },
        icon: isCurrentUser ? '✅' : '📝'
      })
    } else {
      console.log('📝 Board: Card creation notification not shown - validation failed:', {
        hasUserInfo: !!data.userInfo,
        isCorrectBoard: data.boardId === boardId,
        hasCardTitle: !!data.cardTitle,
        hasColumnTitle: !!data.columnTitle
      })
    }
    
    // Always reload the board for all members to ensure sync
    console.log('🔄 Board: Triggering synchronized board reload for all members after card creation');
    reloadBoardWithDelay()
  }

  const onCardCoverUpdated = (data) => {
    console.log('🖼️ Board: Card cover updated event received (all members):', {
      cardTitle: data.cardTitle,
      action: data.action,
      userInfo: data.userInfo,
      currentUser: currentUser?.displayName,
      boardId: data.boardId,
      fullData: data
    })
    
    // Show notification for ALL members (including the actor)
    if (data.userInfo && 
        data.boardId === boardId &&
        data.cardTitle &&
        data.action) {
      
      // Enhanced fallback logic
      const actorName = data.userInfo.displayName || 
                       data.userInfo.username || 
                       'Người dùng không xác định'
      
      const cardTitle = data.cardTitle || 'thẻ không có tên'
      
      // Check if current user is the actor
      const isCurrentUser = data.userInfo._id === currentUser?._id
      
      let message = ''
      let icon = '🖼️'
      
      if (data.action === 'UPDATE_COVER_COLOR') {
        const coverTypeText = data.coverType === 'gradient' ? 'gradient' : 'màu'
        message = isCurrentUser 
          ? `✅ Bạn đã cập nhật ảnh bìa ${coverTypeText} cho thẻ: "${cardTitle}"` 
          : `🖼️ ${actorName} đã cập nhật ảnh bìa ${coverTypeText} cho thẻ: "${cardTitle}"`
        icon = isCurrentUser ? '✅' : '🎨'
      } else if (data.action === 'UPLOAD_COVER_IMAGE') {
        const fileName = data.fileName ? ` (${data.fileName})` : ''
        message = isCurrentUser 
          ? `✅ Bạn đã tải lên ảnh bìa mới cho thẻ: "${cardTitle}"${fileName}` 
          : `🖼️ ${actorName} đã tải lên ảnh bìa mới cho thẻ: "${cardTitle}"${fileName}`
        icon = isCurrentUser ? '✅' : '📷'
      } else if (data.action === 'DELETE_COVER') {
        message = isCurrentUser 
          ? `✅ Bạn đã xóa ảnh bìa của thẻ: "${cardTitle}"` 
          : `🖼️ ${actorName} đã xóa ảnh bìa của thẻ: "${cardTitle}"`
        icon = isCurrentUser ? '✅' : '🗑️'
      }
      
      console.log('🖼️ Board: Showing synchronized card cover notification for all members:', {
        actorName,
        cardTitle,
        action: data.action,
        isCurrentUser,
        message,
        boardId: data.boardId
      })
      
      // Unique toast ID to prevent duplicates across all members
      const toastId = `card-cover-all-${data.boardId}-${data.cardId}-${data.action}-${Date.now()}`
      
      toast.info(message, {
        toastId, // Prevent duplicate toasts with specific ID
        position: 'bottom-left',
        autoClose: 4000, // Standard duration for card operations
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: isCurrentUser ? '#2e7d32' : '#1976d2', // Green for actor, blue for observers
          color: '#ffffff',
          border: isCurrentUser ? '1px solid #4caf50' : '1px solid #2196f3',
          borderRadius: '12px',
          boxShadow: isCurrentUser 
            ? '0 6px 20px rgba(76, 175, 80, 0.3)' 
            : '0 6px 20px rgba(33, 150, 243, 0.3)',
          fontFamily: 'inherit'
        },
        bodyStyle: {
          fontSize: '14px',
          fontWeight: '600',
          padding: '4px 0'
        },
        progressStyle: {
          backgroundColor: isCurrentUser ? '#4caf50' : '#2196f3',
          height: '3px'
        },
        icon: icon
      })
    } else {
      console.log('🖼️ Board: Card cover notification not shown - validation failed:', {
        hasUserInfo: !!data.userInfo,
        isCorrectBoard: data.boardId === boardId,
        hasCardTitle: !!data.cardTitle,
        hasAction: !!data.action
      })
    }
    
    // Always reload the board for all members to ensure sync
    console.log('🖼️ Board: Triggering synchronized board reload for card cover update');
    reloadBoardWithDelay()
  }

  // 📎 Attachment uploaded handler (Universal Notifications Pattern)
  const onAttachmentUploaded = (data) => {
    console.log('📎 Board: Attachment uploaded event received (all members):', data)

    if (data.userInfo && data.boardId === boardId && data.cardTitle) {
      const actorName = data.userInfo.displayName || data.userInfo.username || 'Người dùng'
      const isCurrentUser = data.userInfo._id === currentUser?._id

      const filesText = data.attachmentsCount > 1 ? `${data.attachmentsCount} tệp` : '1 tệp'

      const message = isCurrentUser
        ? `✅ Bạn đã tải lên ${filesText} cho thẻ: "${data.cardTitle}"`
        : `📎 ${actorName} đã tải lên ${filesText} cho thẻ: "${data.cardTitle}"`

      const toastId = `attach-all-${data.boardId}-${data.cardId}-${Date.now()}`

      toast.info(message, {
        toastId,
        position: 'bottom-left',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: isCurrentUser ? '#2e7d32' : '#1565c0',
          color: '#ffffff',
          border: isCurrentUser ? '1px solid #4caf50' : '1px solid #1976d2',
          borderRadius: '12px',
          boxShadow: isCurrentUser
            ? '0 6px 20px rgba(76, 175, 80, 0.3)'
            : '0 6px 20px rgba(21, 101, 192, 0.3)',
          fontFamily: 'inherit'
        },
        bodyStyle: {
          fontSize: '14px',
          fontWeight: '600',
          padding: '4px 0'
        },
        progressStyle: {
          backgroundColor: isCurrentUser ? '#4caf50' : '#1976d2',
          height: '3px'
        },
        icon: isCurrentUser ? '✅' : '📎'
      })
    }

    // Always reload board for sync
    reloadBoardWithDelay()
  }

  // 🗑️ Attachment deleted handler (Universal Notifications Pattern)
  const onAttachmentDeleted = (data) => {
    console.log('🗑️ Board: Attachment deleted event received (all members):', data)

    if (data.userInfo && data.boardId === boardId && data.cardTitle && data.attachmentName) {
      const actorName = data.userInfo.displayName || data.userInfo.username || 'Người dùng'
      const isCurrentUser = data.userInfo._id === currentUser?._id

      // Shorten file name if too long
      const fileName = data.attachmentName
      const shortName = fileName.length > 20 ? fileName.substring(0, 17) + '...' : fileName

      const message = isCurrentUser
        ? `✅ Bạn đã xóa "${shortName}" khỏi thẻ: "${data.cardTitle}"`
        : `🗑️ ${actorName} đã xóa "${shortName}" khỏi thẻ: "${data.cardTitle}"`

      const toastId = `attach-delete-${data.boardId}-${data.cardId}-${Date.now()}`

      toast.info(message, {
        toastId,
        position: 'bottom-left',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: isCurrentUser ? '#2e7d32' : '#f57c00',
          color: '#ffffff',
          border: isCurrentUser ? '1px solid #4caf50' : '1px solid #ff9800',
          borderRadius: '12px',
          boxShadow: isCurrentUser
            ? '0 6px 20px rgba(76, 175, 80, 0.3)'
            : '0 6px 20px rgba(245, 124, 0, 0.3)',
          fontFamily: 'inherit'
        },
        bodyStyle: {
          fontSize: '14px',
          fontWeight: '600',
          padding: '4px 0'
        },
        progressStyle: {
          backgroundColor: isCurrentUser ? '#4caf50' : '#ff9800',
          height: '3px'
        },
        icon: isCurrentUser ? '✅' : '🗑️'
      })
    }

    // Always reload board for sync
    reloadBoardWithDelay()
  }

  // Label update handler with Universal Notifications Pattern
  const onLabelUpdated = (data) => {
    console.log('🏷️ Board: Label updated event received (all members):', data)

    if (data.userInfo && data.boardId === boardId && data.cardTitle && data.labelName) {
      const actorName = data.userInfo.displayName || data.userInfo.username || 'Người dùng'
      const isCurrentUser = data.userInfo._id === currentUser?._id
      
      const action = data.action === 'ADD' ? 'thêm' : 'xóa'
      const preposition = data.action === 'ADD' ? 'vào' : 'khỏi'

      // Shorten label name if too long
      const labelName = data.labelName
      const shortLabelName = labelName.length > 15 ? labelName.substring(0, 12) + '...' : labelName

      const message = isCurrentUser
        ? `✅ Bạn đã ${action} nhãn "${shortLabelName}" ${preposition} thẻ: "${data.cardTitle}"`
        : `🏷️ ${actorName} đã ${action} nhãn "${shortLabelName}" ${preposition} thẻ: "${data.cardTitle}"`

      const toastId = `label-${data.action.toLowerCase()}-${data.boardId}-${data.cardId}-${Date.now()}`

      toast.info(message, {
        toastId,
        position: 'bottom-left',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: isCurrentUser ? '#2e7d32' : (data.action === 'ADD' ? '#1976d2' : '#f57c00'),
          color: '#ffffff',
          border: isCurrentUser ? '1px solid #4caf50' : (data.action === 'ADD' ? '1px solid #2196f3' : '1px solid #ff9800'),
          borderRadius: '12px',
          boxShadow: isCurrentUser
            ? '0 6px 20px rgba(76, 175, 80, 0.3)'
            : (data.action === 'ADD' 
                ? '0 6px 20px rgba(25, 118, 210, 0.3)' 
                : '0 6px 20px rgba(245, 124, 0, 0.3)'),
          fontFamily: 'inherit'
        },
        bodyStyle: {
          fontSize: '14px',
          fontWeight: '600',
          padding: '4px 0'
        },
        progressStyle: {
          backgroundColor: isCurrentUser ? '#4caf50' : (data.action === 'ADD' ? '#2196f3' : '#ff9800'),
          height: '3px'
        },
        icon: isCurrentUser ? '✅' : (data.action === 'ADD' ? '🏷️' : '🗑️')
      })
    }

    // Always reload board for sync
    reloadBoardWithDelay()
  }

  // Checklist deletion handler with Universal Notifications Pattern & Duplicate Prevention
  const onChecklistDeleted = (data) => {
    console.log('📝 Board: Checklist deleted event received (all members):', data)

    if (data.userInfo && data.boardId === boardId && data.checklistName && data.cardTitle) {
      const actorName = data.userInfo.displayName || data.userInfo.username || 'Người dùng'
      const isCurrentUser = data.userInfo._id === currentUser?._id

      // Shorten names if too long
      const checklistName = data.checklistName
      const shortChecklistName = checklistName.length > 20 ? checklistName.substring(0, 17) + '...' : checklistName
      const cardTitle = data.cardTitle
      const shortCardTitle = cardTitle.length > 25 ? cardTitle.substring(0, 22) + '...' : cardTitle

      const message = isCurrentUser
        ? `✅ Bạn đã xóa checklist "${shortChecklistName}" khỏi thẻ: "${shortCardTitle}"`
        : `🗑️ ${actorName} đã xóa checklist "${shortChecklistName}" khỏi thẻ: "${shortCardTitle}"`

      // Create deterministic toast ID to prevent duplicates (exclude timestamp)
      const toastId = `checklist-deleted-${data.boardId}-${data.cardId}-${data.checklistId}`

      // Additional duplicate prevention: check if this exact toast was shown recently
      if (toast.isActive(toastId)) {
        console.log('📝 Board: Duplicate checklist deletion toast prevented:', toastId)
        return
      }

      toast.info(message, {
        toastId, // This prevents duplicate toasts
        position: 'bottom-left',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: isCurrentUser ? '#2e7d32' : '#f57c00',
          color: '#ffffff',
          border: isCurrentUser ? '1px solid #4caf50' : '1px solid #ff9800',
          borderRadius: '12px',
          boxShadow: isCurrentUser
            ? '0 6px 20px rgba(76, 175, 80, 0.3)'
            : '0 6px 20px rgba(245, 124, 0, 0.3)',
          fontFamily: 'inherit'
        },
        bodyStyle: {
          fontSize: '14px',
          fontWeight: '600',
          padding: '4px 0'
        },
        progressStyle: {
          backgroundColor: isCurrentUser ? '#4caf50' : '#ff9800',
          height: '3px'
        },
        icon: isCurrentUser ? '✅' : '🗑️'
      })
    }

    // Always reload board for sync
    reloadBoardWithDelay()
  }

  // Checklist item deletion handler with Universal Notifications Pattern & Duplicate Prevention
  const onChecklistItemDeleted = (data) => {
    console.log('📝 Board: Checklist item deleted event received (all members):', data)

    if (data.userInfo && data.boardId === boardId && data.itemName && data.checklistName) {
      const actorName = data.userInfo.displayName || data.userInfo.username || 'Người dùng'
      const isCurrentUser = data.userInfo._id === currentUser?._id

      // Shorten names if too long
      const itemName = data.itemName
      const shortItemName = itemName.length > 20 ? itemName.substring(0, 17) + '...' : itemName
      const checklistName = data.checklistName
      const shortChecklistName = checklistName.length > 20 ? checklistName.substring(0, 17) + '...' : checklistName

      const message = isCurrentUser
        ? `✅ Bạn đã xóa "${shortItemName}" khỏi checklist "${shortChecklistName}"`
        : `🗑️ ${actorName} đã xóa "${shortItemName}" khỏi checklist "${shortChecklistName}"`

      // Create deterministic toast ID to prevent duplicates (exclude timestamp)
      const toastId = `checklist-item-deleted-${data.boardId}-${data.cardId}-${data.checklistId}-${data.itemId}`

      // Additional duplicate prevention: check if this exact toast was shown recently
      if (toast.isActive(toastId)) {
        console.log('📝 Board: Duplicate checklist item deletion toast prevented:', toastId)
        return
      }

      toast.info(message, {
        toastId, // This prevents duplicate toasts
        position: 'bottom-left',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: isCurrentUser ? '#2e7d32' : '#f57c00',
          color: '#ffffff',
          border: isCurrentUser ? '1px solid #4caf50' : '1px solid #ff9800',
          borderRadius: '12px',
          boxShadow: isCurrentUser
            ? '0 6px 20px rgba(76, 175, 80, 0.3)'
            : '0 6px 20px rgba(245, 124, 0, 0.3)',
          fontFamily: 'inherit'
        },
        bodyStyle: {
          fontSize: '14px',
          fontWeight: '600',
          padding: '4px 0'
        },
        progressStyle: {
          backgroundColor: isCurrentUser ? '#4caf50' : '#ff9800',
          height: '3px'
        },
        icon: isCurrentUser ? '✅' : '🗑️'
      })
    }

    // Always reload board for sync
    reloadBoardWithDelay()
  }

  // Checklist creation handler with Universal Notifications Pattern & Duplicate Prevention
  const onChecklistCreated = (data) => {
    console.log('📝 Board: Checklist created event received (all members):', data)

    if (data.userInfo && data.boardId === boardId && data.checklistName && data.cardTitle) {
      const actorName = data.userInfo.displayName || data.userInfo.username || 'Người dùng'
      const isCurrentUser = data.userInfo._id === currentUser?._id

      // Shorten names if too long
      const checklistName = data.checklistName
      const shortChecklistName = checklistName.length > 20 ? checklistName.substring(0, 17) + '...' : checklistName
      const cardTitle = data.cardTitle
      const shortCardTitle = cardTitle.length > 25 ? cardTitle.substring(0, 22) + '...' : cardTitle

      const message = isCurrentUser
        ? `✅ Bạn đã tạo checklist "${shortChecklistName}" trong thẻ: "${shortCardTitle}"`
        : `📋 ${actorName} đã tạo checklist "${shortChecklistName}" trong thẻ: "${shortCardTitle}"`

      // Create deterministic toast ID to prevent duplicates (exclude timestamp)
      const toastId = `checklist-created-${data.boardId}-${data.cardId}-${data.checklistId}`

      // Additional duplicate prevention: check if this exact toast was shown recently
      if (toast.isActive(toastId)) {
        console.log('📝 Board: Duplicate checklist creation toast prevented:', toastId)
        return
      }

      toast.success(message, {
        toastId, // This prevents duplicate toasts
        position: 'bottom-left',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: isCurrentUser ? '#2e7d32' : '#1976d2',
          color: '#ffffff',
          border: isCurrentUser ? '1px solid #4caf50' : '1px solid #42a5f5',
          borderRadius: '12px',
          boxShadow: isCurrentUser
            ? '0 6px 20px rgba(76, 175, 80, 0.3)'
            : '0 6px 20px rgba(25, 118, 210, 0.3)',
          fontFamily: 'inherit'
        },
        bodyStyle: {
          fontSize: '14px',
          fontWeight: '600',
          padding: '4px 0'
        },
        progressStyle: {
          backgroundColor: isCurrentUser ? '#4caf50' : '#42a5f5',
          height: '3px'
        },
        icon: isCurrentUser ? '✅' : '📋'
      })
    }

    // Always reload board for sync
    reloadBoardWithDelay()
  }

  // Checklist item creation handler with Universal Notifications Pattern & Duplicate Prevention
  const onChecklistItemCreated = (data) => {
    console.log('📝 Board: Checklist item created event received (all members):', data)

    if (data.userInfo && data.boardId === boardId && data.itemName && data.checklistName) {
      const actorName = data.userInfo.displayName || data.userInfo.username || 'Người dùng'
      const isCurrentUser = data.userInfo._id === currentUser?._id

      // Shorten names if too long
      const itemName = data.itemName
      const shortItemName = itemName.length > 20 ? itemName.substring(0, 17) + '...' : itemName
      const checklistName = data.checklistName
      const shortChecklistName = checklistName.length > 20 ? checklistName.substring(0, 17) + '...' : checklistName

      const message = isCurrentUser
        ? `✅ Bạn đã thêm "${shortItemName}" vào checklist "${shortChecklistName}"`
        : `📝 ${actorName} đã thêm "${shortItemName}" vào checklist "${shortChecklistName}"`

      // Create deterministic toast ID to prevent duplicates (exclude timestamp)
      const toastId = `checklist-item-created-${data.boardId}-${data.cardId}-${data.checklistId}-${data.itemId}`

      // Additional duplicate prevention: check if this exact toast was shown recently
      if (toast.isActive(toastId)) {
        console.log('📝 Board: Duplicate checklist item creation toast prevented:', toastId)
        return
      }

      toast.success(message, {
        toastId, // This prevents duplicate toasts
        position: 'bottom-left',
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: isCurrentUser ? '#2e7d32' : '#1976d2',
          color: '#ffffff',
          border: isCurrentUser ? '1px solid #4caf50' : '1px solid #42a5f5',
          borderRadius: '12px',
          boxShadow: isCurrentUser
            ? '0 6px 20px rgba(76, 175, 80, 0.3)'
            : '0 6px 20px rgba(25, 118, 210, 0.3)',
          fontFamily: 'inherit'
        },
        bodyStyle: {
          fontSize: '14px',
          fontWeight: '600',
          padding: '4px 0'
        },
        progressStyle: {
          backgroundColor: isCurrentUser ? '#4caf50' : '#42a5f5',
          height: '3px'
        },
        icon: isCurrentUser ? '✅' : '📝'
      })
    }

    // Always reload board for sync
    reloadBoardWithDelay()
  }

  // Checklist item status update handler with Universal Notifications Pattern & Duplicate Prevention
  const onChecklistItemStatusUpdated = (data) => {
    console.log('📝 Board: Checklist item status updated event received (all members):', data)

    if (data.userInfo && data.boardId === boardId && data.itemName && data.checklistName) {
      const actorName = data.userInfo.displayName || data.userInfo.username || 'Người dùng'
      const isCurrentUser = data.userInfo._id === currentUser?._id
      const isCompleted = data.isCompleted

      // Shorten names if too long
      const itemName = data.itemName
      const shortItemName = itemName.length > 20 ? itemName.substring(0, 17) + '...' : itemName
      const checklistName = data.checklistName
      const shortChecklistName = checklistName.length > 20 ? checklistName.substring(0, 17) + '...' : checklistName

      const action = isCompleted ? 'hoàn thành' : 'bỏ hoàn thành'
      const emoji = isCompleted ? '✅' : '⬜'
      
      const message = isCurrentUser
        ? `${emoji} Bạn đã ${action} "${shortItemName}" trong "${shortChecklistName}"`
        : `${emoji} ${actorName} đã ${action} "${shortItemName}" trong "${shortChecklistName}"`

      // Create deterministic toast ID to prevent duplicates (exclude timestamp)
      const toastId = `checklist-item-status-${data.boardId}-${data.cardId}-${data.checklistId}-${data.itemId}-${isCompleted}`

      // Additional duplicate prevention: check if this exact toast was shown recently
      if (toast.isActive(toastId)) {
        console.log('📝 Board: Duplicate checklist item status toast prevented:', toastId)
        return
      }

      toast.info(message, {
        toastId, // This prevents duplicate toasts
        position: 'bottom-left',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: isCurrentUser 
            ? (isCompleted ? '#2e7d32' : '#ed6c02') 
            : (isCompleted ? '#1976d2' : '#f57c00'),
          color: '#ffffff',
          border: isCurrentUser 
            ? (isCompleted ? '1px solid #4caf50' : '1px solid #ff9800') 
            : (isCompleted ? '1px solid #42a5f5' : '1px solid #ff9800'),
          borderRadius: '12px',
          boxShadow: isCurrentUser
            ? (isCompleted ? '0 6px 20px rgba(76, 175, 80, 0.3)' : '0 6px 20px rgba(237, 108, 2, 0.3)')
            : (isCompleted ? '0 6px 20px rgba(25, 118, 210, 0.3)' : '0 6px 20px rgba(245, 124, 0, 0.3)'),
          fontFamily: 'inherit'
        },
        bodyStyle: {
          fontSize: '14px',
          fontWeight: '600',
          padding: '4px 0'
        },
        progressStyle: {
          backgroundColor: isCurrentUser 
            ? (isCompleted ? '#4caf50' : '#ff9800') 
            : (isCompleted ? '#42a5f5' : '#ff9800'),
          height: '3px'
        },
        icon: emoji
      })
    }

    // Always reload board for sync
    reloadBoardWithDelay()
  }

  // Checklist update handler with Universal Notifications Pattern & Duplicate Prevention
  const onChecklistUpdated = (data) => {
    console.log('📝 Board: Checklist updated event received (all members):', data)

    if (data.userInfo && data.boardId === boardId && data.newTitle && data.cardTitle) {
      const actorName = data.userInfo.displayName || data.userInfo.username || 'Người dùng'
      const isCurrentUser = data.userInfo._id === currentUser?._id

      // Shorten names if too long
      const newTitle = data.newTitle
      const shortNewTitle = newTitle.length > 20 ? newTitle.substring(0, 17) + '...' : newTitle
      const cardTitle = data.cardTitle
      const shortCardTitle = cardTitle.length > 25 ? cardTitle.substring(0, 22) + '...' : cardTitle

      const message = isCurrentUser
        ? `✅ Bạn đã cập nhật checklist thành "${shortNewTitle}" trong thẻ: "${shortCardTitle}"`
        : `📝 ${actorName} đã cập nhật checklist thành "${shortNewTitle}" trong thẻ: "${shortCardTitle}"`

      // Create deterministic toast ID to prevent duplicates (exclude timestamp)
      const toastId = `checklist-updated-${data.boardId}-${data.cardId}-${data.checklistId}`

      // Additional duplicate prevention: check if this exact toast was shown recently
      if (toast.isActive(toastId)) {
        console.log('📝 Board: Duplicate checklist update toast prevented:', toastId)
        return
      }

      toast.info(message, {
        toastId, // This prevents duplicate toasts
        position: 'bottom-left',
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: isCurrentUser ? '#2e7d32' : '#1976d2',
          color: '#ffffff',
          border: isCurrentUser ? '1px solid #4caf50' : '1px solid #42a5f5',
          borderRadius: '12px',
          boxShadow: isCurrentUser
            ? '0 6px 20px rgba(76, 175, 80, 0.3)'
            : '0 6px 20px rgba(25, 118, 210, 0.3)',
          fontFamily: 'inherit'
        },
        bodyStyle: {
          fontSize: '14px',
          fontWeight: '600',
          padding: '4px 0'
        },
        progressStyle: {
          backgroundColor: isCurrentUser ? '#4caf50' : '#42a5f5',
          height: '3px'
        },
        icon: isCurrentUser ? '✅' : '📝'
      })
    }

    // Always reload board for sync
    reloadBoardWithDelay()
  }

  // Checklist item update handler with Universal Notifications Pattern & Duplicate Prevention
  const onChecklistItemUpdated = (data) => {
    console.log('📝 Board: Checklist item updated event received (all members):', data)

    if (data.userInfo && data.boardId === boardId && data.newTitle && data.checklistName) {
      const actorName = data.userInfo.displayName || data.userInfo.username || 'Người dùng'
      const isCurrentUser = data.userInfo._id === currentUser?._id

      // Shorten names if too long
      const newTitle = data.newTitle
      const shortNewTitle = newTitle.length > 20 ? newTitle.substring(0, 17) + '...' : newTitle
      const checklistName = data.checklistName
      const shortChecklistName = checklistName.length > 20 ? checklistName.substring(0, 17) + '...' : checklistName

      const message = isCurrentUser
        ? `✅ Bạn đã cập nhật item thành "${shortNewTitle}" trong "${shortChecklistName}"`
        : `📝 ${actorName} đã cập nhật item thành "${shortNewTitle}" trong "${shortChecklistName}"`

      // Create deterministic toast ID to prevent duplicates (exclude timestamp)
      const toastId = `checklist-item-updated-${data.boardId}-${data.cardId}-${data.checklistId}-${data.itemId}`

      // Additional duplicate prevention: check if this exact toast was shown recently
      if (toast.isActive(toastId)) {
        console.log('📝 Board: Duplicate checklist item update toast prevented:', toastId)
        return
      }

      toast.info(message, {
        toastId, // This prevents duplicate toasts
        position: 'bottom-left',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: isCurrentUser ? '#2e7d32' : '#1976d2',
          color: '#ffffff',
          border: isCurrentUser ? '1px solid #4caf50' : '1px solid #42a5f5',
          borderRadius: '12px',
          boxShadow: isCurrentUser
            ? '0 6px 20px rgba(76, 175, 80, 0.3)'
            : '0 6px 20px rgba(25, 118, 210, 0.3)',
          fontFamily: 'inherit'
        },
        bodyStyle: {
          fontSize: '14px',
          fontWeight: '600',
          padding: '4px 0'
        },
        progressStyle: {
          backgroundColor: isCurrentUser ? '#4caf50' : '#42a5f5',
          height: '3px'
        },
        icon: isCurrentUser ? '✅' : '📝'
      })
    }

    // Always reload board for sync
    reloadBoardWithDelay()
  }

  // Due Date Updated handler - Universal Notifications Pattern ✅
  const onCardDueDateUpdated = (data) => {
    console.log('🗓️ Board: Due date updated event received (all members):', {
      cardTitle: data.cardTitle,
      oldDueDate: data.oldDueDate,
      newDueDate: data.newDueDate,
      actionType: data.actionType,
      userInfo: data.userInfo,
      currentUser: currentUser?.displayName,
      boardId: data.boardId,
      fullData: data
    })

    // Show notification for ALL members following Universal Pattern
    if (data.userInfo && 
        data.boardId === boardId &&
        data.cardTitle) {
      
      // Enhanced fallback logic
      const userName = data.userInfo.displayName || 
                      data.userInfo.username || 
                      'Người dùng không xác định'
      
      const cardName = data.cardTitle || 'thẻ không có tên'
      
      // Format dates for Vietnamese display
      const formatDate = (dateStr) => {
        if (!dateStr) return 'chưa có'
        return new Date(dateStr).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }

      const oldDateStr = formatDate(data.oldDueDate)
      const newDateStr = formatDate(data.newDueDate)
      
      // Action type specific messaging
      const getActionText = (actionType) => {
        switch (actionType) {
          case 'SET': return 'đặt deadline'
          case 'UPDATE': return 'cập nhật deadline'
          case 'DRAG_DROP': return 'kéo thả deadline'
          default: return 'cập nhật deadline'
        }
      }

      // Different message for actor vs observers
      const isCurrentUser = data.userInfo._id === currentUser?._id
      const actionText = getActionText(data.actionType)
      const dateChangeText = `${oldDateStr} → ${newDateStr}`
      
      const message = isCurrentUser 
        ? `✅ Bạn đã ${actionText} cho "${cardName}": ${dateChangeText}` 
        : `🗓️ ${userName} đã ${actionText} cho "${cardName}": ${dateChangeText}`
      
      console.log('🗓️ Board: Showing due date update notification for all members:', {
        userName,
        cardName,
        actionText,
        dateChangeText,
        isCurrentUser,
        message,
        boardId: data.boardId
      })
      
      // Create unique toast ID to prevent duplicates
      const toastId = `due-date-updated-${data.boardId}-${data.cardId}-${data.timestamp || Date.now()}`
      
      toast.info(message, {
        toastId, // Prevent duplicate toasts
        position: 'bottom-left',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: isCurrentUser ? '#2e7d32' : '#1976d2', // Green for actor, blue for observers
          color: '#ffffff',
          border: isCurrentUser ? '1px solid #4caf50' : '1px solid #2196f3',
          borderRadius: '12px',
          boxShadow: isCurrentUser 
            ? '0 6px 20px rgba(76, 175, 80, 0.3)' 
            : '0 6px 20px rgba(33, 150, 243, 0.3)',
          fontFamily: 'inherit'
        },
        bodyStyle: {
          fontSize: '14px',
          fontWeight: '600',
          padding: '4px 0'
        },
        progressStyle: {
          backgroundColor: isCurrentUser ? '#4caf50' : '#2196f3',
          height: '3px'
        },
        icon: isCurrentUser ? '✅' : '🗓️'
      })
    } else {
      console.log('🗓️ Board: Due date update notification not shown - validation failed:', {
        hasUserInfo: !!data.userInfo,
        isCorrectBoard: data.boardId === boardId,
        hasCardTitle: !!data.cardTitle
      })
    }
    
    // Always reload the board for all members to ensure sync
    console.log('🔄 Board: Triggering synchronized board reload for due date update');
    reloadBoardWithDelay()
  }

  // Due Date Removed handler - Universal Notifications Pattern ✅
  const onCardDueDateRemoved = (data) => {
    console.log('🗑️ Board: Due date removed event received (all members):', {
      cardTitle: data.cardTitle,
      oldDueDate: data.oldDueDate,
      userInfo: data.userInfo,
      currentUser: currentUser?.displayName,
      boardId: data.boardId,
      fullData: data
    })

    // Show notification for ALL members following Universal Pattern
    if (data.userInfo && 
        data.boardId === boardId &&
        data.cardTitle) {
      
      // Enhanced fallback logic
      const userName = data.userInfo.displayName || 
                      data.userInfo.username || 
                      'Người dùng không xác định'
      
      const cardName = data.cardTitle || 'thẻ không có tên'
      
      // Format old date for display
      const formatDate = (dateStr) => {
        if (!dateStr) return 'chưa có'
        return new Date(dateStr).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }

      const oldDateStr = formatDate(data.oldDueDate)
      
      // Different message for actor vs observers for removal action
      const isCurrentUser = data.userInfo._id === currentUser?._id
      const message = isCurrentUser 
        ? `✅ Bạn đã xóa deadline cho "${cardName}": ${oldDateStr} → chưa có` 
        : `🗑️ ${userName} đã xóa deadline cho "${cardName}": ${oldDateStr} → chưa có`
      
      console.log('🗑️ Board: Showing due date removal notification for all members:', {
        userName,
        cardName,
        oldDateStr,
        isCurrentUser,
        message,
        boardId: data.boardId
      })
      
      // Create unique toast ID to prevent duplicates
      const toastId = `due-date-removed-${data.boardId}-${data.cardId}-${data.timestamp || Date.now()}`
      
      toast.info(message, {
        toastId, // Prevent duplicate toasts
        position: 'bottom-left',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: isCurrentUser ? '#2e7d32' : '#ff9800', // Green for actor, orange for observers
          color: '#ffffff',
          border: isCurrentUser ? '1px solid #4caf50' : '1px solid #ff9800',
          borderRadius: '12px',
          boxShadow: isCurrentUser 
            ? '0 6px 20px rgba(76, 175, 80, 0.3)' 
            : '0 6px 20px rgba(255, 152, 0, 0.3)',
          fontFamily: 'inherit'
        },
        bodyStyle: {
          fontSize: '14px',
          fontWeight: '600',
          padding: '4px 0'
        },
        progressStyle: {
          backgroundColor: isCurrentUser ? '#4caf50' : '#ff9800',
          height: '3px'
        },
        icon: isCurrentUser ? '✅' : '🗑️'
      })
    } else {
      console.log('🗑️ Board: Due date removal notification not shown - validation failed:', {
        hasUserInfo: !!data.userInfo,
        isCorrectBoard: data.boardId === boardId,
        hasCardTitle: !!data.cardTitle
      })
    }
    
    // Always reload the board for all members to ensure sync
    console.log('🔄 Board: Triggering synchronized board reload for due date removal');
    reloadBoardWithDelay()
  }

    // Regular event listeners (excluding dedicated handlers)
    socketIoInstance.on('BE_COLUMN_MOVED', onRealtimeEvent)
    socketIoInstance.on('BE_NEW_COMMENT', onRealtimeEvent)
    socketIoInstance.on('BE_CARD_UPDATED', onRealtimeEvent)
    socketIoInstance.on('BE_CARD_DELETED', onRealtimeEvent)
    socketIoInstance.on('BE_CARD_SORTED_IN_COLUMN', onRealtimeEvent)
    
    // Special handlers with Universal Notifications pattern
    socketIoInstance.on('BE_COLUMN_CREATED', onColumnCreated)
    socketIoInstance.on('BE_COLUMN_DELETED', onColumnDeleted)
    socketIoInstance.on('BE_COLUMN_UPDATED', onColumnTitleUpdated)
    socketIoInstance.on('BE_CARD_CREATED', onCardCreated)
    socketIoInstance.on('BE_CARD_COMPLETED', onCardCompleted)
    socketIoInstance.on('BE_CARD_MOVED', onCardMoved)
    socketIoInstance.on('BE_CARD_MEMBER_UPDATED', onCardMemberUpdated)
    socketIoInstance.on('BE_CARD_COVER_UPDATED', onCardCoverUpdated)
    socketIoInstance.on('BE_ATTACHMENT_UPLOADED', onAttachmentUploaded)
    socketIoInstance.on('BE_ATTACHMENT_DELETED', onAttachmentDeleted)
    socketIoInstance.on('BE_LABEL_UPDATED', onLabelUpdated)
    socketIoInstance.on('BE_CHECKLIST_DELETED', onChecklistDeleted)
    socketIoInstance.on('BE_CHECKLIST_ITEM_DELETED', onChecklistItemDeleted)
    socketIoInstance.on('BE_CHECKLIST_CREATED', onChecklistCreated)
    socketIoInstance.on('BE_CHECKLIST_ITEM_CREATED', onChecklistItemCreated)
    socketIoInstance.on('BE_CHECKLIST_ITEM_STATUS_UPDATED', onChecklistItemStatusUpdated)
    socketIoInstance.on('BE_CHECKLIST_UPDATED', onChecklistUpdated)
    socketIoInstance.on('BE_CHECKLIST_ITEM_UPDATED', onChecklistItemUpdated)
    socketIoInstance.on('BE_CARD_DUE_DATE_UPDATED', onCardDueDateUpdated)
    socketIoInstance.on('BE_CARD_DUE_DATE_REMOVED', onCardDueDateRemoved)
    
    // ... có thể thêm các event khác nếu cần
    return () => {
      socketIoInstance.off('BE_COLUMN_MOVED', onRealtimeEvent)
      socketIoInstance.off('BE_NEW_COMMENT', onRealtimeEvent)
      socketIoInstance.off('BE_CARD_UPDATED', onRealtimeEvent)
      socketIoInstance.off('BE_CARD_DELETED', onRealtimeEvent)
      socketIoInstance.off('BE_CARD_SORTED_IN_COLUMN', onRealtimeEvent)
      socketIoInstance.off('BE_COLUMN_CREATED', onColumnCreated)
      socketIoInstance.off('BE_COLUMN_DELETED', onColumnDeleted)
      socketIoInstance.off('BE_COLUMN_UPDATED', onColumnTitleUpdated)
      socketIoInstance.off('BE_CARD_CREATED', onCardCreated)
      socketIoInstance.off('BE_CARD_COMPLETED', onCardCompleted)
      socketIoInstance.off('BE_CARD_MOVED', onCardMoved)
      socketIoInstance.off('BE_CARD_MEMBER_UPDATED', onCardMemberUpdated)
      socketIoInstance.off('BE_CARD_COVER_UPDATED', onCardCoverUpdated)
      socketIoInstance.off('BE_ATTACHMENT_UPLOADED', onAttachmentUploaded)
      socketIoInstance.off('BE_ATTACHMENT_DELETED', onAttachmentDeleted)
      socketIoInstance.off('BE_LABEL_UPDATED', onLabelUpdated)
      socketIoInstance.off('BE_CHECKLIST_DELETED', onChecklistDeleted)
      socketIoInstance.off('BE_CHECKLIST_ITEM_DELETED', onChecklistItemDeleted)
      socketIoInstance.off('BE_CHECKLIST_CREATED', onChecklistCreated)
      socketIoInstance.off('BE_CHECKLIST_ITEM_CREATED', onChecklistItemCreated)
      socketIoInstance.off('BE_CHECKLIST_ITEM_STATUS_UPDATED', onChecklistItemStatusUpdated)
      socketIoInstance.off('BE_CHECKLIST_UPDATED', onChecklistUpdated)
      socketIoInstance.off('BE_CHECKLIST_ITEM_UPDATED', onChecklistItemUpdated)
      socketIoInstance.off('BE_CARD_DUE_DATE_UPDATED', onCardDueDateUpdated)
      socketIoInstance.off('BE_CARD_DUE_DATE_REMOVED', onCardDueDateRemoved)
      if (reloadTimeout) clearTimeout(reloadTimeout)
    }
  }, [dispatch, boardId, currentUser])

  /**
   * Func này có nhiệm vụ gọi API và xử lý khi kéo thả Column xong xuôi
   * Chỉ cần gọi API để cập nhật mảng columnOrderIds của Board chứa nó (thay đổi vị trí trong board)
   */
  const moveColumns = (dndOrderedColumns) => {
    // Update cho chuẩn dữ liệu state Board
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)

    /**
    * Trường hợp dùng Spread Operator này thì lại không sao bởi vì ở đây chúng ta không dùng push như ở trường hợp createNewColumn thôi :))
    */
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))

    // Gọi API update Board
    updateBoardDetailsAPI(newBoard._id, { columnOrderIds: dndOrderedColumnsIds })
    // Emit realtime
    socketIoInstance.emit('FE_COLUMN_MOVED', {
      boardId: newBoard._id,
      columnOrderIds: dndOrderedColumnsIds
    })
  }

  /**
   * Khi di chuyển card trong cùng Column:
   * Chỉ cần gọi API để cập nhật mảng cardOrderIds của Column chứa nó (thay đổi vị trí trong mảng)
   */
  const moveCardInTheSameColumn = (dndOrderedCards, dndOrderedCardIds, columnId) => {
    // Update cho chuẩn dữ liệu state Board

    /**
    * Cannot assign to read only property 'cards' of object
    * Trường hợp Immutability ở đây đã đụng tới giá trị cards đang được coi là chỉ đọc read only - (nested object - can thiệp sâu dữ liệu)
    */
    // const newBoard = { ...board }
    const newBoard = cloneDeep(board)
    const columnToUpdate = newBoard.columns.find(column => column._id === columnId)
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards
      columnToUpdate.cardOrderIds = dndOrderedCardIds
    }
    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))

    // Gọi API update Column
    updateColumnDetailsAPI(columnId, { cardOrderIds: dndOrderedCardIds })
    // Emit realtime di chuyển card trong cùng cột
    socketIoInstance.emit('FE_CARD_SORTED_IN_COLUMN', {
      boardId: board._id,
      columnId,
      cardOrderIds: dndOrderedCardIds
    })
  }

  /**
   * Khi di chuyển card sang Column khác:
   * B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (Hiểu bản chất là xóa cái _id của Card ra khỏi mảng)
   * B2: Cập nhật mảng cardOrderIds của Column tiếp theo (Hiểu bản chất là thêm _id của Card vào mảng)
   * B3: Cập nhật lại trường columnId mới của cái Card đã kéo
   * => Làm một API support riêng.
   */
  const moveCardToDifferentColumn = (currentCardId, prevColumnId, nextColumnId, dndOrderedColumns) => {
    // Update cho chuẩn dữ liệu state Board
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)

    // Tương tự đoạn xử lý chỗ hàm moveColumns nên không ảnh hưởng Redux Toolkit Immutability gì ở đây cả.
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))

    // Gọi API xử lý phía BE
    let prevCardOrderIds = dndOrderedColumns.find(c => c._id === prevColumnId)?.cardOrderIds
    // Xử lý vấn đề khi kéo Card cuối cùng ra khỏi Column, Column rỗng sẽ có placeholder card, cần xóa nó đi trước khi gửi dữ liệu lên cho phía BE. (Nhớ lại video 37.2)
    if (prevCardOrderIds[0].includes('placeholder-card')) prevCardOrderIds = []

    moveCardToDifferentColumnAPI({
      currentCardId,
      prevColumnId,
      prevCardOrderIds,
      nextColumnId,
      nextCardOrderIds: dndOrderedColumns.find(c => c._id === nextColumnId)?.cardOrderIds
    })

    // Enhanced data structure cho Universal Notifications với validation
    if (!currentUser?._id) {
      console.error('🔄 Frontend: Cannot emit card movement - missing current user info')
      return
    }
    
    if (!board?._id) {
      console.error('🔄 Frontend: Cannot emit card movement - missing board info')
      return
    }

    // Find card và column details để có context đầy đủ
    const movedCard = dndOrderedColumns
      .flatMap(col => col.cards)
      .find(card => card._id === currentCardId)
    
    const fromColumn = dndOrderedColumns.find(c => c._id === prevColumnId)
    const toColumn = dndOrderedColumns.find(c => c._id === nextColumnId)

    const cardMoveData = {
      boardId: board._id,
      cardId: currentCardId,
      cardTitle: movedCard?.title || 'Untitled Card',
      fromColumnId: prevColumnId,
      toColumnId: nextColumnId,
      fromColumnTitle: fromColumn?.title || 'Unknown Column',
      toColumnTitle: toColumn?.title || 'Unknown Column',
      userInfo: {
        _id: currentUser._id,
        displayName: currentUser.displayName || currentUser.username || 'Unknown User',
        username: currentUser.username || 'unknown',
        avatar: currentUser.avatar || null
      },
      timestamp: new Date().toISOString()
    }

    console.log('🔄 Frontend: Emitting card movement with enhanced data:', {
      cardMovement: `${cardMoveData.cardTitle}: ${cardMoveData.fromColumnTitle} → ${cardMoveData.toColumnTitle}`,
      userDisplayName: cardMoveData.userInfo.displayName,
      hasUserInfo: !!cardMoveData.userInfo._id
    })

    // Emit realtime với complete data structure
    try {
      socketIoInstance.emit('FE_CARD_MOVED', cardMoveData)
      console.log('🔄 Frontend: Successfully emitted card movement event')
    } catch (error) {
      console.error('🔄 Frontend: Error emitting card movement event:', error)
    }
  }

  // Lấy background style dựa trên boardBackground từ Redux
  const getBackgroundStyles = () => {
    if (!boardBackground) return {}

    if (boardBackground.type === BACKGROUND_TYPES.COLOR) {
      return { backgroundColor: boardBackground.value }
    }

    if (boardBackground.type === BACKGROUND_TYPES.IMAGE || boardBackground.type === BACKGROUND_TYPES.UPLOAD) {
      return {
        backgroundImage: `url(${boardBackground.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    }

    // Nếu là gradient (phần mở rộng)
    if (boardBackground.type === BACKGROUND_TYPES.GRADIENT) {
      return { background: boardBackground.value }
    }

    return {}
  }

  if (!board) {
    return <PageLoadingSpinner caption="Loading Board..." />
  }

  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        height: '100vh',
        // Apply background từ Redux store
        ...getBackgroundStyles(),
        // Đảm bảo content bên trong vẫn đọc được dễ dàng
        '&::before': (boardBackground?.type === BACKGROUND_TYPES.IMAGE || boardBackground?.type === BACKGROUND_TYPES.UPLOAD) ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.3)', // Overlay tối cho hình ảnh
          zIndex: 0
        } : {}
      }}
    >
      {/* Modal Active Card, check đóng/mở dựa theo cái State isShowModalActiveCard lưu trong Redux */}
      <ActiveCard />

      {/* Các thành phần còn lại của Board Details */}
      <AppBar />
      <BoardBar board={board} boardId={boardId} onOpenFilterDrawer={() => setFilterDrawerOpen(true)} />
      <BoardContent
        board={board}
        // 3 cái trường hợp move dưới đây thì giữ nguyên để code xử lý kéo thả ở phần BoardContent không bị quá dài mất kiểm soát khi đọc code, maintain.
        moveColumns={moveColumns}
        moveCardInTheSameColumn={moveCardInTheSameColumn}
        moveCardToDifferentColumn={moveCardToDifferentColumn}
        filterDrawerOpen={filterDrawerOpen}
        setFilterDrawerOpen={setFilterDrawerOpen}
      />
    </Container>
  )
}

export default Board
