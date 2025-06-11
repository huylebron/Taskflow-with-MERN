import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import AssignmentIcon from '@mui/icons-material/Assignment'
import DashboardIcon from '@mui/icons-material/Dashboard'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useForm } from 'react-hook-form'
import {
  EMAIL_RULE,
  PASSWORD_RULE,
  FIELD_REQUIRED_MESSAGE,
  PASSWORD_RULE_MESSAGE,
  EMAIL_RULE_MESSAGE
} from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { useDispatch } from 'react-redux'
import { loginUserAPI } from '~/redux/user/userSlice'
import { registerUserAPI } from '~/apis'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Alert from '@mui/material/Alert'

function AuthSlider({ isLogin }) {
  const [isLoginMode, setIsLoginMode] = useState(isLogin)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  // Separate forms for login and register
  const loginForm = useForm()
  const registerForm = useForm()
  
  let [searchParams] = useSearchParams()
  const registeredEmail = searchParams.get('registeredEmail')
  const verifiedEmail = searchParams.get('verifiedEmail')

  // Common styles for text fields
  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      transition: 'all 0.3s ease',
      '& fieldset': {
        borderColor: '#000000',
        borderWidth: '2px'
      },
      '&:hover fieldset': {
        borderColor: '#000000',
        borderWidth: '2px'
      },
      '&.Mui-focused fieldset': {
        borderColor: '#000000',
        borderWidth: '2px'
      },
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      },
      '&.Mui-focused': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      }
    },
    '& .MuiInputLabel-root': {
      color: '#000000',
      fontWeight: '500',
      '&.Mui-focused': {
        color: '#000000'
      }
    },
    '& .MuiOutlinedInput-input': {
      color: '#000000',
      fontWeight: '500'
    }
  }

  useEffect(() => {
    setIsLoginMode(isLogin)
    // Reset both forms when switching
    loginForm.reset()
    registerForm.reset()
    // Reset password visibility states
    setShowLoginPassword(false)
    setShowRegisterPassword(false)
    setShowRegisterConfirmPassword(false)
  }, [isLogin, loginForm, registerForm])

  const submitLogin = (data) => {
    const { email, password } = data
    toast.promise(
      dispatch(loginUserAPI({ email, password })),
      { pending: 'Đang đăng nhập...' }
    ).then(res => {
      if (!res.error) navigate('/')
    })
  }

  const submitRegister = (data) => {
    const { email, password } = data
    toast.promise(
      registerUserAPI({ email, password }),
      { pending: 'Đang đăng ký...' }
    ).then(user => {
      navigate(`/login?registeredEmail=${user.email}`)
    })
  }

  const handleToggleMode = () => {
    if (isLoginMode) {
      navigate('/register')
    } else {
      navigate('/login')
    }
  }

  return (
    <Box sx={{
      position: 'relative',
      width: { xs: '350px', sm: '400px', md: '800px' },
      height: { xs: '600px', md: '500px' },
      maxWidth: '90vw',
      background: '#fff',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      overflow: 'hidden',
      '@media (max-width: 768px)': {
        flexDirection: 'column'
      }
    }}>
      {/* Sliding Panel */}
      <Box sx={{
        position: 'absolute',
        top: { xs: isLoginMode ? '50%' : '0%', md: 0 },
        left: { xs: 0, md: isLoginMode ? '50%' : '0%' },
        width: { xs: '100%', md: '50%' },
        height: { xs: '50%', md: '100%' },
        background: 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)',
        transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        padding: { xs: '20px', md: '40px' },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(10px)'
        }
      }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 'bold', 
          mb: 2, 
          position: 'relative',
          zIndex: 1,
          fontSize: { xs: '1.5rem', md: '2rem' }
        }}>
          {isLoginMode ? 'Chào mừng trở lại!' : 'Xin chào!'}
        </Typography>
        <Typography variant="body1" sx={{ 
          textAlign: 'center', 
          mb: 4, 
          opacity: 0.9,
          position: 'relative',
          zIndex: 1,
          fontSize: { xs: '0.9rem', md: '1rem' }
        }}>
          {isLoginMode 
            ? 'Đăng ký để sử dụng tất cả tính năng của chúng tôi' 
            : 'Đăng nhập để tiếp tục hành trình của bạn'
          }
        </Typography>
        <Button
          variant="outlined"
          onClick={handleToggleMode}
          sx={{
            color: 'white',
            borderColor: 'white',
            borderRadius: '25px',
            padding: { xs: '10px 30px', md: '12px 40px' },
            fontWeight: 'bold',
            position: 'relative',
            zIndex: 1,
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(255,255,255,0.2)',
              borderColor: 'white',
              transform: 'translateY(-2px)',
              boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
            }
          }}
        >
          {isLoginMode ? 'ĐĂNG KÝ' : 'ĐĂNG NHẬP'}
        </Button>
      </Box>

      {/* Login Form */}
      <Box sx={{
        position: 'absolute',
        top: { xs: isLoginMode ? '0%' : '-50%', md: 0 },
        left: { xs: 0, md: isLoginMode ? '0%' : '-50%' },
        width: { xs: '100%', md: '50%' },
        height: { xs: '50%', md: '100%' },
        transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: '20px', md: '40px' }
      }}>
        <form onSubmit={loginForm.handleSubmit(submitLogin)} style={{ width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Avatar sx={{ bgcolor: '#64b5f6', width: 40, height: 40 }}>
                <AssignmentIcon sx={{ color: '#ffffff', fontSize: '1.5rem' }} />
              </Avatar>
              <Avatar sx={{ bgcolor: '#42a5f5', width: 40, height: 40 }}>
                <DashboardIcon sx={{ color: '#ffffff', fontSize: '1.5rem' }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold', 
              color: '#000000',
              background: 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}>
              TaskFlow
            </Typography>
          </Box>
          
          <Typography variant="h5" sx={{ textAlign: 'center', mb: 3, fontWeight: 'bold', color: '#000000' }}>
            Đăng nhập
          </Typography>

          {verifiedEmail && (
            <Alert severity="success" sx={{ mb: 2, '.MuiAlert-message': { overflow: 'hidden' } }}>
              Email <strong>{verifiedEmail}</strong> đã được xác thực. Bạn có thể đăng nhập ngay!
            </Alert>
          )}

          {registeredEmail && (
            <Alert severity="info" sx={{ mb: 2, '.MuiAlert-message': { overflow: 'hidden' } }}>
              Email đã được gửi tới <strong>{registeredEmail}</strong>. Vui lòng xác thực tài khoản!
            </Alert>
          )}

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              variant="outlined"
              size="small"
              error={!!loginForm.formState.errors['email']}
              sx={textFieldStyles}
              {...loginForm.register('email', {
                required: FIELD_REQUIRED_MESSAGE,
                pattern: {
                  value: EMAIL_RULE,
                  message: EMAIL_RULE_MESSAGE
                }
              })}
            />
            <FieldErrorAlert errors={loginForm.formState.errors} fieldName={'email'} />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Mật khẩu"
              type={showLoginPassword ? 'text' : 'password'}
              variant="outlined"
              size="small"
              error={!!loginForm.formState.errors['password']}
              sx={textFieldStyles}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      edge="end"
                      sx={{ color: '#000000' }}
                    >
                      {showLoginPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              {...loginForm.register('password', {
                required: FIELD_REQUIRED_MESSAGE,
                pattern: {
                  value: PASSWORD_RULE,
                  message: PASSWORD_RULE_MESSAGE
                }
              })}
            />
            <FieldErrorAlert errors={loginForm.formState.errors} fieldName={'password'} />
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              borderRadius: '25px',
              padding: '12px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #42a5f5 0%, #2196f3 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(66, 165, 245, 0.4)'
              }
            }}
          >
            ĐĂNG NHẬP
          </Button>

          {/* Forgot Password Link */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
              <Typography sx={{
                color: '#f44336',
                '&:hover': {
                  color: '#d32f2f',
                  textDecoration: 'underline'
                },
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'all 0.3s ease'
              }}>
                Quên mật khẩu?
              </Typography>
            </Link>
          </Box>
        </form>
      </Box>

      {/* Register Form */}
      <Box sx={{
        position: 'absolute',
        top: { xs: isLoginMode ? '150%' : '50%', md: 0 },
        right: { xs: 0, md: isLoginMode ? '-50%' : '0%' },
        width: { xs: '100%', md: '50%' },
        height: { xs: '50%', md: '100%' },
        transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: '20px', md: '40px' }
      }}>
        <form onSubmit={registerForm.handleSubmit(submitRegister)} style={{ width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Avatar sx={{ bgcolor: '#64b5f6', width: 40, height: 40 }}>
                <AssignmentIcon sx={{ color: '#ffffff', fontSize: '1.5rem' }} />
              </Avatar>
              <Avatar sx={{ bgcolor: '#42a5f5', width: 40, height: 40 }}>
                <DashboardIcon sx={{ color: '#ffffff', fontSize: '1.5rem' }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold', 
              color: '#000000',
              background: 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}>
              TaskFlow
            </Typography>
          </Box>
          
          <Typography variant="h5" sx={{ textAlign: 'center', mb: 3, fontWeight: 'bold', color: '#000000' }}>
            Đăng ký
          </Typography>

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              variant="outlined"
              size="small"
              error={!!registerForm.formState.errors['email']}
              sx={textFieldStyles}
              {...registerForm.register('email', {
                required: FIELD_REQUIRED_MESSAGE,
                pattern: {
                  value: EMAIL_RULE,
                  message: EMAIL_RULE_MESSAGE
                }
              })}
            />
            <FieldErrorAlert errors={registerForm.formState.errors} fieldName={'email'} />
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Mật khẩu"
              type={showRegisterPassword ? 'text' : 'password'}
              variant="outlined"
              size="small"
              error={!!registerForm.formState.errors['password']}
              sx={textFieldStyles}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      edge="end"
                      sx={{ color: '#000000' }}
                    >
                      {showRegisterPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              {...registerForm.register('password', {
                required: FIELD_REQUIRED_MESSAGE,
                pattern: {
                  value: PASSWORD_RULE,
                  message: PASSWORD_RULE_MESSAGE
                }
              })}
            />
            <FieldErrorAlert errors={registerForm.formState.errors} fieldName={'password'} />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Xác nhận mật khẩu"
              type={showRegisterConfirmPassword ? 'text' : 'password'}
              variant="outlined"
              size="small"
              error={!!registerForm.formState.errors['password_confirmation']}
              sx={textFieldStyles}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password confirmation visibility"
                      onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                      edge="end"
                      sx={{ color: '#000000' }}
                    >
                      {showRegisterConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              {...registerForm.register('password_confirmation', {
                validate: (value) => {
                  if (value === registerForm.watch('password')) return true
                  return 'Mật khẩu xác nhận không khớp!'
                }
              })}
            />
            <FieldErrorAlert errors={registerForm.formState.errors} fieldName={'password_confirmation'} />
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              borderRadius: '25px',
              padding: '12px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #42a5f5 0%, #2196f3 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(66, 165, 245, 0.4)'
              }
            }}
          >
            ĐĂNG KÝ
          </Button>
        </form>
      </Box>
    </Box>
  )
}

export default AuthSlider 