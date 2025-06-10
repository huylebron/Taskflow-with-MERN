import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import CancelIcon from '@mui/icons-material/Cancel'
import Grid from '@mui/material/Unstable_Grid2'
import Stack from '@mui/material/Stack'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import SubjectRoundedIcon from '@mui/icons-material/SubjectRounded'
import DvrOutlinedIcon from '@mui/icons-material/DvrOutlined'

import ToggleFocusInput from '~/components/Form/ToggleFocusInput'
import VisuallyHiddenInput from '~/components/Form/VisuallyHiddenInput'
import { singleFileValidator } from '~/utils/validators'
import { toast } from 'react-toastify'
import CardUserGroup from './CardUserGroup'
import CardDescriptionMdEditor from './CardDescriptionMdEditor'
import CardActivitySection from './CardActivitySection'
import { useDispatch, useSelector } from 'react-redux'
import { useState, useEffect } from 'react'
import {
  clearAndHideCurrentActiveCard,
  selectCurrentActiveCard,
  updateCurrentActiveCard,
  selectIsShowModalActiveCard
} from '~/redux/activeCard/activeCardSlice'
import { updateCardDetailsAPI } from '~/apis'
import { 
  updateCardInBoard, 
  selectCurrentActiveBoard,
  addLabelToBoard,
  deleteLabelFromBoard,
  updateCardLabels
} from '~/redux/activeBoard/activeBoardSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { CARD_MEMBER_ACTIONS } from '~/utils/constants'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

import { styled } from '@mui/material/styles'
import ImageLightbox from '../ImageLightbox/ImageLightbox'
import CoverOptionsModal from './CoverOptionsModal'
import AttachmentModal from './AttachmentModal' // ✅ Removed MOCK_ATTACHMENTS import
import LabelDialog from '../LabelDialog/LabelDialog'
import { generateLabelId } from '~/utils/labelConstants'
import { toggleLabel } from '~/utils/labelHelpers'
import Chip from '@mui/material/Chip'
import LabelChip from '~/components/LabelChip/LabelChip'
import ChecklistDialog from '../ChecklistDialog/ChecklistDialog'
import { MOCK_CHECKLISTS } from '~/utils/checklistConstants'

// Import the new due date API function for optimized calendar operations
import { updateCardDueDateAPI } from '~/apis'
import { useCalendarSync } from '~/customHooks/useCalendarSync'
import {
  addLabelToBoardAPI,
  deleteLabelFromBoardAPI,
  updateCardLabelsAPI
} from '~/apis'

const SidebarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  color: theme.palette.mode === 'dark' ? '#90caf9' : '#172b4d',
  backgroundColor: theme.palette.mode === 'dark' ? '#2f3542' : '#091e420f',
  padding: '10px',
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#33485D' : theme.palette.grey[300],
    '&.active': {
      color: theme.palette.mode === 'dark' ? '#000000de' : '#0c66e4',
      backgroundColor: theme.palette.mode === 'dark' ? '#90caf9' : '#e9f2ff'
    }
  }
}))

/**
 * Note: Modal là một low-component mà bọn MUI sử dụng bên trong những thứ như Dialog, Drawer, Menu, Popover. Ở đây dĩ nhiên chúng ta có thể sử dụng Dialog cũng không thành vấn đề gì, nhưng sẽ sử dụng Modal để dễ linh hoạt tùy biến giao diện từ con số 0 cho phù hợp với mọi nhu cầu nhé.
 */
