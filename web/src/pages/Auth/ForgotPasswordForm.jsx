// TrungQuanDev: https://youtube.com/@trungquandev
import { Link } from 'react-router-dom'
import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import EmailIcon from '@mui/icons-material/Email'
import Typography from '@mui/material/Typography'
import { Card as MuiCard } from '@mui/material'
import { ReactComponent as TrelloIcon } from '~/assets/trello.svg'
import CardActions from '@mui/material/CardActions'
import TextField from '@mui/material/TextField'
import Zoom from '@mui/material/Zoom'
import Alert from '@mui/material/Alert'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useForm } from 'react-hook-form'
import {
  EMAIL_RULE,
  FIELD_REQUIRED_MESSAGE,
  EMAIL_RULE_MESSAGE
} from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { useDispatch } from 'react-redux'
import { forgotPasswordAPI } from '~/redux/user/userSlice'
import { toast } from 'react-toastify'

function ForgotPasswordForm() {
  const dispatch = useDispatch()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm()

  const submitForgotPassword = (data) => {
    const { email } = data

    toast.promise(
      dispatch(forgotPasswordAPI({ email })),
      { 
        pending: 'Sending reset link...',
        success: 'Password reset link sent to your email!',
        error: 'Failed to send reset link. Please try again.'
      }
    ).then(res => {
      // console.log(res)
      if (!res.error) {
        setSubmittedEmail(email)
        setIsSubmitted(true)
      }
    })
  }

  if (isSubmitted) {
    return (
      <Zoom in={true} style={{ transitionDelay: '200ms' }}>
        <MuiCard sx={{ minWidth: 380, maxWidth: 420, marginTop: '6em' }}>
          <Box sx={{
            margin: '1em',
            display: 'flex',
            justifyContent: 'center',
            gap: 1
          }}>
            <Avatar sx={{ bgcolor: 'success.main' }}><EmailIcon /></Avatar>
            <Avatar sx={{ bgcolor: 'primary.main' }}><TrelloIcon /></Avatar>
          </Box>
          <Box sx={{ marginTop: '1em', display: 'flex', justifyContent: 'center', color: theme => theme.palette.grey[500] }}>
            Author: TrungQuanDev
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
    )
  }

  return (
    <form onSubmit={handleSubmit(submitForgotPassword)}>
      <Zoom in={true} style={{ transitionDelay: '200ms' }}>
        <MuiCard sx={{ minWidth: 380, maxWidth: 420, marginTop: '6em' }}>
          <Box sx={{
            margin: '1em',
            display: 'flex',
            justifyContent: 'center',
            gap: 1
          }}>
            <Avatar sx={{ bgcolor: 'warning.main' }}><EmailIcon /></Avatar>
            <Avatar sx={{ bgcolor: 'primary.main' }}><TrelloIcon /></Avatar>
          </Box>
          <Box sx={{ marginTop: '1em', display: 'flex', justifyContent: 'center', color: theme => theme.palette.grey[500] }}>
            Author: TrungQuanDev
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
                type="text"
                variant="outlined"
                error={!!errors['email']}
                {...register('email', {
                  required: FIELD_REQUIRED_MESSAGE,
                  pattern: {
                    value: EMAIL_RULE,
                    message: EMAIL_RULE_MESSAGE
                  }
                })}
              />
              <FieldErrorAlert errors={errors} fieldName={'email'} />
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
            >
              Send Reset Link
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
  )
}

export default ForgotPasswordForm 