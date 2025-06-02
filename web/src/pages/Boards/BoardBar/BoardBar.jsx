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
import { Tooltip } from '@mui/material'
import { capitalizeFirstLetter } from '~/utils/formatters'
import BoardUserGroup from './BoardUserGroup'
import InviteBoardUser from './InviteBoardUser'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BoardBackgroundSwitcher from '~/components/Modal/BoardBackgroundSwitcher/BoardBackgroundSwitcher'
import BoardAnalytics from '~/components/Modal/BoardAnalytics/BoardAnalytics'

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

function BoardBar({ board, boardId }) {
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  
  // State để quản lý modal background switcher
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false)
  
  // State để quản lý modal analytics
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false)
  
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
          <MenuItem onClick={handleClose}>
            <GroupIcon /> Thành viên
          </MenuItem>
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
        board={board}
      />
    </Box>
  )
}

export default BoardBar
