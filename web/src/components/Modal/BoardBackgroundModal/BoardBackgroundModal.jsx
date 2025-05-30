import { useState } from 'react'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import CancelIcon from '@mui/icons-material/Cancel'
import ColorLensIcon from '@mui/icons-material/ColorLens'
import ImageIcon from '@mui/icons-material/Image'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { Button } from '@mui/material'
import { singleFileValidator } from '~/utils/validators'
import { toast } from 'react-toastify'
import { styled } from '@mui/material/styles'
import ColorPicker from './ColorPicker'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
})

const BOARD_COLORS = {
  'Vibrant Blue': '#0079bf',
  'Deep Ocean': '#026aa7',
  'Forest Green': '#519839',
  'Sunset Orange': '#d29034',
  'Rich Purple': '#89609e',
  'Warm Pink': '#cd5a91',
  'Classic Gray': '#838c91',
  'Deep Navy': '#172b4d',
  'Teal': '#00897b',
  'Crimson': '#b04632'
}

const BOARD_GRADIENTS = {
  'Ocean Breeze': 'linear-gradient(to right, #00c6ff, #0072ff)',
  'Passion Pink': 'linear-gradient(to right, #f857a6, #ff5858)',
  'Fresh Mint': 'linear-gradient(to right, #4facfe, #00f2fe)',
  'Emerald Dream': 'linear-gradient(to right, #43e97b, #38f9d7)',
  'Golden Sunset': 'linear-gradient(to right, #fa709a, #fee140)'
}

function BoardBackgroundModal({ isOpen, onClose, onSelectBackground }) {
  const [tabIndex, setTabIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue)
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    const error = singleFileValidator(file)
    if (error) {
      toast.error(error)
      return
    }
    
    onSelectBackground(file, 'image')
    onClose()
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="board-background-modal"
      aria-describedby="modal to select board background options">
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 4
      }}>
        <Box sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          cursor: 'pointer'
        }}>
          <CancelIcon color="error" sx={{ '&:hover': { color: 'error.light' } }} onClick={onClose} />
        </Box>
        
        <Typography id="board-background-modal-title" variant="h6" component="h2" gutterBottom>
          Change Board Background
        </Typography>
        
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="board background options tabs" sx={{ mb: 2 }}>
          <Tab icon={<ColorLensIcon />} label="Colors" />
          <Tab icon={<ImageIcon />} label="Gradients" />
          <Tab icon={<CloudUploadIcon />} label="Upload" />
        </Tabs>
        
        {tabIndex === 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>Solid Colors</Typography>
            <ColorPicker 
              colors={Object.values(BOARD_COLORS)} 
              onSelectColor={(color) => {
                onSelectBackground(color, 'color')
                onClose()
              }} 
            />
          </Box>
        )}
        
        {tabIndex === 1 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>Gradient Backgrounds</Typography>
            <ColorPicker 
              colors={Object.values(BOARD_GRADIENTS)} 
              isGradient={true}
              onSelectColor={(gradient) => {
                onSelectBackground(gradient, 'gradient')
                onClose()
              }} 
            />
          </Box>
        )}
        
        {tabIndex === 2 && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1" gutterBottom>
              Upload a new background image
            </Typography>
            
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              sx={{ mt: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'Uploading...' : 'Choose Image'}
              <VisuallyHiddenInput 
                type="file" 
                onChange={handleFileUpload}
                accept="image/*"
              />
            </Button>
            
            <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
              Supported formats: JPG, PNG, GIF. Max size: 10MB.
            </Typography>
          </Box>
        )}
      </Box>
    </Modal>
  )
}

export default BoardBackgroundModal