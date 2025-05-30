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
import BoardBackgroundModal from '~/components/Modal/BoardBackgroundModal/BoardBackgroundModal'
import { updateBoardDetailsAPI } from '~/apis'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { updateCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'

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

function BoardBar({ board }) {
  const dispatch = useDispatch()
  const [anchorEl, setAnchorEl] = useState(null)
  const [showBackgroundModal, setShowBackgroundModal] = useState(false)
  const open = Boolean(anchorEl)
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  
  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleShowBackgroundModal = () => {
    handleClose()
    setShowBackgroundModal(true)
  }

  const handleCloseBackgroundModal = () => {
    setShowBackgroundModal(false)
  }

  const handleSelectBackground = async (value, type) => {
    try {
      let updatedBoard
      if (type === 'image') {
        // Handle image upload
        let formData = new FormData()
        formData.append('boardBackground', value)
        updatedBoard = await updateBoardDetailsAPI(board._id, formData)
      } else {
        // Handle color or gradient
        updatedBoard = await updateBoardDetailsAPI(board._id, {
          background: value,
          backgroundType: type
        })
      }
      
      dispatch(updateCurrentActiveBoard(updatedBoard))
      toast.success('Board background updated successfully!')
    } catch (error) {
      toast.error('Failed to update board background!')
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
      borderBottom: '1px solid white'
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
          label="Analytics"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<FilterListIcon />}
          label="Filters"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<SettingsIcon />}
          label="Settings"
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
          <MenuItem onClick={handleShowBackgroundModal}>
            <WallpaperIcon /> Change Background
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <GroupIcon /> Members
          </MenuItem>
        </Menu>
        <Chip
          sx={MENU_STYLES}
          icon={<CalendarMonthIcon />}
          label="Calendar"
          clickable
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <InviteBoardUser boardId={board._id} />
        <BoardUserGroup boardUsers={board?.FE_allUsers} />
      </Box>

      <BoardBackgroundModal 
        isOpen={showBackgroundModal}
        onClose={handleCloseBackgroundModal}
        onSelectBackground={handleSelectBackground}
      />
    </Box>
  )
}

export default BoardBar