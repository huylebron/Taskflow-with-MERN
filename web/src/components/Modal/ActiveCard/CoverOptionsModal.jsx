import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import CancelIcon from '@mui/icons-material/Cancel'
import ColorPicker from './ColorPicker'
import { Button, TextField } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { singleFileValidator } from '~/utils/validators'
import { toast } from 'react-toastify'
import { styled } from '@mui/material/styles'
import { API_ROOT } from '~/utils/constants'
import authorizedAxiosInstance from '~/utils/authorizeAxios'

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

function CoverOptionsModal({ isOpen, onClose, onSelectColor, onUploadCover }) {
  const [tabIndex, setTabIndex] = useState(0)
  const [coverOptions, setCoverOptions] = useState({ colors: {}, gradients: {} })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchCoverOptions = async () => {
      try {
        setIsLoading(true)
        // Fetch cover options from API
        const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/cards/cover-options`)
        setCoverOptions(response.data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching cover options:', error)
        setIsLoading(false)
        toast.error('Không thể tải các tùy chọn màu. Vui lòng thử lại sau.')
      }
    }

    if (isOpen) {
      fetchCoverOptions()
    }
  }, [isOpen])

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
    
    onUploadCover(file)
    onClose()
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="cover-options-modal"
      aria-describedby="modal to select card cover options">
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
        
        <Typography id="cover-options-modal-title" variant="h6" component="h2" gutterBottom>
          Tùy chọn ảnh bìa
        </Typography>
        
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="cover options tabs" sx={{ mb: 2 }}>
          <Tab label="Màu sắc" />
          <Tab label="Upload" />
        </Tabs>
        
        {tabIndex === 0 && (
          <Box>
            {isLoading ? (
              <Typography>Đang tải các tùy chọn màu...</Typography>
            ) : (
              <>
                <Typography variant="subtitle1" gutterBottom>Màu cơ bản</Typography>
                <ColorPicker 
                  colors={Object.values(coverOptions.colors)} 
                  onSelectColor={(color) => {
                    onSelectColor(color, 'color')
                    onClose()
                  }} 
                />
                
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Gradient</Typography>
                <ColorPicker 
                  colors={Object.values(coverOptions.gradients)} 
                  isGradient={true}
                  onSelectColor={(gradient) => {
                    onSelectColor(gradient, 'gradient')
                    onClose()
                  }} 
                />
              </>
            )}
          </Box>
        )}
        
        {tabIndex === 1 && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1" gutterBottom>
              Tải lên ảnh bìa mới cho thẻ
            </Typography>
            
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              sx={{ mt: 2 }}
            >
              Chọn ảnh
              <VisuallyHiddenInput 
                type="file" 
                onChange={handleFileUpload}
                accept="image/*"
              />
            </Button>
            
            <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
              Hỗ trợ định dạng JPG, PNG, GIF. Kích thước tối đa 10MB.
            </Typography>
          </Box>
        )}
      </Box>
    </Modal>
  )
}

export default CoverOptionsModal 