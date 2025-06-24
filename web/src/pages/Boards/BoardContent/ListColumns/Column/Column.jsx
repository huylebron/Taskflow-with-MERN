import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import ContentCut from '@mui/icons-material/ContentCut'
import ContentCopy from '@mui/icons-material/ContentCopy'
import ContentPaste from '@mui/icons-material/ContentPaste'
import Cloud from '@mui/icons-material/Cloud'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Tooltip from '@mui/material/Tooltip'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import AddCardIcon from '@mui/icons-material/AddCard'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import ColorLensIcon from '@mui/icons-material/ColorLens'
import ListCards from './ListCards/ListCards'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'
import { useConfirm } from 'material-ui-confirm'
import { createNewCardAPI, deleteColumnDetailsAPI, updateColumnDetailsAPI } from '~/apis'
import {
  updateCurrentActiveBoard,
  selectCurrentActiveBoard
} from '~/redux/activeBoard/activeBoardSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { useDispatch, useSelector } from 'react-redux'
import { cloneDeep } from 'lodash'
import ToggleFocusInput from '~/components/Form/ToggleFocusInput'
import ColumnColorModal from '~/components/Modal/ColumnColorModal'
import { getTextColorForBackground } from '~/utils/formatters'
import { updateColumnInBoard } from '~/redux/activeBoard/activeBoardSlice'
import CircularProgress from '@mui/material/CircularProgress'
import { socketIoInstance } from '~/socketClient'