function ActiveCard() {
  const dispatch = useDispatch()
  const activeCard = useSelector(selectCurrentActiveCard)
  const isShowModalActiveCard = useSelector(selectIsShowModalActiveCard)
  const currentUser = useSelector(selectCurrentUser)
  const activeBoard = useSelector(selectCurrentActiveBoard)
  const [showCoverLightbox, setShowCoverLightbox] = useState(false)
  const [showCoverOptions, setShowCoverOptions] = useState(false)
  const [showLabelDialog, setShowLabelDialog] = useState(false)

  // Use calendar synchronization hook for due date management
  const { updateDueDate, triggerCalendarRefresh } = useCalendarSync()

  // State for Attachment feature - 🚨 CRITICAL: Thay thế MOCK_ATTACHMENTS
  const [showAttachmentModal, setShowAttachmentModal] = useState(false)
  const [attachments, setAttachments] = useState([]) // ✅ Removed MOCK_ATTACHMENTS
  const [showAttachmentLightbox, setShowAttachmentLightbox] = useState(false)
  const [selectedAttachment, setSelectedAttachment] = useState(null)

  // State for Checklist feature - Remove mock data
  const [showChecklistDialog, setShowChecklistDialog] = useState(false)
  const [checklists, setChecklists] = useState(activeCard?.checklists || [])

  // Update checklists when activeCard changes
  useEffect(() => {
    if (activeCard?.checklists) {
      setChecklists(activeCard.checklists)
    }
  }, [activeCard])

  // State for "Thêm" button dropdown menu
  const [anchorEl, setAnchorEl] = useState(null);
  const openMoreMenu = Boolean(anchorEl);
  const handleMoreMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMoreMenuClose = () => {
    setAnchorEl(null);
  };

  // State for Due Date Picker
  const [showDueDatePicker, setShowDueDatePicker] = useState(false)
  const [selectedDateTime, setSelectedDateTime] = useState('')

  // Helper functions cho due date
  const formatDueDateDisplay = (dueDate) => {
    if (!dueDate) return ''
    
    const due = new Date(dueDate)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())
    
    const diffInDays = Math.ceil((dueDay - today) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) {
      return `Hôm nay lúc ${due.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffInDays === 1) {
      return `Ngày mai lúc ${due.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffInDays === -1) {
      return `Hôm qua lúc ${due.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffInDays < 0) {
      return `${Math.abs(diffInDays)} ngày trước lúc ${due.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffInDays <= 7) {
      return `${diffInDays} ngày nữa lúc ${due.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return due.toLocaleString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const getDueDateStatusColor = (dueDate) => {
    if (!dueDate) return 'inherit'
    
    const now = new Date()
    const due = new Date(dueDate)
    const diffInHours = (due - now) / (1000 * 60 * 60)
    
    if (diffInHours < 0) {
      return '#d32f2f' // Đỏ - đã quá hạn
    } else if (diffInHours <= 24) {
      return '#f57c00' // Cam - sắp hết hạn
    } else {
      return 'inherit' // Bình thường
    }
  }

  // Không dùng biến State để check đóng mở Modal nữa vì chúng ta sẽ check theo cái biến isShowModalActiveCard trong redux
  // const [isOpen, setIsOpen] = useState(true)
  // const handleOpenModal = () => setIsOpen(true)
  const handleCloseModal = () => {
    // setIsOpen(false)
    dispatch(clearAndHideCurrentActiveCard())
  }

  // Func gọi API dùng chung cho các trường hợp update card title, description, cover, comment...vv
  const callApiUpdateCard = async (updateData) => {
    const updatedCard = await updateCardDetailsAPI(activeCard._id, updateData)

    // B1: Cập nhật lại cái card đang active trong modal hiện tại
    dispatch(updateCurrentActiveCard(updatedCard))

    // B2: Cập nhật lại cái bản ghi card trong cái activeBoard (nested data)
    dispatch(updateCardInBoard(updatedCard))

    return updatedCard
  }

  const onUpdateCardTitle = (newTitle) => {
    callApiUpdateCard({ title: newTitle.trim() })
  }

  const onUpdateCardDescription = (newDescription) => {
    callApiUpdateCard({ description: newDescription })
  }

  const onUploadCardCover = (event) => {
    // console.log(event.target?.files[0])
    const error = singleFileValidator(event.target?.files[0])
    if (error) {
      toast.error(error)
      return
    }
    let reqData = new FormData()
    reqData.append('cardCover', event.target?.files[0])

    // Gọi API...
    toast.promise(
      callApiUpdateCard(reqData).finally(() => event.target.value = ''),
      { pending: 'Updating...' }
    )
  }

  const onDeleteCardCover = async () => {
    try {
      // Gọi API để xóa cover
      await callApiUpdateCard({ deleteCardCover: true })
      
      // Thông báo thành công
      toast.success('Xóa ảnh cover thành công!', { position: 'bottom-right' })
    } catch (error) {
      toast.error('Xóa ảnh cover thất bại!', { position: 'bottom-right' })
    }
  }

  // Dùng async await ở đây để component con CardActivitySection chờ và nếu thành công thì mới clear thẻ input comment
  const onAddCardComment = async (commentToAdd) => {
    await callApiUpdateCard({ commentToAdd })
  }

  const onUpdateCardMembers = (incomingMemberInfo) => {
    callApiUpdateCard({ incomingMemberInfo })
  }

  const handleCoverClick = (e) => {
    setShowCoverLightbox(true)
  }

  const handleCloseCoverLightbox = () => {
    setShowCoverLightbox(false)
  }

  const onShowCoverOptions = () => {
    setShowCoverOptions(true)
  }

  const onCloseCoverOptions = () => {
    setShowCoverOptions(false)
  }

  const onSelectCoverColor = async (coverValue, coverType) => {
    try {
      // Gọi API để cập nhật cover với màu hoặc gradient
      await callApiUpdateCard({
        cover: coverValue,
        coverType: coverType
      })
      
      // Thông báo thành công
      toast.success('Cập nhật ảnh bìa thành công!', { position: 'bottom-right' })
    } catch (error) {
      toast.error('Cập nhật ảnh bìa thất bại!', { position: 'bottom-right' })
    }
  }

  const onUploadCoverFromModal = (file) => {
    let reqData = new FormData()
    reqData.append('cardCover', file)

    // Gọi API...
    toast.promise(
      callApiUpdateCard(reqData),
      { pending: 'Đang tải lên...', success: 'Cập nhật ảnh bìa thành công!', error: 'Cập nhật ảnh bìa thất bại!' }
    )
  }

  // Handlers for Attachment feature
  const onShowAttachmentModal = () => {
    setShowAttachmentModal(true)
  }

  const onCloseAttachmentModal = () => {
    setShowAttachmentModal(false)
  }

  // 🔥 QUAN TRỌNG: Updated attachment handlers for API integration
  const onAddAttachment = (newAttachment) => {
    setAttachments(prev => [...prev, newAttachment])
    // Toast success đã được handle trong AttachmentModal
  }

  const onDeleteAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(attachment => (attachment._id || attachment.id) !== attachmentId))
    // Toast success đã được handle trong AttachmentModal
  }

  const onShowAttachmentLightbox = (attachment) => {
    if (attachment.type.startsWith('image/')) {
      setSelectedAttachment(attachment)
      setShowAttachmentLightbox(true)
    } else {
      // Nếu không phải ảnh, mở trong tab mới
      window.open(attachment.url, '_blank')
    }
  }

  const onCloseAttachmentLightbox = () => {
    setShowAttachmentLightbox(false)
    setSelectedAttachment(null)
  }

  // Label features
  const onShowLabelDialog = () => {
    setShowLabelDialog(true)
  }

  const onCloseLabelDialog = () => {
    setShowLabelDialog(false)
  }

  const onToggleLabel = async (labelId) => {
    const currentLabelIds = activeCard?.labelIds || []
    const updatedLabelIds = toggleLabel(labelId, currentLabelIds)
    // Cập nhật local state trước (optimistic update)
    const updatedCard = { ...activeCard, labelIds: updatedLabelIds }
    dispatch(updateCurrentActiveCard(updatedCard))
    dispatch(updateCardLabels({ cardId: activeCard._id, labelIds: updatedLabelIds }))
    // Gọi API để cập nhật labelIds cho card
    try {
      await updateCardLabelsAPI(activeCard._id, updatedLabelIds)
    } catch (err) {
      toast.error('Có lỗi khi cập nhật label cho card!')
    }
  }

  const onCreateLabel = async (newLabel) => {
    const labelWithId = { ...newLabel, id: generateLabelId() }
    // Gọi API để thêm label vào board
    try {
      await addLabelToBoardAPI(activeBoard._id, labelWithId)
      dispatch(addLabelToBoard(labelWithId))
      // Tự động gán label mới vào card hiện tại
      await onToggleLabel(labelWithId.id)
      toast.success('Tạo label mới thành công!', { position: 'bottom-right' })
    } catch (err) {
      toast.error('Có lỗi khi tạo label mới!')
    }
  }

  const onDeleteLabel = async (labelId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa label này? Label sẽ bị xóa khỏi tất cả các card.')) {
      try {
        await deleteLabelFromBoardAPI(activeBoard._id, labelId)
        dispatch(deleteLabelFromBoard(labelId))
        toast.success('Xóa label thành công!', { position: 'bottom-right' })
      } catch (err) {
        toast.error('Có lỗi khi xóa label!')
      }
    }
  }

  // Handlers for Checklist feature
  const onShowChecklistDialog = () => {
    setShowChecklistDialog(true)
  }

  const onCloseChecklistDialog = () => {
    setShowChecklistDialog(false)
  }

  const onUpdateChecklists = async (updatedChecklists) => {
    try {
      // Update local state
      setChecklists(updatedChecklists)
      
      // Update card in Redux store
      const updatedCard = { ...activeCard, checklists: updatedChecklists }
      dispatch(updateCurrentActiveCard(updatedCard))
      dispatch(updateCardInBoard(updatedCard))
      
      toast.success('Cập nhật checklist thành công!')
    } catch (error) {
      toast.error('Có lỗi khi cập nhật checklist!')
    }
  }

  // Due Date handlers
  const onShowDueDatePicker = () => {
    // Khởi tạo với giá trị hiện tại nếu có, hoặc giá trị mặc định
    const currentDueDate = activeCard?.dueDate
    if (currentDueDate) {
      const date = new Date(currentDueDate)
      // Format để phù hợp với input datetime-local
      const formattedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
      setSelectedDateTime(formattedDate)
    } else {
      // Mặc định là 1 giờ từ bây giờ
      const defaultDate = new Date()
      defaultDate.setHours(defaultDate.getHours() + 1)
      const formattedDate = new Date(defaultDate.getTime() - defaultDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
      setSelectedDateTime(formattedDate)
    }
    setShowDueDatePicker(true)
    handleMoreMenuClose()
  }

  const onCloseDueDatePicker = () => {
    setShowDueDatePicker(false)
    setSelectedDateTime('')
  }

  const onSaveDueDate = async () => {
    if (!selectedDateTime) {
      toast.error('Vui lòng chọn ngày và giờ')
      return
    }

    try {
      // Validate the selected date
      const selectedDate = new Date(selectedDateTime)
      if (isNaN(selectedDate.getTime())) {
        toast.error('Ngày giờ không hợp lệ!')
        return
      }

      // Check if date is not in the past (optional validation)
      const now = new Date()
      if (selectedDate < now) {
        // Warning for past dates but still allow
        if (!window.confirm('Ngày đã chọn đã qua. Bạn có chắc chắn muốn tiếp tục?')) {
          return
        }
      }

      const dueDate = selectedDate.toISOString()
      
      // Use the synchronization hook for better state management
      await updateDueDate(activeCard._id, dueDate, {
        optimistic: true,
        showToast: true,
        source: 'active-card-modal'
      })
      
      // Trigger calendar refresh to show updated due date
      triggerCalendarRefresh()
      
      onCloseDueDatePicker()
    } catch (error) {
      console.error('Error updating due date:', error)
      // Error toast is handled by the sync hook
    }
  }

  const onRemoveDueDate = async () => {
    try {
      // Confirm before removing due date
      if (!window.confirm('Bạn có chắc chắn muốn xóa ngày hết hạn?')) {
        return
      }

      // Use the synchronization hook for consistent state management
      await updateDueDate(activeCard._id, null, {
        optimistic: true,
        showToast: true,
        source: 'active-card-modal-remove'
      })
      
      // Trigger calendar refresh to show removed due date
      triggerCalendarRefresh()
      
      onCloseDueDatePicker()
    } catch (error) {
      console.error('Error removing due date:', error)
      // Error toast is handled by the sync hook
    }
  }

  // Quick due date update function for calendar drag-and-drop operations
  const onQuickUpdateDueDate = async (newDueDate) => {
    try {
      // Use the synchronization hook for optimistic updates and consistent state management
      return await updateDueDate(activeCard._id, newDueDate, {
        optimistic: true,
        showToast: true,
        source: 'calendar-drag-drop-to-modal'
      })
    } catch (error) {
      console.error('Error updating due date via calendar:', error)
      throw error
    }
  }

  return (
    <Modal
      disableScrollLock
      open={isShowModalActiveCard}
      onClose={handleCloseModal}
      sx={{ overflowY: 'auto' }}>
      <Box sx={{
        position: 'relative',
        width: 1100,
        maxWidth: 1100,
        bgcolor: 'white',
        boxShadow: 24,
        borderRadius: '8px',
        border: 'none',
        outline: 0,
        padding: '40px 32px 32px',
        margin: '48px auto',
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1A2027' : '#fff'
      }}>
        <Box sx={{
          position: 'absolute',
          top: '12px',
          right: '10px',
          cursor: 'pointer'
        }}>
          <CancelIcon color="error" sx={{ '&:hover': { color: 'error.light' } }} onClick={handleCloseModal} />
        </Box>

        {activeCard?.cover &&
          <Box sx={{ mb: 4, position: 'relative' }}>
            <img
              style={{ 
                width: '100%', 
                height: '320px', 
                borderRadius: '6px', 
                objectFit: 'cover',
                cursor: 'zoom-in',
                ...(activeCard?.coverType === 'color' || activeCard?.coverType === 'gradient' ? { 
                  display: 'none' 
                } : {})
              }}
              src={activeCard?.cover}
              alt="card-cover"
              onClick={handleCoverClick}
            />
            {(activeCard?.coverType === 'color' || activeCard?.coverType === 'gradient') && (
              <Box 
                sx={{ 
                  width: '100%', 
                  height: '160px', 
                  borderRadius: '6px', 
                  background: activeCard?.cover,
                  mb: 2
                }}
              />
            )}
            <Tooltip title="Xóa ảnh cover">
              <IconButton
                onClick={onDeleteCardCover}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  }
                }}
                size="medium"
              >
                <DeleteOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }

        <Box sx={{ mb: 1, mt: -3, pr: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CreditCardIcon />

          {/* Feature 01: Xử lý tiêu đề của Card */}
          <ToggleFocusInput
            inputFontSize='22px'
            value={activeCard?.title}
            onChangedValue={onUpdateCardTitle} />
        </Box>

        {/* Labels display section */}
        {activeCard?.labelIds?.length > 0 && (
          <Box sx={{ mb: 3, mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {activeCard.labelIds.map(labelId => {
              const label = activeBoard?.labels?.find(l => l.id === labelId)
              if (!label) return null
              
              return (
                <LabelChip
                  key={label.id}
                  label={label}
                  onClick={onShowLabelDialog}
                  sx={{ cursor: 'pointer' }}
                />
              )
            })}
          </Box>
        )}

        {/* Members section - full width */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Members</Typography>
          <CardUserGroup
            cardMemberIds={activeCard?.memberIds}
            onUpdateCardMembers={onUpdateCardMembers}
          />
        </Box>

        {/* Due Date section */}
        {activeCard?.dueDate && (
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Due Date</Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                p: 1.5,
                borderRadius: 1,
                backgroundColor: (theme) => 
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                border: `1px solid ${getDueDateStatusColor(activeCard.dueDate)}`,
                color: getDueDateStatusColor(activeCard.dueDate)
              }}
            >
              <WatchLaterOutlinedIcon fontSize="small" />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {formatDueDateDisplay(activeCard.dueDate)}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Add to card buttons - horizontal layout */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Add To Card</Typography>
          <Stack 
            direction="row" 
            spacing={1} 
            sx={{ 
              flexWrap: 'wrap', 
              gap: 1,
              '& .MuiBox-root': {
                minWidth: '120px',
                maxWidth: '150px',
                flex: '1 1 auto',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: (theme) => theme.palette.mode === 'dark' 
                    ? '0 2px 4px rgba(255, 255, 255, 0.1)' 
                    : '0 2px 4px rgba(0, 0, 0, 0.1)',
                }
              }
            }}
          >
            {/* Feature 05: Xử lý hành động bản thân user tự join vào card */}
            {/* Nếu user hiện tại đang đăng nhập chưa thuộc mảng memberIds của card thì mới cho hiện nút Join và ngược lại */}
            {activeCard?.memberIds?.includes(currentUser._id)
              ? <SidebarItem
                sx={{ color: 'error.light', '&:hover': { color: 'error.light' } }}
                onClick={() => onUpdateCardMembers({
                  userId: currentUser._id,
                  action: CARD_MEMBER_ACTIONS.REMOVE
                })}
              >
                <ExitToAppIcon fontSize="small" />
                Leave
              </SidebarItem>
              : <SidebarItem
                className="active"
                onClick={() => onUpdateCardMembers({
                  userId: currentUser._id,
                  action: CARD_MEMBER_ACTIONS.ADD
                })}
              >
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <PersonOutlineOutlinedIcon fontSize="small" />
                    <span>Join</span>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon fontSize="small" sx={{ color: '#27ae60' }} />
                  </Box>
                </Box>
              </SidebarItem>
            }

            {/* Feature 06: Xử lý hành động cập nhật ảnh Cover của Card */}
            <SidebarItem className="active" onClick={onShowCoverOptions}>
              <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ImageOutlinedIcon fontSize="small" />
                  <span>Cover</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon fontSize="small" sx={{ color: '#27ae60' }} />
                </Box>
              </Box>
            </SidebarItem>

            <SidebarItem onClick={onShowAttachmentModal}>
              <AttachFileOutlinedIcon fontSize="small" />Attachment
            </SidebarItem>
            <SidebarItem onClick={onShowLabelDialog}>
              <LocalOfferOutlinedIcon fontSize="small" />Labels
            </SidebarItem>
            <SidebarItem onClick={onShowChecklistDialog}>
              <TaskAltOutlinedIcon fontSize="small" />Checklist
            </SidebarItem>

            {/* "Thêm" Button */}
            <SidebarItem
              id="more-actions-button"
              aria-controls={openMoreMenu ? 'more-actions-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={openMoreMenu ? 'true' : undefined}
              onClick={handleMoreMenuClick}
            >
              Thêm
            </SidebarItem>
            <Menu
              id="more-actions-menu"
              anchorEl={anchorEl}
              open={openMoreMenu}
              onClose={handleMoreMenuClose}
              MenuListProps={{
                'aria-labelledby': 'more-actions-button'
              }}
              sx={{
                '& .MuiPaper-root': {
                  borderRadius: '8px',
                  boxShadow: (theme) => theme.palette.mode === 'dark' 
                    ? '0 0 8px rgba(255, 255, 255, 0.1)' 
                    : '0 0 8px rgba(0, 0, 0, 0.1)',
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#fff',
                },
                '& .MuiList-root': {
                  padding: '8px',
                },
                '& .MuiMenuItem-root': {
                  borderRadius: '4px',
                  padding: '8px 12px',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#33485D' : theme.palette.grey[100],
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              TransitionProps={{ timeout: 200 }}
            >
              <MenuItem 
                onClick={() => { 
                  onShowDueDatePicker();
                }}
                sx={{
                  color: (theme) => theme.palette.mode === 'dark' ? '#90caf9' : '#172b4d',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                  <WatchLaterOutlinedIcon fontSize="small" />
                  <span>Dates</span>
                </Box>
              </MenuItem>
              <MenuItem 
                onClick={() => { 
                  toast.info('Tính năng Custom Fields đang được phát triển');
                  handleMoreMenuClose(); 
                }}
                sx={{
                  color: (theme) => theme.palette.mode === 'dark' ? '#90caf9' : '#172b4d',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                  <AutoFixHighOutlinedIcon fontSize="small" />
                  <span>Custom Fields</span>
                </Box>
              </MenuItem>
            </Menu>
          </Stack>
        </Box>

        {/* Description and Comments - side by side layout */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Description - Left side */}
          <Grid xs={12} sm={6}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <SubjectRoundedIcon />
                <Typography variant="span" sx={{ fontWeight: '600', fontSize: '20px' }}>Description</Typography>
              </Box>

              {/* Feature 03: Xử lý mô tả của Card với scroll */}
              <Box sx={{ 
                maxHeight: '400px', 
                overflowY: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#90caf9' : '#c1c1c1',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#64b5f6' : '#a8a8a8',
                  },
                },
              }}>
                <CardDescriptionMdEditor
                  cardDescriptionProp={activeCard?.description}
                  handleUpdateCardDescription={onUpdateCardDescription}
                />
              </Box>
            </Box>
          </Grid>

          {/* Comments - Right side */}
          <Grid xs={12} sm={6}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <DvrOutlinedIcon />
                <Typography variant="span" sx={{ fontWeight: '600', fontSize: '20px' }}>Activity</Typography>
              </Box>

              {/* Feature 04: Xử lý các hành động, ví dụ comment vào Card với scroll */}
              <Box sx={{ 
                maxHeight: '400px', 
                overflowY: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#90caf9' : '#c1c1c1',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#64b5f6' : '#a8a8a8',
                  },
                },
              }}>
                <CardActivitySection
                  cardComments={activeCard?.comments}
                  onAddCardComment={onAddCardComment}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>

        {activeCard?.cover && activeCard?.coverType === 'image' && 
          <ImageLightbox 
            isOpen={showCoverLightbox} 
            onClose={handleCloseCoverLightbox} 
            imageSrc={activeCard?.cover} 
          />
        }
        
        <CoverOptionsModal 
          isOpen={showCoverOptions} 
          onClose={onCloseCoverOptions} 
          onSelectColor={onSelectCoverColor}
          onUploadCover={onUploadCoverFromModal}
        />

        <AttachmentModal 
          isOpen={showAttachmentModal}
          onClose={onCloseAttachmentModal}
          cardId={activeCard?._id} // 🚨 CRITICAL: Pass cardId for API calls
          attachments={attachments}
          onAddAttachment={onAddAttachment}
          onDeleteAttachment={onDeleteAttachment}
          onPreviewAttachment={onShowAttachmentLightbox}
        />

        {selectedAttachment && showAttachmentLightbox && (
          <ImageLightbox 
            isOpen={showAttachmentLightbox}
            onClose={onCloseAttachmentLightbox}
            imageSrc={selectedAttachment.url}
          />
        )}

        {/* Label Dialog */}
        <LabelDialog
          isOpen={showLabelDialog}
          onClose={onCloseLabelDialog}
          predefinedLabels={activeBoard?.labels || []}
          cardLabelIds={activeCard?.labelIds || []}
          onToggleLabel={onToggleLabel}
          onCreateLabel={onCreateLabel}
          onDeleteLabel={onDeleteLabel}
        />

        {/* Checklist Dialog */}
        <ChecklistDialog
          isOpen={showChecklistDialog}
          onClose={onCloseChecklistDialog}
          checklists={checklists}
          onUpdateChecklists={onUpdateChecklists}
          cardId={activeCard?._id}
        />

        {/* Due Date Picker Dialog */}
        <Dialog 
          open={showDueDatePicker} 
          onClose={onCloseDueDatePicker}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#fff'
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            pb: 1
          }}>
            <WatchLaterOutlinedIcon />
            <Typography variant="h6">Cài đặt ngày hết hạn</Typography>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              label="Chọn ngày và giờ"
              type="datetime-local"
              value={selectedDateTime}
              onChange={(e) => setSelectedDateTime(e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                '& .MuiInputLabel-root': {
                  color: (theme) => theme.palette.mode === 'dark' ? '#90caf9' : 'inherit'
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
                  },
                  '&:hover fieldset': {
                    borderColor: (theme) => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2'
                  }
                }
              }}
            />
            
            {activeCard?.dueDate && (
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 2, 
                  color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                  fontStyle: 'italic'
                }}
              >
                Hiện tại: {formatDueDateDisplay(activeCard.dueDate)}
              </Typography>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 2, gap: 1 }}>
            {activeCard?.dueDate && (
              <Button 
                onClick={onRemoveDueDate}
                color="error"
                variant="outlined"
                size="small"
              >
                Xóa ngày hết hạn
              </Button>
            )}
            
            <Box sx={{ flex: 1 }} />
            
            <Button 
              onClick={onCloseDueDatePicker}
              variant="outlined"
              size="small"
            >
              Hủy
            </Button>
            
            <Button 
              onClick={onSaveDueDate}
              variant="contained"
              size="small"
            >
              Lưu
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Modal>
  )
}

export default ActiveCard
