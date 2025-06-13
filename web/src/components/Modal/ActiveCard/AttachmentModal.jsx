import { useState, useEffect } from 'react'
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
import CircularProgress from '@mui/material/CircularProgress'
import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Unstable_Grid2'
import Tooltip from '@mui/material/Tooltip'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import { multipleFilesValidator, ALLOW_ATTACHMENT_FILE_TYPES } from '~/utils/validators'

// 🚨 CRITICAL: Import attachment APIs để thay thế mock data
import {
  uploadAttachmentsAPI,
  getAttachmentsAPI,
  deleteAttachmentAPI,
  downloadAttachmentAPI
} from '~/apis/attachmentAPIs'

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
    backgroundColor: theme.palette.mode === 'dark' ? '#33485D' : theme.palette.grey[200]
  }
}))

const AttachmentCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.mode === 'dark' ? '#2a303c' : '#fff',
  borderRadius: '8px',
  border: `1px solid ${theme.palette.mode === 'dark' ? '#3a4050' : '#e0e0e0'}`,
  transition: 'all 0.2s ease',
  // 🎨 CRITICAL: Fixed height để tất cả cards bằng nhau
  height: '280px',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark'
      ? '0 4px 8px rgba(255, 255, 255, 0.1)'
      : '0 4px 8px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-2px)'
  }
}))

const UploadButton = styled(Button)(({ theme }) => ({
  marginTop: '16px',
  backgroundColor: theme.palette.mode === 'dark' ? '#3a4050' : '#e0e0e0',
  color: theme.palette.mode === 'dark' ? '#fff' : '#172b4d',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#4a5060' : '#d0d0d0'
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
  width: 1
})

// Helper function để format file size
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' bytes'
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  else return (bytes / 1048576).toFixed(1) + ' MB'
}

// Helper function để format date với error handling
function formatDate(date) {
  try {
    if (!date) return 'Unknown Date'

    const dateObj = new Date(date)

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date format:', date)
      return 'Invalid Date'
    }

    return dateObj.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Date formatting error:', error, 'for date:', date)
    return 'Error Date'
  }
}

