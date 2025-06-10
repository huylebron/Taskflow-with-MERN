import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Avatar,
  Typography,
  Card as MuiCard,
  CardActions,
  TextField,
  Zoom,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material'
import LockResetIcon from '@mui/icons-material/LockReset'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { resetPasswordAPI } from '~/apis'

function ResetPasswordForm() {
  const navigate = useNavigate()
  const { token } = useParams()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Redirect if no token is provided
    if (!token) {
      navigate('/login')
    }
  }, [token, navigate])

  // Handle success state
  useEffect(() => {
    if (isSuccess) {
      // Redirect to login after 3 seconds
      const timer = setTimeout(() => {
        navigate('/login')
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isSuccess, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!newPassword) {
      setError('New password is required')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await resetPasswordAPI({ token, newPassword })
      setIsLoading(false)
      setIsSuccess(true)
    } catch (err) {
      setIsLoading(false)
      console.error('Reset password error:', err)
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.')
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  if (!token) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <MuiCard sx={{ padding: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Invalid Reset Link
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This password reset link is invalid or has expired.
          </Typography>
          <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
            <Button variant="contained" color="primary">
              Request New Reset Link
            </Button>
          </Link>
        </MuiCard>
      </Box>
    )
  }

  if (isSuccess) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <Zoom in={true} style={{ transitionDelay: '200ms' }}>
          <MuiCard sx={{ minWidth: 380, maxWidth: 420, marginTop: '6em' }}>
            <Box sx={{
              margin: '1em',
              display: 'flex',
              justifyContent: 'center',
              gap: 1
            }}>
              <Avatar sx={{ bgcolor: 'success.main' }}><CheckCircleIcon /></Avatar>
            </Box>
            <Box sx={{ marginTop: '1em', display: 'flex', justifyContent: 'center', color: theme => theme.palette.grey[500] }}>
              Author: huylebron
            </Box>
            <Box sx={{ marginTop: '1em', display: 'flex', justifyContent: 'center', flexDirection: 'column', padding: '0 1em' }}>
              <Alert severity="success" sx={{ '.MuiAlert-message': { overflow: 'hidden' } }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Password Reset Successful! 🎉
                </Typography>
                Your password has been successfully updated. You can now log in with your new password.
                <br /><br />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  You will be redirected to the login page in a few seconds...
                </Typography>
              </Alert>
            </Box>
            <Box sx={{ padding: '0 1em 1em 1em', textAlign: 'center' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Go to Login Now
                </Button>
              </Link>
            </Box>
          </MuiCard>
        </Zoom>
      </Box>
    )
  }

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <form onSubmit={handleSubmit}>
        <Zoom in={true} style={{ transitionDelay: '200ms' }}>
          <MuiCard sx={{ minWidth: 380, maxWidth: 420, marginTop: '6em' }}>
            <Box sx={{
              margin: '1em',
              display: 'flex',
              justifyContent: 'center',
              gap: 1
            }}>
              <Avatar sx={{ bgcolor: 'info.main' }}><LockResetIcon /></Avatar>
            </Box>
          <Box sx={{ marginTop: '1em', display: 'flex', justifyContent: 'center', color: theme => theme.palette.grey[500] }}>
            Author: huylebron
          </Box>
          <Box sx={{ marginTop: '1em', display: 'flex', justifyContent: 'center', flexDirection: 'column', padding: '0 1em' }}>
            <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
              Reset Your Password
            </Typography>
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2 }}>
              Please enter your new password below. Make sure it's strong and secure!
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
          <Box sx={{ padding: '0 1em 1em 1em' }}>
            <Box sx={{ marginTop: '1em' }}>
              <TextField
                autoFocus
                fullWidth
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                        disabled={isLoading}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={toggleConfirmPasswordVisibility}
                        edge="end"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>
          <CardActions sx={{ padding: '0 1em 1em 1em' }}>
            <Button
              className="interceptor-loading"
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </CardActions>
          <Box sx={{ padding: '0 1em 1em 1em', textAlign: 'center' }}>
            <Typography>Remember your password?</Typography>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography sx={{ color: 'primary.main', '&:hover': { color: '#ffbb39' } }}>
                Back to Login
              </Typography>
            </Link>
          </Box>
          </MuiCard>
        </Zoom>
      </form>
    </Box>
  )
}

export default ResetPasswordForm