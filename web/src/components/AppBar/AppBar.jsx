import Box from '@mui/material/Box'
import ModeSelect from '~/components/ModeSelect/ModeSelect'
import TaskIcon from '@mui/icons-material/Task'
import Typography from '@mui/material/Typography'
import Profiles from './Menus/Profiles'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useState } from 'react'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { Link } from 'react-router-dom'
import Notifications from './Notifications/Notifications'
import AutoCompleteSearchBoard from './SearchBoards/AutoCompleteSearchBoard'
import BarChartIcon from '@mui/icons-material/BarChart'
import FilterListIcon from '@mui/icons-material/FilterList'
import SettingsIcon from '@mui/icons-material/Settings'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import WallpaperIcon from '@mui/icons-material/Wallpaper'
import GroupIcon from '@mui/icons-material/Group'

function AppBar() {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  
  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <Box sx={{
      width: '100%',
      height: (theme) => theme.trello.appBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      paddingX: 2,
      overflowX: 'auto',
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#2c3e50' : '#1565c0')
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Link to="/">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TaskIcon sx={{ color: 'white', fontSize: '2rem' }} />
            <Typography variant="span" sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>TaskFlow</Typography>
          </Box>
        </Link>

      </Box>

      <Box sx={{ 
        display: 'flex', 
        flex: 1,
        justifyContent: 'center'
      }}>
        <AutoCompleteSearchBoard />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <ModeSelect />
        <Notifications />
        <Tooltip title="Help">
          <HelpOutlineIcon sx={{ cursor: 'pointer', color: 'white' }} />
        </Tooltip>
        <Profiles />
      </Box>
    </Box>
  )
}

export default AppBar
