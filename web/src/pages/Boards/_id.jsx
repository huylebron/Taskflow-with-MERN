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
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import ActiveCard from '~/components/Modal/ActiveCard/ActiveCard'
import { BACKGROUND_TYPES } from '~/utils/backgroundConstants'
import { socketIoInstance } from '~/socketClient'

function Board() {
  const dispatch = useDispatch()
  // Không dùng State của component nữa mà chuyển qua dùng State của Redux
  // const [board, setBoard] = useState(null)
  const board = useSelector(selectCurrentActiveBoard)
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
    socketIoInstance.on('BE_CARD_MOVED', onRealtimeEvent)
    socketIoInstance.on('BE_COLUMN_MOVED', onRealtimeEvent)
    socketIoInstance.on('BE_NEW_COMMENT', onRealtimeEvent)
    socketIoInstance.on('BE_COLUMN_UPDATED', onRealtimeEvent)
    socketIoInstance.on('BE_CARD_UPDATED', onRealtimeEvent)
    socketIoInstance.on('BE_LABEL_UPDATED', onRealtimeEvent)
    socketIoInstance.on('BE_CARD_DELETED', onRealtimeEvent)
    socketIoInstance.on('BE_CARD_CREATED', onRealtimeEvent)
    socketIoInstance.on('BE_COLUMN_CREATED', onRealtimeEvent)
    socketIoInstance.on('BE_COLUMN_DELETED', onRealtimeEvent)
    socketIoInstance.on('BE_CARD_SORTED_IN_COLUMN', onRealtimeEvent)
    socketIoInstance.on('BE_CHECKLIST_DELETED', onRealtimeEvent)
    socketIoInstance.on('BE_CHECKLIST_ITEM_DELETED', onRealtimeEvent)
    // ... có thể thêm các event khác nếu cần
    return () => {
      socketIoInstance.off('BE_CARD_MOVED', onRealtimeEvent)
      socketIoInstance.off('BE_COLUMN_MOVED', onRealtimeEvent)
      socketIoInstance.off('BE_NEW_COMMENT', onRealtimeEvent)
      socketIoInstance.off('BE_COLUMN_UPDATED', onRealtimeEvent)
      socketIoInstance.off('BE_CARD_UPDATED', onRealtimeEvent)
      socketIoInstance.off('BE_LABEL_UPDATED', onRealtimeEvent)
      socketIoInstance.off('BE_CARD_DELETED', onRealtimeEvent)
      socketIoInstance.off('BE_CARD_CREATED', onRealtimeEvent)
      socketIoInstance.off('BE_COLUMN_CREATED', onRealtimeEvent)
      socketIoInstance.off('BE_COLUMN_DELETED', onRealtimeEvent)
      socketIoInstance.off('BE_CARD_SORTED_IN_COLUMN', onRealtimeEvent)
      socketIoInstance.off('BE_CHECKLIST_DELETED', onRealtimeEvent)
      socketIoInstance.off('BE_CHECKLIST_ITEM_DELETED', onRealtimeEvent)
      if (reloadTimeout) clearTimeout(reloadTimeout)
    }
  }, [dispatch, boardId])

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

    if (boardBackground.type === BACKGROUND_TYPES.IMAGE) {
      return {
        backgroundImage: `url(${boardBackground.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
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
        '&::before': boardBackground?.type === BACKGROUND_TYPES.IMAGE ? {
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
