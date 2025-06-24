import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import BarChartIcon from '@mui/icons-material/BarChart'
import FilterListIcon from '@mui/icons-material/FilterList'
import SettingsIcon from '@mui/icons-material/Settings'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import WallpaperIcon from '@mui/icons-material/Wallpaper'
import GroupIcon from '@mui/icons-material/Group'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { Tooltip } from '@mui/material'
import { capitalizeFirstLetter } from '~/utils/formatters'
import BoardUserGroup from './BoardUserGroup'
import InviteBoardUser from './InviteBoardUser'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import BoardBackgroundSwitcher from '~/components/Modal/BoardBackgroundSwitcher/BoardBackgroundSwitcher'
import BoardAnalytics from '~/components/Modal/BoardAnalytics/BoardAnalytics'
import DeleteBoardModal from '~/components/Modal/DeleteBoardModal/DeleteBoardModal'
import MemberManagement from '~/components/Modal/MemberManagement/MemberManagement'
import NotificationBell from '~/components/NotificationBell'
import { deleteBoardAPI } from '~/redux/activeBoard/activeBoardSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import PermissionWrapper from '~/components/PermissionWrapper/PermissionWrapper'

const MENU_STYLES = {
  color: 'white',
  bgcolor: 'transparent',
  border: 'none',
  paddingX: '5px',
  borderRadius: '4px',
  '.MuiSvgIcon-root': {
    color: 'white'
  },
  '&:hover': {
    bgcolor: 'primary.50'
  }
}

function BoardBar({ board, boardId, onOpenFilterDrawer }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  // State để quản lý modal background switcher
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false)

  // State để quản lý modal analytics
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false)

  // State để quản lý modal delete board
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // State để quản lý modal member management
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false)

  // Check if current user is board owner
  const isOwner = board?.ownerIds?.includes(currentUser?._id)

  // Handler cho notification bell
  const handleNotificationBellClick = () => {
    console.log('🔔 Notification bell clicked')
    // Future: Có thể mở notification panel hoặc mark as read
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  // Handler cho việc mở/đóng background switcher modal
  const handleOpenBackgroundModal = () => {
    setIsBackgroundModalOpen(true)
    handleClose() // Đóng menu sau khi chọn
  }

  const handleCloseBackgroundModal = () => {
    setIsBackgroundModalOpen(false)
  }

  // Handler cho việc mở/đóng analytics modal
  const handleOpenAnalyticsModal = () => {
    setIsAnalyticsModalOpen(true)
  }

  const handleCloseAnalyticsModal = () => {
    setIsAnalyticsModalOpen(false)
  }

  // Handler cho navigation đến Calendar
  const handleNavigateToCalendar = () => {
    const currentBoardId = boardId || board?._id
    if (currentBoardId) {
      console.log('📅 Navigating to board calendar:', `/boards/${currentBoardId}/calendar`)
      navigate(`/boards/${currentBoardId}/calendar`)
    } else {
      console.log('📅 Navigating to general calendar:', '/calendar')
      navigate('/calendar')
    }
  }

  // Handler cho việc mở/đóng delete modal
  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true)
    handleClose() // Đóng menu sau khi chọn
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
  }

  // Handler cho việc mở/đóng member management modal
  const handleOpenMemberModal = () => {
    setIsMemberModalOpen(true)
    handleClose() // Đóng menu sau khi chọn
  }

  const handleCloseMemberModal = () => {
    setIsMemberModalOpen(false)
  }

  // Handler xác nhận xóa board
  const handleConfirmDelete = async () => {
    if (!board?._id || isDeleting) return

    try {
      setIsDeleting(true)

      // Dispatch delete action
      await dispatch(deleteBoardAPI(board._id)).unwrap()

      // Close modal
      setIsDeleteModalOpen(false)

      // Navigate to boards list
      navigate('/boards')

    } catch (error) {
      console.error('Delete board failed:', error)
      // Error toast is handled by the API function
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Box sx={{
      width: '100%',
      height: (theme) => theme.trello.boardBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      paddingX: 2,
      overflowX: 'auto',
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
      // Đảm bảo BoardBar nằm trên overlay
      position: 'relative',
      zIndex: 1
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Tooltip title={board?.description}>
          <Chip
            sx={MENU_STYLES}
            icon={<DashboardIcon />}
            label={board?.title}
            clickable
          />
        </Tooltip>
        <Chip
          sx={MENU_STYLES}
          icon={<VpnLockIcon />}
          label={capitalizeFirstLetter(board?.type)}
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<BarChartIcon />}
          label="Thống kê"
          clickable
          onClick={handleOpenAnalyticsModal}
        />
        <Chip
          sx={MENU_STYLES}
          icon={<FilterListIcon />}
          label="Lọc tổng hợp"
          clickable
          onClick={onOpenFilterDrawer}
        />
        <Chip
          sx={MENU_STYLES}
          icon={<SettingsIcon />}
          label="Tùy chọn"
          clickable
          onClick={handleClick}
        />
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              mt: 1,
              '& .MuiMenuItem-root': {
                gap: 1,
                '&:hover': { bgcolor: 'primary.light' }
              }
            }
          }}
        >
          <MenuItem onClick={handleOpenBackgroundModal}>
            <WallpaperIcon /> Thay đổi hình nền
          </MenuItem>
          <PermissionWrapper adminOnly={true}>
            <MenuItem onClick={handleOpenMemberModal}>
              <GroupIcon /> Thành viên
            </MenuItem>
          </PermissionWrapper>
          <PermissionWrapper adminOnly={true}>
            <MenuItem
              onClick={handleOpenDeleteModal}
              sx={{
                color: 'error.main',
                '&:hover': {
                  bgcolor: 'error.light',
                  color: 'error.dark'
                }
              }}
            >
              <DeleteForeverIcon /> Xóa Board
            </MenuItem>
          </PermissionWrapper>
        </Menu>
        <Chip
          sx={MENU_STYLES}
          icon={<CalendarMonthIcon />}
          label="Lịch biểu"
          clickable
          onClick={handleNavigateToCalendar}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Notification Bell - chỉ hiện cho board members */}
        {board?._id && (
          <Box sx={{ 
            display: { xs: 'none', sm: 'block' } // Ẩn trên mobile để tiết kiệm space
          }}>
            <NotificationBell 
              boardId={board._id} 
              onNotification={handleNotificationBellClick}
            />
          </Box>
        )}
        <InviteBoardUser boardId={board._id} />
        <BoardUserGroup boardUsers={board?.FE_allUsers} />
      </Box>

      {/* BoardBackgroundSwitcher Modal */}
      <BoardBackgroundSwitcher
        isOpen={isBackgroundModalOpen}
        onClose={handleCloseBackgroundModal}
        boardId={boardId || board?._id}
      />

      {/* BoardAnalytics Modal */}
      <BoardAnalytics
        isOpen={isAnalyticsModalOpen}
        onClose={handleCloseAnalyticsModal}
        boardId={board._id}
      />

      {/* Delete Board Modal */}
      <DeleteBoardModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        board={board}
        isLoading={isDeleting}
      />

      {/* Member Management Modal */}
      <MemberManagement
        open={isMemberModalOpen}
        onClose={handleCloseMemberModal}
        boardId={board?._id}
      />
    </Box>
  )
}

export default BoardBar
