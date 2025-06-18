import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Box,
  Button,
  Avatar,
  Typography,
  Card as MuiCard,
  CardActions,
  TextField,
  Zoom,
  Alert
} from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { forgotPasswordAPI } from '~/apis'

function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      setError('Email is required')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Invalid email format')
      return
    }

    setSubmittedEmail(email)
    setIsLoading(true)
    setError('')

    try {
      await forgotPasswordAPI({ email })
      setIsLoading(false)
      setIsSuccess(true)
    } catch (err) {
      setIsLoading(false)
      console.error('Forgot password error:', err)
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.')
    }
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
          <MuiCard sx={{ minWidth: 380, maxWidth: 420 }}>
          <Box sx={{
            margin: '1em',
            display: 'flex',
            justifyContent: 'center',
            gap: 1
          }}>
            <Avatar sx={{ bgcolor: 'success.main' }}><EmailIcon /></Avatar>
          </Box>
          <Box sx={{ marginTop: '1em', display: 'flex', justifyContent: 'center', color: theme => theme.palette.grey[500] }}>
            Author: huylebron
          </Box>
          <Box sx={{ marginTop: '1em', display: 'flex', justifyContent: 'center', flexDirection: 'column', padding: '0 1em' }}>
            <Alert severity="success" sx={{ '.MuiAlert-message': { overflow: 'hidden' } }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Check Your Email!
              </Typography>
              We've sent a password reset link to&nbsp;
              <Typography variant="span" sx={{ fontWeight: 'bold', '&:hover': { color: '#fdba26' } }}>
                {submittedEmail}
              </Typography>
              <br /><br />
              Please check your email and click the reset link to continue.
              <br /><br />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Didn't receive the email? Check your spam folder or try again.
              </Typography>
            </Alert>
          </Box>
          <Box sx={{ padding: '0 1em 1em 1em', textAlign: 'center' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button
                startIcon={<ArrowBackIcon />}
                variant="outlined"
                color="primary"
                size="large"
                fullWidth
                sx={{ mt: 2 }}
              >
                Back to Login
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
          <MuiCard sx={{ minWidth: 380, maxWidth: 420 }}>
            <Box sx={{
              margin: '1em',
              display: 'flex',
              justifyContent: 'center',
              gap: 1
            }}>
              <Avatar sx={{ bgcolor: 'warning.main' }}><EmailIcon /></Avatar>
            </Box>
            <Box sx={{ marginTop: '1em', display: 'flex', justifyContent: 'center', color: theme => theme.palette.grey[500] }}>
              Author: huylebron
            </Box>
            <Box sx={{ marginTop: '1em', display: 'flex', justifyContent: 'center', flexDirection: 'column', padding: '0 1em' }}>
              <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                Forgot Password?
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2 }}>
                No worries! Enter your email address and we'll send you a link to reset your password.
              </Typography>
            </Box>
            <Box sx={{ padding: '0 1em 1em 1em' }}>
              <Box sx={{ marginTop: '1em' }}>
                <TextField
                  autoFocus
                  fullWidth
                  label="Enter your email address..."
                  type="email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  error={!!error}
                />
                {error && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {error}
                  </Alert>
                )}
              </Box>
            </Box>
            <CardActions sx={{ padding: '0 1em 1em 1em' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPasswordForm