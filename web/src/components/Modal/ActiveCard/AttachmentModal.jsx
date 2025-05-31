import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import CloseIcon from '@mui/icons-material/Close'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Unstable_Grid2'
import Tooltip from '@mui/material/Tooltip'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import { multipleFilesValidator, ALLOW_ATTACHMENT_FILE_TYPES } from '~/utils/validators'

// Mock data cho attachments
export const MOCK_ATTACHMENTS = [
  {
    id: 'att-001',
    name: 'task-screenshot.jpg',
    url: 'https://via.placeholder.com/300x200?text=Task+Screenshot',
    type: 'image/jpeg',
    size: 245000, // 245 KB
    uploadedAt: new Date('2023-10-15T10:30:00Z')
  },
  {
    id: 'att-002',
    name: 'project-requirements.pdf',
    url: 'https://incompetech.com/documents/samples/Sample%20Document.pdf',
    type: 'application/pdf',
    size: 1200000, // 1.2 MB
    uploadedAt: new Date('2023-10-10T08:15:00Z')
  },
  {
    id: 'att-003',
    name: 'wireframe-design.png',
    url: 'https://via.placeholder.com/800x600?text=Wireframe+Design',
    type: 'image/png',
    size: 785000, // 785 KB
    uploadedAt: new Date('2023-10-20T14:45:00Z')
  }
]

// Styled components
const DialogWrapper = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '8px',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 0 12px rgba(255, 255, 255, 0.15)' 
      : '0 0 12px rgba(0, 0, 0, 0.15)',
    backgroundColor: theme.palette.mode === 'dark' ? '#2f3542' : '#fff',
    overflow: 'hidden',
    maxWidth: '550px',
    width: '100%',
    margin: '16px'
  }
}))

const DialogHeader = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: theme.palette.mode === 'dark' ? '#3a4050' : '#f5f5f5',
  padding: '12px 16px',
  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#4a4d56' : '#e0e0e0'}`
}))

const CloseButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? '#90caf9' : '#172b4d',
  padding: '6px',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#33485D' : theme.palette.grey[200],
  }
}))

const AttachmentCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.mode === 'dark' ? '#2a303c' : '#fff',
  borderRadius: '8px',
  border: `1px solid ${theme.palette.mode === 'dark' ? '#3a4050' : '#e0e0e0'}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 4px 8px rgba(255, 255, 255, 0.1)' 
      : '0 4px 8px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-2px)',
  }
}))

const UploadButton = styled(Button)(({ theme }) => ({
  marginTop: '16px',
  backgroundColor: theme.palette.mode === 'dark' ? '#3a4050' : '#e0e0e0',
  color: theme.palette.mode === 'dark' ? '#fff' : '#172b4d',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#4a5060' : '#d0d0d0',
  }
}))

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

// Helper function để format file size
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' bytes'
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  else return (bytes / 1048576).toFixed(1) + ' MB'
}

// Helper function để format date
function formatDate(date) {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Component cho từng attachment item
function AttachmentItem({ attachment, onDelete, onPreview }) {
  const isImage = attachment.type.startsWith('image/')
  const isPdf = attachment.type === 'application/pdf'
  
  // Xác định icon dựa trên loại file
  const FileIcon = () => {
    if (isPdf) return <PictureAsPdfIcon sx={{ fontSize: 40, color: '#f44336' }} />
    if (!isImage) return <InsertDriveFileIcon sx={{ fontSize: 40, color: '#2196f3' }} />
    return null
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    if (window.confirm(`Bạn có chắc chắn muốn xóa file "${attachment.name}"?`)) {
      onDelete(attachment.id)
    }
  }

  return (
    <AttachmentCard onClick={() => onPreview(attachment)}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {isImage ? (
          <CardMedia
            component="img"
            height="140"
            image={attachment.url}
            alt={attachment.name}
            sx={{ 
              objectFit: 'cover',
              cursor: 'pointer',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px'
            }}
          />
        ) : (
          <Box sx={{ 
            height: '140px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#3a4050' : '#f5f5f5'
          }}>
            <FileIcon />
          </Box>
        )}
        
        <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
          <Typography variant="subtitle2" component="div" noWrap title={attachment.name}>
            {attachment.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" component="div">
            {formatFileSize(attachment.size)} • {formatDate(attachment.uploadedAt)}
          </Typography>
        </CardContent>

        <CardActions sx={{ p: 1, pt: 0, justifyContent: 'flex-end' }}>
          <Tooltip title="Xóa tệp đính kèm">
            <IconButton 
              size="small" 
              color="error"
              onClick={handleDeleteClick}
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Box>
    </AttachmentCard>
  )
}

function AttachmentModal({ isOpen, onClose, attachments = MOCK_ATTACHMENTS, onAddAttachment, onDeleteAttachment, onPreviewAttachment }) {
  // Xử lý upload file
  const handleFileUpload = (event) => {
    const files = event.target.files
    
    if (!files || files.length === 0) return
    
    // Validate files
    const error = multipleFilesValidator(files)
    if (error) {
      toast.error(error)
      return
    }
    
    // Giả lập upload
    Array.from(files).forEach((file) => {
      // Random waiting time để giả lập upload
      const randomWaitTime = Math.floor(Math.random() * 1000) + 500
      
      toast.info(`Đang tải lên ${file.name}...`, { autoClose: randomWaitTime })
      
      setTimeout(() => {
        // Tạo URL tạm thời cho mỗi file
        let fileUrl
        if (file.type.startsWith('image/')) {
          // Giả lập URL ảnh
          const width = Math.floor(Math.random() * 400) + 400
          const height = Math.floor(Math.random() * 300) + 300
          fileUrl = `https://via.placeholder.com/${width}x${height}?text=${encodeURIComponent(file.name)}`
        } else if (file.type === 'application/pdf') {
          // URL cho PDF mẫu
          fileUrl = 'https://incompetech.com/documents/samples/Sample%20Document.pdf'
        } else {
          // URL mẫu cho các loại file khác
          fileUrl = 'https://example.com/files/document.docx'
        }
        
        // Tạo attachment mới
        const newAttachment = {
          id: `att-${uuidv4()}`,
          name: file.name,
          url: fileUrl,
          type: file.type,
          size: file.size,
          uploadedAt: new Date()
        }
        
        // Thêm vào state thông qua callback
        onAddAttachment(newAttachment)
      }, randomWaitTime)
    })
    
    // Reset input file
    event.target.value = ''
  }

  return (
    <DialogWrapper
      open={isOpen}
      onClose={onClose}
      aria-labelledby="attachment-dialog-title"
      fullWidth
      maxWidth="md"
    >
      <DialogHeader id="attachment-dialog-title">
        <Typography variant="h6" component="div" sx={{ fontWeight: '600' }}>
          Tệp đính kèm
        </Typography>
        <CloseButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </CloseButton>
      </DialogHeader>
      <DialogContent sx={{ p: 2 }}>
        <Box sx={{ p: 2 }}>
          {/* Upload area */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              textAlign: 'center'
            }}
          >
            <Stack direction="column" spacing={1} alignItems="center">
              <AttachFileIcon fontSize="large" color="action" />
              <Typography variant="body1">
                Kéo và thả tệp tin vào đây hoặc
              </Typography>
              <Button
                component="label"
                startIcon={<UploadFileIcon />}
                variant="contained"
                color="primary"
              >
                Chọn tệp
                <VisuallyHiddenInput 
                  type="file" 
                  multiple 
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                />
              </Button>
              <Typography variant="caption" color="text.secondary">
                Hỗ trợ: JPG, PNG, GIF, PDF, DOC, XLS, PPT, TXT (tối đa 10MB)
              </Typography>
            </Stack>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Attachment list */}
          <Typography variant="h6" component="div" sx={{ mb: 2 }}>
            Danh sách tệp đính kèm ({attachments.length})
          </Typography>
          
          {attachments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Chưa có tệp đính kèm nào
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {attachments.map((attachment) => (
                <Grid xs={12} sm={6} md={4} key={attachment.id}>
                  <AttachmentItem 
                    attachment={attachment} 
                    onDelete={onDeleteAttachment}
                    onPreview={onPreviewAttachment}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </DialogContent>
    </DialogWrapper>
  )
}

export default AttachmentModal 