// Component cho từng attachment item
function AttachmentItem({ attachment, onDelete, onPreview, onDownload, isDeleting = false, isDownloading = false }) {
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
      onDelete(attachment._id || attachment.id) // Support both _id (API) and id (mock)
    }
  }

  const handleDownloadClick = (e) => {
    e.stopPropagation()
    onDownload(attachment._id || attachment.id, attachment.name)
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

        <CardContent sx={{
          flexGrow: 1,
          p: 1.5,
          // 🎨 CRITICAL: Fixed content area height
          height: '80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <Typography
            variant="subtitle2"
            component="div"
            noWrap
            title={attachment.name}
            sx={{ mb: 0.5, lineHeight: 1.2 }}
          >
            {attachment.name}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            component="div"
            sx={{ lineHeight: 1.2 }}
          >
            {formatFileSize(attachment.size)} • {formatDate(attachment.createdAt)}
          </Typography>
        </CardContent>

        <CardActions sx={{
          p: 1,
          pt: 0,
          justifyContent: 'space-between',
          // 🎨 CRITICAL: Fixed action bar height
          height: '48px',
          alignItems: 'center'
        }}>
          <Tooltip title={isDownloading ? 'Đang tải xuống...' : 'Tải xuống'}>
            <IconButton
              size="small"
              color="primary"
              onClick={handleDownloadClick}
              disabled={isDownloading}
              data-testid="download-attachment"
            >
              {isDownloading ? (
                <CircularProgress size={16} />
              ) : (
                <UploadFileIcon fontSize="small" sx={{ transform: 'rotate(180deg)' }} />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa tệp đính kèm">
            <IconButton
              size="small"
              color="error"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              data-testid="delete-attachment"
            >
              {isDeleting ? (
                <CircularProgress size={16} />
              ) : (
                <DeleteOutlinedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </CardActions>
      </Box>
    </AttachmentCard>
  )
}

function AttachmentModal({
  isOpen,
  onClose,
  cardId,
  attachments = [],
  onAddAttachment,
  onDeleteAttachment,
  onPreviewAttachment
}) {
  // 🚨 CRITICAL: State management cho loading states
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [deletingAttachments, setDeletingAttachments] = useState(new Set())
  const [localAttachments, setLocalAttachments] = useState(attachments)

  // 🔍 DEBUG: Track localAttachments changes
  useEffect(() => {
    console.log('📊 localAttachments state changed:', localAttachments.length, localAttachments)
  }, [localAttachments])
  // 🎯 PHASE 11: Error handling với retry mechanism
  const [loadError, setLoadError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  // ⚠️ CẨN THẬN: Load attachments khi mở modal và reset khi đóng
  useEffect(() => {
    if (isOpen && cardId) {
      console.log('🔄 Modal opened - Loading attachments for cardId:', cardId)
      loadAttachments()
    } else if (!isOpen) {
      // Reset state khi đóng modal để tránh stale data
      console.log('🔄 Modal closed - Resetting state')
      setLocalAttachments([])
      setLoadError(null)
      setRetryCount(0)
    }
  }, [isOpen, cardId])

  // 🚨 CRITICAL: Remove props sync - depend only on API calls
  // Props attachments không được sync nữa để tránh conflict với reload từ server

  // 🔥 QUAN TRỌNG: Load attachments từ API với debug logging
  const loadAttachments = async (retryAttempt = 0) => {
    if (!cardId) {
      console.log('❌ loadAttachments: No cardId provided')
      return
    }

    console.log('🔄 loadAttachments: Starting for cardId:', cardId)

    try {
      setIsLoading(true)
      setLoadError(null)

      const result = await getAttachmentsAPI(cardId)
      console.log('✅ loadAttachments: Success, got', result.attachments.length, 'attachments')
      console.log('📝 loadAttachments: Setting localAttachments to:', result.attachments)

      // 🔍 DEBUG: Check date fields specifically
      if (result.attachments.length > 0) {
        const firstAttachment = result.attachments[0]
        console.log('📅 DEBUG attachment date fields:', {
          createdAt: firstAttachment.createdAt,
          updatedAt: firstAttachment.updatedAt,
          uploadedAt: firstAttachment.uploadedAt,
          typeof_createdAt: typeof firstAttachment.createdAt
        })
      }

      // 🚨 CRITICAL: Force state update với callback để đảm bảo update
      setLocalAttachments(prev => {
        console.log('📊 setLocalAttachments: prev state was:', prev.length)
        console.log('📊 setLocalAttachments: updating to:', result.attachments.length)
        return result.attachments
      })

      setRetryCount(0) // Reset retry count on success

    } catch (error) {
      console.error('❌ loadAttachments: Failed:', error)
      setLoadError(error.message)

      // Fallback to props attachments nếu API failed
      if (attachments.length > 0) {
        console.log('🔄 loadAttachments: Using fallback props attachments')
        setLocalAttachments(attachments)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 🎯 PHASE 11: Retry function
  const handleRetryLoad = () => {
    const newRetryCount = retryCount + 1
    setRetryCount(newRetryCount)
    loadAttachments(newRetryCount)
  }

  // 🚨 CRITICAL: Real upload function thay thế mock
  const handleFileUpload = async (event) => {
    const files = event.target.files

    if (!files || files.length === 0) return

    // Validate files
    const error = multipleFilesValidator(files)
    if (error) {
      toast.error(error)
      return
    }

    if (!cardId) {
      toast.error('Card ID không hợp lệ')
      return
    }

    try {
      setIsUploading(true)

      // 🔥 QUAN TRỌNG: Upload thật thay vì mock
      const result = await uploadAttachmentsAPI(cardId, files)

      // 🔍 DEBUG: Log upload response structure
      console.log('📦 Upload result:', result)
      console.log('📦 Upload result.data:', result.data)

      if (result.success) {
        // 🚨 CRITICAL: Safe access với correct property names từ backend
        const uploadResults = result.data?.uploadResults || {}
        const successCount = uploadResults.successCount || 0
        const totalCount = uploadResults.totalFiles || 0
        const failedFiles = uploadResults.failedFiles || [] // Backend uses 'failedFiles', not 'failed'

        toast.success(`Upload thành công ${successCount}/${totalCount} files!`)

        // Thông báo failed files nếu có
        if (failedFiles.length > 0) {
          failedFiles.forEach(failedFile => {
            toast.error(`Upload failed: ${failedFile.name} - ${failedFile.error}`)
          })
        }

        // 🚨 CRITICAL: Reload attachments từ server để đảm bảo data consistency
        console.log('🔄 Upload success - Reloading attachments...')
        console.log('📊 localAttachments before reload:', localAttachments.length)
        await loadAttachments()
        console.log('✅ Upload reload completed')

        // 🔍 DEBUG: Check state after a delay
        setTimeout(() => {
          console.log('📊 localAttachments after 1s delay:', localAttachments.length)
        }, 1000)

        // 🚨 CRITICAL: Skip callback để tránh conflict với reload
        console.log('🔄 Skipping onAddAttachment callback to avoid conflicts')
        // Callback có thể gây conflict với reload data từ server
        // if (onAddAttachment) {
        //   const newAttachments = result.data.uploadResults.successFiles.map(file => ({
        //     _id: file.attachmentId,
        //     name: file.name,
        //     url: file.url,
        //     type: file.type,
        //     size: file.size,
        //     uploadedAt: file.uploadedAt || new Date()
        //   }))
        //   newAttachments.forEach(attachment => onAddAttachment(attachment))
        // }
      }
    } catch (error) {
      console.error('Upload error:', error)
      // Error đã được handle trong API function
    } finally {
      setIsUploading(false)
      // Reset input file
      event.target.value = ''
    }
  }

  // 🚨 CRITICAL: Real delete function với reload data
  const handleDeleteAttachment = async (attachmentId) => {
    try {
      setDeletingAttachments(prev => new Set([...prev, attachmentId]))

      await deleteAttachmentAPI(attachmentId)

      // 🚨 CRITICAL: Reload attachments từ server thay vì chỉ remove local
      console.log('🔄 Delete success - Reloading attachments...')
      await loadAttachments()
      console.log('✅ Delete reload completed')

      // Callback để cập nhật parent component
      if (onDeleteAttachment) {
        onDeleteAttachment(attachmentId)
      }

      // Success feedback đã có trong API function
    } catch (error) {
      console.error('Delete error:', error)
      // Error đã được handle trong API function
    } finally {
      setDeletingAttachments(prev => {
        const newSet = new Set(prev)
        newSet.delete(attachmentId)
        return newSet
      })
    }
  }

  // 🔥 QUAN TRỌNG: Real download function với loading state
  const [downloadingAttachments, setDownloadingAttachments] = useState(new Set())

  const handleDownloadAttachment = async (attachmentId, fileName) => {
    try {
      // Add loading state
      setDownloadingAttachments(prev => new Set([...prev, attachmentId]))

      console.log('🔄 Starting download process for:', attachmentId, fileName)

      await downloadAttachmentAPI(attachmentId, fileName)

      console.log('✅ Download completed for:', attachmentId)

    } catch (error) {
      console.error('❌ Download error:', error)
      // Error đã được handle trong API function
    } finally {
      // Remove loading state
      setDownloadingAttachments(prev => {
        const newSet = new Set(prev)
        newSet.delete(attachmentId)
        return newSet
      })
    }
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
                startIcon={isUploading ? <CircularProgress size={20} /> : <UploadFileIcon />}
                variant="contained"
                color="primary"
                disabled={isUploading}
              >
                {isUploading ? 'Đang tải lên...' : 'Chọn tệp'}
                <VisuallyHiddenInput
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  disabled={isUploading}
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
            Danh sách tệp đính kèm ({localAttachments.length})
          </Typography>

          {isLoading ? (
            <Box sx={{ py: 2 }}>
              {/* 🚀 BONUS: Skeleton loading cho better UX */}
              <Grid container spacing={2}>
                {[1, 2, 3].map((index) => (
                  <Grid xs={12} sm={6} md={4} key={`skeleton-${index}`}>
                    <Box
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        overflow: 'hidden',
                        // 🎨 CRITICAL: Match AttachmentCard height
                        height: 280
                      }}
                    >
                      {/* Image skeleton */}
                      <Box
                        sx={{
                          height: 140,
                          backgroundColor: 'action.hover',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <CircularProgress size={20} />
                      </Box>
                      {/* Content skeleton */}
                      <Box sx={{
                        p: 1.5,
                        // 🎨 CRITICAL: Match CardContent height
                        height: 80,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <Box
                          sx={{
                            height: 16,
                            backgroundColor: 'action.hover',
                            borderRadius: 0.5,
                            mb: 1
                          }}
                        />
                        <Box
                          sx={{
                            height: 12,
                            backgroundColor: 'action.hover',
                            borderRadius: 0.5,
                            width: '70%'
                          }}
                        />
                      </Box>
                      {/* Actions skeleton */}
                      <Box sx={{
                        p: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        // 🎨 CRITICAL: Match CardActions height
                        height: 48,
                        alignItems: 'center'
                      }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            backgroundColor: 'action.hover',
                            borderRadius: '50%'
                          }}
                        />
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            backgroundColor: 'action.hover',
                            borderRadius: '50%'
                          }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : loadError ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              {/* 🎯 PHASE 11: Error state với retry */}
              <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                ⚠️ Không thể tải danh sách tệp đính kèm
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {loadError}
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleRetryLoad}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={16} /> : null}
              >
                {isLoading ? 'Đang thử lại...' : `Thử lại${retryCount > 0 ? ` (${retryCount})` : ''}`}
              </Button>
            </Box>
          ) : localAttachments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Chưa có tệp đính kèm nào
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {localAttachments.map((attachment) => (
                <Grid xs={12} sm={6} md={4} key={attachment._id || attachment.id}>
                  <AttachmentItem
                    attachment={attachment}
                    onDelete={handleDeleteAttachment}
                    onPreview={onPreviewAttachment}
                    onDownload={handleDownloadAttachment}
                    isDeleting={deletingAttachments.has(attachment._id || attachment.id)}
                    isDownloading={downloadingAttachments.has(attachment._id || attachment.id)}
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