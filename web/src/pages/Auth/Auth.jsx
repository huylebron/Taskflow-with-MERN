// TrungQuanDev: https://youtube.com/@trungquandev
import { useLocation, Navigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import AuthSlider from './AuthSlider'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'

function Auth() {
  const location = useLocation()
  const isLogin = location.pathname === '/login'

  const currentUser = useSelector(selectCurrentUser)
  if (currentUser) {
    return <Navigate to='/' replace={true} />
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
      padding: '20px'
    }}>
      <AuthSlider isLogin={isLogin} />
    </Box>
  )
}

export default Auth
