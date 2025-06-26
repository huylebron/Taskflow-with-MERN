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
        
        // Different message for actor vs observers for title update action
        const isCurrentUser = data.userInfo._id === currentUser?._id
        const message = isCurrentUser 
          ? `✅ Bạn đã đổi tên cột từ "${oldTitle}" thành "${newTitle}"` 
          : `📝 ${userName} đã đổi tên cột từ "${oldTitle}" thành "${newTitle}"`
        
        console.log('📝 Board: Showing synchronized title update notification for all members:', {
          userName,
          titleChange: `${oldTitle} → ${newTitle}`,
          isCurrentUser,
          message,
          boardId: data.boardId
        })
        
        // Unique toast ID to prevent duplicates across all members
        const toastId = `column-title-update-all-${data.boardId}-${data.columnId || Date.now()}`
        
        toast.info(message, {
          toastId, // Prevent duplicate toasts with board-specific ID
          position: 'bottom-left',
          autoClose: 4000, // Standard duration for title updates
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
              : '0 6px 20px rgba(33, 150, 243, 0.3)', // Blue shadow for title update
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

    // Regular event listeners (excluding BE_COLUMN_CREATED, BE_COLUMN_DELETED, and BE_COLUMN_UPDATED)
    socketIoInstance.on('BE_CARD_MOVED', onRealtimeEvent)
    socketIoInstance.on('BE_COLUMN_MOVED', onRealtimeEvent)
    socketIoInstance.on('BE_NEW_COMMENT', onRealtimeEvent)
    socketIoInstance.on('BE_CARD_UPDATED', onRealtimeEvent)
    socketIoInstance.on('BE_LABEL_UPDATED', onRealtimeEvent)
    socketIoInstance.on('BE_CARD_DELETED', onRealtimeEvent)
    socketIoInstance.on('BE_CARD_CREATED', onRealtimeEvent)
    socketIoInstance.on('BE_CARD_SORTED_IN_COLUMN', onRealtimeEvent)
    socketIoInstance.on('BE_CHECKLIST_DELETED', onRealtimeEvent)
    socketIoInstance.on('BE_CHECKLIST_ITEM_DELETED', onRealtimeEvent)
    
    // Special handlers with Universal Notifications pattern
    socketIoInstance.on('BE_COLUMN_CREATED', onColumnCreated)
    socketIoInstance.on('BE_COLUMN_DELETED', onColumnDeleted)
    socketIoInstance.on('BE_COLUMN_UPDATED', onColumnTitleUpdated)
    socketIoInstance.on('BE_CARD_COMPLETED', onCardCompleted)
    
    // ... có thể thêm các event khác nếu cần
    return () => {
      socketIoInstance.off('BE_CARD_MOVED', onRealtimeEvent)
      socketIoInstance.off('BE_COLUMN_MOVED', onRealtimeEvent)
      socketIoInstance.off('BE_NEW_COMMENT', onRealtimeEvent)
      socketIoInstance.off('BE_CARD_UPDATED', onRealtimeEvent)
      socketIoInstance.off('BE_LABEL_UPDATED', onRealtimeEvent)
      socketIoInstance.off('BE_CARD_DELETED', onRealtimeEvent)
      socketIoInstance.off('BE_CARD_CREATED', onRealtimeEvent)
      socketIoInstance.off('BE_CARD_SORTED_IN_COLUMN', onRealtimeEvent)
      socketIoInstance.off('BE_CHECKLIST_DELETED', onRealtimeEvent)
      socketIoInstance.off('BE_CHECKLIST_ITEM_DELETED', onRealtimeEvent)
      socketIoInstance.off('BE_COLUMN_CREATED', onColumnCreated)
      socketIoInstance.off('BE_COLUMN_DELETED', onColumnDeleted)
      socketIoInstance.off('BE_COLUMN_UPDATED', onColumnTitleUpdated)
      socketIoInstance.off('BE_CARD_COMPLETED', onCardCompleted)
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
    // Emit realtime
    socketIoInstance.emit('FE_CARD_MOVED', {
      boardId: board._id,
      cardId: currentCardId,
      fromColumnId: prevColumnId,
      toColumnId: nextColumnId
    })
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