function Column({ column, shouldShake = false, shakeItemId }) {
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActiveBoard)
  const currentUser = useSelector(selectCurrentUser)

  // Thêm state và ref cho bell shake animation
  const [isShaking, setIsShaking] = useState(false)
  const columnRef = useRef(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column._id,
    data: { ...column }
  })

  // Effect để handle shake animation từ prop
  useEffect(() => {
    if (shouldShake && !isDragging) {
      setIsShaking(true)
      const timer = setTimeout(() => {
        setIsShaking(false)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [shouldShake, isDragging])
  const dndKitColumnStyles = {
    // touchAction: 'none', // Dành cho sensor default dạng PointerSensor
    // Nếu sử dụng CSS.Transform như docs sẽ lỗi kiểu stretch
    // https://github.com/clauderic/dnd-kit/issues/117
    transform: CSS.Translate.toString(transform),
    transition,
    // Chiều cao phải luôn max 100% vì nếu không sẽ lỗi lúc kéo column ngắn qua một cái column dài thì phải kéo ở khu vực giữa giữa rất khó chịu (demo ở video 32). Lưu ý lúc này phải kết hợp với {...listeners} nằm ở Box chứ không phải ở div ngoài cùng để tránh trường hợp kéo vào vùng xanh.
    height: '100%',
    opacity: isDragging ? 0.5 : undefined,
    boxShadow: isDragging ? 'none' : undefined,
    WebkitBoxShadow: isDragging ? 'none' : undefined,
    MozBoxShadow: isDragging ? 'none' : undefined
  }

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  // Cards đã được sắp xếp ở component cha cao nhất (boards/_id.jsx) (Video 71 đã giải thích lý do)
  const orderedCards = column.cards

  const [openNewCardForm, setOpenNewCardForm] = useState(false)
  const toggleOpenNewCardForm = () => setOpenNewCardForm(!openNewCardForm)

  const [newCardTitle, setNewCardTitle] = useState('')

  // State để quản lý Column Color Modal
  const [showColumnColorModal, setShowColumnColorModal] = useState(false)
  const [isUpdatingColor, setIsUpdatingColor] = useState(false)

  const addNewCard = async () => {
    if (!newCardTitle) {
      toast.error('Please enter Card Title!', { position: 'bottom-right' })
      return
    }

    // Tạo dữ liệu Card để gọi API
    const newCardData = {
      title: newCardTitle,
      columnId: column._id
    }

    // Gọi API tạo mới Card và làm lại dữ liệu State Board
    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id
    })

    // Emit realtime thêm card
    socketIoInstance.emit('FE_CARD_CREATED', {
      boardId: board._id,
      columnId: createdCard.columnId,
      cardId: createdCard._id
    })

    // Cập nhật state board
    // Phía Front-end chúng ta phải tự làm đúng lại state data board (thay vì phải gọi lại api fetchBoardDetailsAPI)
    // Lưu ý: cách làm này phụ thuộc vào tùy lựa chọn và đặc thù dự án, có nơi thì BE sẽ hỗ trợ trả về luôn toàn bộ Board dù đây có là api tạo Column hay Card đi chăng nữa. => Lúc này FE sẽ nhàn hơn.

    // Tương tự hàm createNewColumn nên chỗ này dùng cloneDeep
    // const newBoard = { ...board }
    const newBoard = cloneDeep(board)
    const columnToUpdate = newBoard.columns.find(column => column._id === createdCard.columnId)
    if (columnToUpdate) {
      // Nếu column rỗng: bản chất là đang chứa một cái Placeholder card (Nhớ lại video 37.2, hiện tại là video 69)
      if (columnToUpdate.cards.some(card => card.FE_PlaceholderCard)) {
        columnToUpdate.cards = [createdCard]
        columnToUpdate.cardOrderIds = [createdCard._id]
      } else {
        // Ngược lại Column đã có data thì push vào cuối mảng
        columnToUpdate.cards.push(createdCard)
        columnToUpdate.cardOrderIds.push(createdCard._id)
      }
    }
    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))

    // Đóng trạng thái thêm Card mới & Clear Input
    toggleOpenNewCardForm()
    setNewCardTitle('')
  }

  // Xử lý xóa một Column và Cards bên trong nó
  const confirmDeleteColumn = useConfirm()
  const handleDeleteColumn = () => {
    // Calculate cards count for enhanced warning
    const cardCount = orderedCards ? orderedCards.filter(card => !card.FE_PlaceholderCard).length : 0
    
    // Enhanced confirmation dialog with real-time notification warning
    const enhancedDescription = (
      <div style={{ color: '#333' }}>
        {/* Main warning */}
        <div style={{ marginBottom: '16px', fontSize: '14px', lineHeight: '1.5' }}>
          <strong>⚠️ Cảnh báo: Hành động này sẽ xóa vĩnh viễn:</strong>
        </div>
        
        {/* What will be deleted */}
        <div style={{ 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          borderRadius: '6px', 
          padding: '12px', 
          marginBottom: '16px' 
        }}>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>📁 Cột: "{column?.title || 'Untitled Column'}"</div>
          {cardCount > 0 ? (
            <div>📋 {cardCount} thẻ bên trong cột</div>
          ) : (
            <div style={{ color: '#6c757d' }}>📋 Cột trống (không có thẻ nào)</div>
          )}
        </div>

        {/* Real-time notification warning */}
        <div style={{ 
          backgroundColor: '#e8f4fd', 
          border: '1px solid #b3d7ff', 
          borderRadius: '6px', 
          padding: '12px', 
          marginBottom: '16px' 
        }}>
          <div style={{ fontWeight: '600', marginBottom: '8px', color: '#0066cc' }}>
            🔔 Thông báo Real-time
          </div>
          <div style={{ fontSize: '13px', lineHeight: '1.4', color: '#333' }}>
            Tất cả thành viên trong board sẽ nhận được thông báo khi bạn xóa cột này. 
            Họ sẽ thấy thông báo "bạn đã xóa cột" và board sẽ được cập nhật ngay lập tức.
          </div>
        </div>

        {/* Final confirmation */}
        <div style={{ 
          color: '#dc3545', 
          fontWeight: '600', 
          textAlign: 'center',
          fontSize: '14px'
        }}>
          ❌ Hành động này KHÔNG THỂ hoàn tác!
        </div>
      </div>
    )

    confirmDeleteColumn({
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc3545' }}>
          🗑️ Xác nhận xóa cột
        </div>
      ),
      content: enhancedDescription,
      confirmationText: 'XÓA VĨNH VIỄN',
      cancellationText: 'Hủy bỏ',
      dialogProps: { maxWidth: 'sm' },
      confirmationButtonProps: { 
        color: 'error', 
        variant: 'contained',
        sx: {
          backgroundColor: '#dc3545',
          '&:hover': {
            backgroundColor: '#c82333'
          }
        }
      },
      cancellationButtonProps: { 
        color: 'inherit',
        variant: 'outlined'
      },
      allowClose: false // Force user to make explicit choice
    }).then(() => {
      // Update cho chuẩn dữ liệu state Board

      // Tương tự đoạn xử lý chỗ hàm moveColumns nên không ảnh hưởng Redux Toolkit Immutability gì ở đây cả.
      const newBoard = { ...board }
      newBoard.columns = newBoard.columns.filter(c => c._id !== column._id)
      newBoard.columnOrderIds = newBoard.columnOrderIds.filter(_id => _id !== column._id)
      // setBoard(newBoard)
      dispatch(updateCurrentActiveBoard(newBoard))

      // Gọi API xử lý phía BE
      deleteColumnDetailsAPI(column._id).then(res => {
        // ✅ REMOVED DEFAULT TOAST - Only use enhanced real-time toast with user info
        console.log('🗑️ Frontend: Column deleted successfully, proceeding with real-time notification')
        
        // Enhanced data structure với user info và column details cho Universal Notifications
        // Validation để đảm bảo dữ liệu an toàn
        if (!currentUser?._id) {
          console.error('🗑️ Frontend: Cannot emit column deletion - missing current user info')
          return
        }
        
        if (!board?._id) {
          console.error('🗑️ Frontend: Cannot emit column deletion - missing board info')
          return
        }
        
        const columnDeleteData = {
          boardId: board._id,
          columnId: column._id,
          columnTitle: column?.title || 'Untitled Column',
          userInfo: {
            _id: currentUser._id,
            displayName: currentUser.displayName || currentUser.username || 'Unknown User',
            username: currentUser.username || 'unknown',
            avatar: currentUser.avatar || null
          },
          timestamp: new Date().toISOString()
        }
        
        console.log('🗑️ Frontend: Emitting column deletion with enhanced data:', {
          boardId: columnDeleteData.boardId,
          columnTitle: columnDeleteData.columnTitle,
          userDisplayName: columnDeleteData.userInfo.displayName,
          hasUserInfo: !!columnDeleteData.userInfo._id
        })
        
        // Emit realtime xoá column với complete data structure
        try {
          socketIoInstance.emit('FE_COLUMN_DELETED', columnDeleteData)
          console.log('🗑️ Frontend: Successfully emitted column deletion event')
        } catch (error) {
          console.error('🗑️ Frontend: Error emitting column deletion event:', error)
        }
      })
    }).catch(() => {})
  }

  const onUpdateColumnTitle = (newTitle) => {
    // Gọi API update Column và xử lý dữ liệu board trong redux
    updateColumnDetailsAPI(column._id, { title: newTitle }).then(() => {
      const newBoard = cloneDeep(board)
      const columnToUpdate = newBoard.columns.find(c => c._id === column._id)
      if (columnToUpdate) columnToUpdate.title = newTitle

      dispatch(updateCurrentActiveBoard(newBoard))
    })
  }

  // Handle Column Color Modal
  const handleShowColumnColorModal = (e) => {
    e.stopPropagation() // Prevent event bubbling
    setShowColumnColorModal(true)
  }

  const handleCloseColumnColorModal = () => {
    setShowColumnColorModal(false)
  }

  const handleSelectColumnColor = async (color, type) => {
    try {
      setIsUpdatingColor(true)

      // Cập nhật màu column trong state
      const columnToUpdate = {
        ...column,
        color: type === 'default' ? null : color,
        colorType: type === 'default' ? null : type
      }

      // Dispatch action để cập nhật trực tiếp vào Redux
      dispatch(updateColumnInBoard(columnToUpdate))

      // Gọi API để cập nhật màu column thông qua updateColumnDetailsAPI
      await updateColumnDetailsAPI(column._id, {
        color: columnToUpdate.color,
        colorType: columnToUpdate.colorType
      })

      toast.success('Đã cập nhật màu cột!', { position: 'bottom-right' })
    } catch (error) {
      toast.error('Không thể cập nhật màu cột!', { position: 'bottom-right' })
      console.error('Error updating column color:', error)
    } finally {
      setIsUpdatingColor(false)
      handleCloseColumnColorModal()
    }
  }

  // Phải bọc div ở đây vì vấn đề chiều cao của column khi kéo thả sẽ có bug kiểu kiểu flickering (video 32)
  return (
    <div 
      ref={setNodeRef} 
      style={dndKitColumnStyles} 
      {...attributes}
      data-dragging={isDragging}
      className={`
        ${isShaking ? 'drag-shake-column' : ''}
        ${isDragging ? 'drag-active-column' : ''}
      `.trim()}
    >
      <Box
        {...listeners}
        sx={{
          minWidth: '300px',
          maxWidth: '300px',
          bgcolor: column?.color || ((theme) => (theme.palette.mode === 'dark' ? '#333643' : '#ebecf0')),
          boxShadow: isDragging ? 'none !important' : undefined,
          ml: 2,
          borderRadius: '6px',
          height: 'fit-content',
          maxHeight: (theme) => `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)})`,
          color: column?.color ? getTextColorForBackground(column.color) : 'inherit'
        }}
      >
        {/* Box Column Header */}
        <Box sx={{
          height: (theme) => theme.trello.columnHeaderHeight,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <ToggleFocusInput
            value={column?.title}
            onChangedValue={onUpdateColumnTitle}
            data-no-dnd="true"
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Icon đổi màu cột */}
            <Tooltip title="Change Column Color">
              {isUpdatingColor ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px' }}>
                  <CircularProgress size={16} />
                </Box>
              ) : (
                <ColorLensIcon
                  sx={{
                    color: 'text.primary',
                    cursor: 'pointer',
                    fontSize: '20px',
                    '&:hover': { color: 'primary.main' }
                  }}
                  onClick={handleShowColumnColorModal}
                  data-no-dnd="true"
                />
              )}
            </Tooltip>

            <Tooltip title="More options">
              <ExpandMoreIcon
                sx={{ color: 'text.primary', cursor: 'pointer' }}
                id="basic-column-dropdown"
                aria-controls={open ? 'basic-menu-column-dropdown' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
              />
            </Tooltip>
          </Box>
        </Box>

        {/* List Cards */}
        <ListCards cards={orderedCards} shakeItemId={shakeItemId} />

        {/* Box Column Footer */}
        <Box sx={{
          height: (theme) => theme.trello.columnFooterHeight,
          p: 2
        }}>
          {!openNewCardForm
            ? <Box sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Button
                startIcon={<AddCardIcon />}
                onClick={toggleOpenNewCardForm}
                sx={{
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  color: column?.color ? getTextColorForBackground(column.color) : 'text.secondary',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: column?.color
                      ? `${column.color}20`
                      : (theme) => theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.04)',
                    transform: 'translateY(-1px)',
                    color: column?.color ? getTextColorForBackground(column.color) : 'primary.main'
                  },
                  '& .MuiButton-startIcon': {
                    color: 'inherit'
                  }
                }}
              >
                Add new card
              </Button>
              <Tooltip title="Drag to move">
                <DragHandleIcon
                  sx={{
                    cursor: 'pointer',
                    color: column?.color ? getTextColorForBackground(column.color) : 'text.secondary',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: column?.color ? getTextColorForBackground(column.color) : 'primary.main',
                      transform: 'scale(1.1)'
                    }
                  }}
                />
              </Tooltip>
            </Box>
            : <Box sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <TextField
                label="Enter card title..."
                type="text"
                size="small"
                variant="outlined"
                autoFocus
                data-no-dnd="true"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                sx={{
                  '& label': {
                    color: column?.color ? getTextColorForBackground(column.color) : (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'),
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  },
                  '& input': {
                    color: column?.color ? getTextColorForBackground(column.color) : (theme) => (theme.palette.mode === 'dark' ? '#ffffff' : '#000000'),
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#2a2d3a' : 'white'),
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  },
                  '& label.Mui-focused': {
                    color: (theme) => theme.palette.primary.main,
                    fontWeight: 600
                  },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    '& fieldset': {
                      borderColor: column?.color
                        ? `${column.color}60`
                        : (theme) => theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.23)'
                          : 'rgba(0, 0, 0, 0.23)',
                      borderWidth: '1.5px'
                    },
                    '&:hover fieldset': {
                      borderColor: column?.color
                        ? `${column.color}80`
                        : (theme) => theme.palette.primary.main,
                      borderWidth: '1.5px'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: (theme) => theme.palette.primary.main,
                      borderWidth: '2px'
                    }
                  }
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  className="interceptor-loading"
                  onClick={addNewCard}
                  variant="contained"
                  color="success"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    borderRadius: '8px',
                    padding: '6px 16px',
                    boxShadow: '0 2px 4px rgba(40, 167, 69, 0.2)',
                    border: '1px solid',
                    borderColor: (theme) => theme.palette.success.main,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: (theme) => theme.palette.success.dark,
                      borderColor: (theme) => theme.palette.success.dark,
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 8px rgba(40, 167, 69, 0.3)'
                    },
                    '&:active': {
                      transform: 'translateY(0px)'
                    }
                  }}
                >
                  Add
                </Button>
                <CloseIcon
                  fontSize="small"
                  sx={{
                    color: (theme) => theme.palette.mode === 'dark' ? '#ff9800' : '#f57c00',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    padding: '4px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: (theme) => theme.palette.mode === 'dark'
                        ? 'rgba(255, 152, 0, 0.1)'
                        : 'rgba(245, 124, 0, 0.1)',
                      color: (theme) => theme.palette.mode === 'dark' ? '#ffb74d' : '#e65100',
                      transform: 'scale(1.1)'
                    }
                  }}
                  onClick={toggleOpenNewCardForm}
                />
              </Box>
            </Box>
          }
        </Box>

        <Menu
          id="basic-menu-column-dropdown"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-column-dropdown'
          }}
        >
          <MenuItem
            onClick={toggleOpenNewCardForm}
            sx={{
              '&:hover': {
                color: 'success.light',
                '& .add-card-icon': { color: 'success.light' }
              }
            }}
          >
            <ListItemIcon><AddCardIcon className="add-card-icon" fontSize="small" /></ListItemIcon>
            <ListItemText>Add new card</ListItemText>
          </MenuItem>
          <MenuItem>
            <ListItemIcon><ContentCut fontSize="small" /></ListItemIcon>
            <ListItemText>Cut</ListItemText>
          </MenuItem>
          <MenuItem>
            <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
            <ListItemText>Copy</ListItemText>
          </MenuItem>
          <MenuItem>
            <ListItemIcon><ContentPaste fontSize="small" /></ListItemIcon>
            <ListItemText>Paste</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={handleDeleteColumn}
            sx={{
              '&:hover': {
                color: 'warning.dark',
                '& .delete-forever-icon': { color: 'warning.dark' }
              }
            }}
          >
            <ListItemIcon><DeleteForeverIcon className="delete-forever-icon" fontSize="small" /></ListItemIcon>
            <ListItemText>Delete this column</ListItemText>
          </MenuItem>
          <MenuItem>
            <ListItemIcon><Cloud fontSize="small" /></ListItemIcon>
            <ListItemText>Archive this column</ListItemText>
          </MenuItem>
        </Menu>
      </Box>

      {/* Column Color Modal */}
      <ColumnColorModal
        isOpen={showColumnColorModal}
        onClose={handleCloseColumnColorModal}
        onSelectColor={handleSelectColumnColor}
      />
    </div>
  )
}

export default Column
