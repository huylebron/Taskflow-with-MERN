import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Divider,
  Stack,
  LinearProgress,
  CircularProgress,
  Tooltip
} from '@mui/material'
import CancelIcon from '@mui/icons-material/Cancel'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import Checkbox from '@mui/material/Checkbox'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { toast } from 'react-toastify'

import {
  calculateChecklistProgress,
  formatProgressText,
  getProgressColor,
  validateChecklistExists,
  validateChecklistItemExists,
  getChecklistById,
  getChecklistItemById,
  generateDeleteChecklistMessage,
  generateDeleteItemMessage,
  createOptimisticDeleteChecklistState,
  createOptimisticDeleteItemState,
  restoreChecklistFromOptimistic,
  restoreChecklistItemFromOptimistic,
  checklistHasImportantContent
} from '~/utils/checklistUtils'
import { 
  CHECKLIST_LIMITS, 
  DELETE_UI_STATES, 
  DELETE_ERROR_MESSAGES,
  DELETE_SUCCESS_MESSAGES
} from '~/utils/checklistConstants'
import {
  createChecklistAPI,
  addCheckListItemAPI,
  updateChecklistItemStatusAPI,
  deleteChecklistAPI,
  deleteChecklistItemAPI
} from '~/apis'
import ConfirmationDialog from '~/components/ConfirmationDialog/ConfirmationDialog'

/**
 * ChecklistItem Component
 * Hiển thị một checklist riêng lẻ với title, progress bar và danh sách các items
 */
function ChecklistItem({
  checklist,
  onAddItem,
  onRemoveItem,
  onToggleItem,
  onRemoveChecklist,
  newItemText,
  onNewItemTextChange,
  onItemKeyPress,
  deletingChecklistId,
  isChecklistDeleting,
  deletingItemId,
  isItemDeleting
}) {
  // Tính toán progress
  const progress = calculateChecklistProgress(checklist)
  const progressColor = getProgressColor(progress.percentage)

  // Check if max items limit reached
  const isMaxItemsReached = checklist.items.length >= CHECKLIST_LIMITS.MAX_ITEMS_PER_CHECKLIST

  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        border: '1px solid',
        borderColor: theme =>
          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
        borderRadius: '8px',
        backgroundColor: theme =>
          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)'
      }}
    >
      {/* Header with title and delete button */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 1
      }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 'bold',
            wordBreak: 'break-word',
            pr: 2
          }}
        >
          {checklist.title}
        </Typography>
        <Tooltip title={isChecklistDeleting ? "Đang xóa..." : "Xóa checklist"}>
          <IconButton
            size="small"
            onClick={() => onRemoveChecklist(checklist._id)}
            disabled={isChecklistDeleting}
            sx={{
              color: theme => theme.palette.error.main,
              '&:hover': {
                backgroundColor: theme =>
                  theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.08)'
              },
              '&:disabled': {
                color: theme => theme.palette.action.disabled
              }
            }}
          >
            {deletingChecklistId === checklist._id ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <DeleteOutlinedIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Progress bar */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 0.5
        }}>
          <Typography variant="body2" color="text.secondary">
            Tiến độ: {formatProgressText(progress.completed, progress.total)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {progress.percentage}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress.percentage}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: theme =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: progressColor
            }
          }}
        />
      </Box>

      {/* Form để thêm item mới */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Thêm một mục mới..."
            value={newItemText}
            onChange={(e) => onNewItemTextChange(e.target.value)}
            onKeyPress={onItemKeyPress}
            disabled={isMaxItemsReached}
            inputProps={{
              maxLength: CHECKLIST_LIMITS.MAX_ITEM_TEXT_LENGTH
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '4px',
                backgroundColor: theme =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
              }
            }}
            InputProps={{
              endAdornment: newItemText && newItemText.length > 0 && (
                <InputAdornment position="end">
                  <Typography variant="caption" color="text.secondary">
                    {newItemText.length}/{CHECKLIST_LIMITS.MAX_ITEM_TEXT_LENGTH}
                  </Typography>
                </InputAdornment>
              )
            }}
          />
          <Button
            variant="contained"
            color="primary"
            disabled={!newItemText || isMaxItemsReached}
            onClick={() => onAddItem(checklist._id, newItemText)}
            sx={{
              minWidth: '44px',
              width: '44px',
              height: '40px',
              padding: 0,
              textTransform: 'none',
              borderRadius: '4px'
            }}
          >
            <AddCircleOutlineIcon fontSize="small" />
          </Button>
        </Box>

        {isMaxItemsReached && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
            Đã đạt giới hạn tối đa ({CHECKLIST_LIMITS.MAX_ITEMS_PER_CHECKLIST} items)
          </Typography>
        )}
      </Box>

      {/* Danh sách các items */}
      <Box>
        {checklist.items && checklist.items.length > 0 ? (
          <Stack spacing={1}>
            {checklist.items.map(item => (
              <Box
                key={item._id}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  p: 1,
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: theme =>
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
                  }
                }}
              >
                <Checkbox
                  checked={item.isCompleted}
                  onChange={() => onToggleItem(checklist._id, item._id)}
                  size="small"
                  sx={{
                    pt: 0,
                    color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#0079bf',
                    '&.Mui-checked': {
                      color: theme => theme.palette.mode === 'dark' ? '#64b5f6' : '#0079bf'
                    }
                  }}
                />
                <Box sx={{
                  flexGrow: 1,
                  mt: 0.5,
                  mr: 1,
                  wordBreak: 'break-word'
                }}>
                  <Typography
                    variant="body2"
                    sx={{
                      textDecoration: item.isCompleted ? 'line-through' : 'none',
                      color: item.isCompleted ? 'text.secondary' : 'text.primary',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {item.title}
                  </Typography>
                  {item.completedAt && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        fontSize: '10px',
                        mt: 0.5,
                        opacity: 0.7
                      }}
                    >
                      {new Date(item.completedAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Typography>
                  )}
                </Box>
                <Tooltip title={deletingItemId === item._id ? "Đang xóa..." : "Xóa item"}>
                  <IconButton
                    size="small"
                    onClick={() => onRemoveItem(checklist._id, item._id)}
                    disabled={isItemDeleting || isChecklistDeleting}
                    sx={{
                      color: theme => theme.palette.error.main,
                      opacity: 0.6,
                      p: 0.5,
                      '&:hover': {
                        opacity: 1,
                        backgroundColor: theme =>
                          theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.08)'
                      },
                      '&:disabled': {
                        color: theme => theme.palette.action.disabled,
                        opacity: 0.5
                      }
                    }}
                  >
                    {deletingItemId === item._id ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <DeleteOutlinedIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
          </Stack>
        ) : (
          <Box
            sx={{
              p: 2,
              textAlign: 'center',
              borderRadius: '4px',
              backgroundColor: theme =>
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Chưa có mục nào. Thêm mục mới ở trên.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

/**
 * ChecklistDialog Component
 * Hiển thị modal cho phép quản lý checklists của một card
 */
function ChecklistDialog({ isOpen, onClose, checklists = [], onUpdateChecklists, cardId }) {
  // State for new checklist form
  const [newChecklistTitle, setNewChecklistTitle] = useState('')

  // State for new items forms (1 form per checklist)
  const [newItemTexts, setNewItemTexts] = useState({})

  // State for delete operations
  const [deleteState, setDeleteState] = useState({
    isDeleting: false,
    deletingChecklistId: null,
    confirmDialog: {
      isOpen: false,
      checklistToDelete: null,
      confirmMessage: ''
    }
  })

  // State for delete item operations
  const [deleteItemState, setDeleteItemState] = useState({
    isDeleting: false,
    deletingItemId: null,
    deletingFromChecklistId: null,
    confirmDialog: {
      isOpen: false,
      itemToDelete: null,
      checklistContext: null,
      confirmMessage: ''
    }
  })

  // State for optimistic updates
  const [optimisticState, setOptimisticState] = useState({
    isOptimistic: false,
    originalChecklists: null,
    removedChecklist: null
  })

  // State for item optimistic updates
  const [itemOptimisticState, setItemOptimisticState] = useState({
    isOptimistic: false,
    originalChecklists: null,
    removedItem: null,
    checklistId: null
  })

  // Handler for adding a new checklist
  const handleAddChecklist = async () => {
    if (!newChecklistTitle) return

    try {
      const updatedCard = await createChecklistAPI(cardId, newChecklistTitle)
      onUpdateChecklists(updatedCard.checklists)
      setNewChecklistTitle('')
    } catch (error) {
      console.error('Error creating checklist:', error)
    }
  }

  // Handler for adding a new item to a checklist
  const handleAddItem = async (checklistId, itemText) => {
    if (!itemText) return

    try {
      const updatedCard = await addCheckListItemAPI(cardId, checklistId, itemText)
      onUpdateChecklists(updatedCard.checklists)

      // Reset form for this checklist
      setNewItemTexts({
        ...newItemTexts,
        [checklistId]: ''
      })
    } catch (error) {
      console.error('Error adding checklist item:', error)
    }
  }

  // Handler for toggling an item's completed status
  const handleToggleItem = async (checklistId, itemId) => {
    try {
      // Tìm checklist và item tương ứng
      const checklist = checklists.find(c => c._id === checklistId)
      const item = checklist?.items.find(i => i._id === itemId)
      if (!item) return

      // Gọi API để cập nhật trạng thái
      const updatedCard = await updateChecklistItemStatusAPI(
        cardId,
        checklistId,
        itemId,
        !item.isCompleted // Đảo ngược trạng thái hiện tại
      )

      // Cập nhật state với dữ liệu mới
      onUpdateChecklists(updatedCard.checklists)
    } catch (error) {
      console.error('Error updating checklist item status:', error)
      toast.error('Có lỗi khi cập nhật trạng thái item!')
    }
  }

  // Handler for removing an item from a checklist - Step 1: Show confirmation
  const handleRemoveItem = (checklistId, itemId) => {
    // Validate checklist and item exist
    if (!validateChecklistExists(checklists, checklistId)) {
      toast.error(DELETE_ERROR_MESSAGES.CHECKLIST_NOT_FOUND)
      return
    }

    if (!validateChecklistItemExists(checklists, checklistId, itemId)) {
      toast.error(DELETE_ERROR_MESSAGES.ITEM_NOT_FOUND)
      return
    }

    // Get item and checklist details for confirmation
    const itemToDelete = getChecklistItemById(checklists, checklistId, itemId)
    const checklistContext = getChecklistById(checklists, checklistId)
    
    if (!itemToDelete || !checklistContext) {
      toast.error(DELETE_ERROR_MESSAGES.ITEM_NOT_FOUND)
      return
    }

    // Check if item is "important" (completed items might be important to keep)
    const isImportantItem = itemToDelete.isCompleted || itemToDelete.completed
    
    // For important items or long text, show confirmation; for simple items, delete directly
    if (isImportantItem || (itemToDelete.title && itemToDelete.title.length > 50)) {
      // Generate confirmation message
      const confirmMessage = generateDeleteItemMessage(itemToDelete, checklistContext)

      // Show confirmation dialog
      setDeleteItemState(prev => ({
        ...prev,
        confirmDialog: {
          isOpen: true,
          itemToDelete,
          checklistContext,
          confirmMessage
        }
      }))
    } else {
      // Delete directly for simple items
      handleConfirmDeleteItem(checklistId, itemId, itemToDelete, checklistContext)
    }
  }

  // Handler for confirming item deletion
  const handleConfirmDeleteItem = async (checklistId = null, itemId = null, itemToDelete = null, checklistContext = null) => {
    // Get data from parameters or state
    const finalChecklistId = checklistId || deleteItemState.confirmDialog.checklistContext?._id
    const finalItemId = itemId || deleteItemState.confirmDialog.itemToDelete?._id
    const finalItemToDelete = itemToDelete || deleteItemState.confirmDialog.itemToDelete
    const finalChecklistContext = checklistContext || deleteItemState.confirmDialog.checklistContext
    
    if (!finalChecklistId || !finalItemId || !finalItemToDelete) {
      toast.error(DELETE_ERROR_MESSAGES.VALIDATION_ERROR)
      return
    }

    // Close confirmation dialog and set loading state
    setDeleteItemState(prev => ({
      ...prev,
      isDeleting: true,
      deletingItemId: finalItemId,
      deletingFromChecklistId: finalChecklistId,
      confirmDialog: {
        isOpen: false,
        itemToDelete: null,
        checklistContext: null,
        confirmMessage: ''
      }
    }))

    try {
      // Create optimistic update
      const optimisticUpdate = createOptimisticDeleteItemState(checklists, finalChecklistId, finalItemId)
      
      // Apply optimistic update
      setItemOptimisticState({
        isOptimistic: true,
        originalChecklists: checklists,
        removedItem: optimisticUpdate.removedItem,
        checklistId: finalChecklistId
      })
      
      // Update UI optimistically
      onUpdateChecklists(optimisticUpdate.checklists)

      // Call API to delete checklist item
      const updatedCard = await deleteChecklistItemAPI(cardId, finalChecklistId, finalItemId)
      
      // Success: Update with real data from server
      onUpdateChecklists(updatedCard.checklists)
      
      // Clear optimistic state
      setItemOptimisticState({
        isOptimistic: false,
        originalChecklists: null,
        removedItem: null,
        checklistId: null
      })

      // Show success message
      toast.success(DELETE_SUCCESS_MESSAGES.ITEM_DELETED, {
        position: 'bottom-right',
        autoClose: 3000
      })

    } catch (error) {
      console.error('❌ Error deleting checklist item:', error)
      
      // Rollback optimistic update
      if (itemOptimisticState.isOptimistic && itemOptimisticState.originalChecklists) {
        onUpdateChecklists(itemOptimisticState.originalChecklists)
      }
      
      // Clear optimistic state
      setItemOptimisticState({
        isOptimistic: false,
        originalChecklists: null,
        removedItem: null,
        checklistId: null
      })

      // Determine error message
      let errorMessage = DELETE_ERROR_MESSAGES.UNKNOWN_ERROR
      
      if (error.response?.status === 404) {
        errorMessage = DELETE_ERROR_MESSAGES.ITEM_NOT_FOUND
      } else if (error.response?.status === 403) {
        errorMessage = DELETE_ERROR_MESSAGES.PERMISSION_DENIED
      } else if (error.response?.status >= 500) {
        errorMessage = DELETE_ERROR_MESSAGES.SERVER_ERROR
      } else if (error.message?.includes('Network')) {
        errorMessage = DELETE_ERROR_MESSAGES.NETWORK_ERROR
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      // Show error message
      toast.error(errorMessage, {
        position: 'bottom-right',
        autoClose: 5000
      })
      
    } finally {
      // Reset loading state
      setDeleteItemState(prev => ({
        ...prev,
        isDeleting: false,
        deletingItemId: null,
        deletingFromChecklistId: null
      }))
    }
  }

  // Handler for canceling item deletion
  const handleCancelDeleteItem = () => {
    setDeleteItemState(prev => ({
      ...prev,
      confirmDialog: {
        isOpen: false,
        itemToDelete: null,
        checklistContext: null,
        confirmMessage: ''
      }
    }))
  }

  // Handler for removing a checklist - Step 1: Show confirmation
  const handleRemoveChecklist = (checklistId) => {
    // Validate checklist exists
    if (!validateChecklistExists(checklists, checklistId)) {
      toast.error(DELETE_ERROR_MESSAGES.CHECKLIST_NOT_FOUND)
      return
    }

    // Get checklist details for confirmation message
    const checklistToDelete = getChecklistById(checklists, checklistId)
    if (!checklistToDelete) {
      toast.error(DELETE_ERROR_MESSAGES.CHECKLIST_NOT_FOUND)
      return
    }

    // Generate confirmation message
    const confirmMessage = generateDeleteChecklistMessage(checklistToDelete)

    // Show confirmation dialog
    setDeleteState(prev => ({
      ...prev,
      confirmDialog: {
        isOpen: true,
        checklistToDelete,
        confirmMessage
      }
    }))
  }

  // Handler for confirming checklist deletion
  const handleConfirmDeleteChecklist = async () => {
    const { checklistToDelete } = deleteState.confirmDialog
    
    if (!checklistToDelete) {
      toast.error(DELETE_ERROR_MESSAGES.VALIDATION_ERROR)
      return
    }

    // Close confirmation dialog and set loading state
    setDeleteState(prev => ({
      ...prev,
      isDeleting: true,
      deletingChecklistId: checklistToDelete._id,
      confirmDialog: {
        isOpen: false,
        checklistToDelete: null,
        confirmMessage: ''
      }
    }))

    try {
      // Create optimistic update
      const optimisticUpdate = createOptimisticDeleteChecklistState(checklists, checklistToDelete._id)
      
      // Apply optimistic update
      setOptimisticState({
        isOptimistic: true,
        originalChecklists: checklists,
        removedChecklist: optimisticUpdate.removedChecklist
      })
      
      // Update UI optimistically
      onUpdateChecklists(optimisticUpdate.checklists)

      // Call API to delete checklist
      const updatedCard = await deleteChecklistAPI(cardId, checklistToDelete._id)
      
      // Success: Update with real data from server
      onUpdateChecklists(updatedCard.checklists)
      
      // Clear optimistic state
      setOptimisticState({
        isOptimistic: false,
        originalChecklists: null,
        removedChecklist: null
      })

      // Show success message
      toast.success(DELETE_SUCCESS_MESSAGES.CHECKLIST_DELETED, {
        position: 'bottom-right',
        autoClose: 3000
      })

    } catch (error) {
      console.error('❌ Error deleting checklist:', error)
      
      // Rollback optimistic update
      if (optimisticState.isOptimistic && optimisticState.originalChecklists) {
        onUpdateChecklists(optimisticState.originalChecklists)
      }
      
      // Clear optimistic state
      setOptimisticState({
        isOptimistic: false,
        originalChecklists: null,
        removedChecklist: null
      })

      // Determine error message
      let errorMessage = DELETE_ERROR_MESSAGES.UNKNOWN_ERROR
      
      if (error.response?.status === 404) {
        errorMessage = DELETE_ERROR_MESSAGES.CHECKLIST_NOT_FOUND
      } else if (error.response?.status === 403) {
        errorMessage = DELETE_ERROR_MESSAGES.PERMISSION_DENIED
      } else if (error.response?.status >= 500) {
        errorMessage = DELETE_ERROR_MESSAGES.SERVER_ERROR
      } else if (error.message?.includes('Network')) {
        errorMessage = DELETE_ERROR_MESSAGES.NETWORK_ERROR
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      // Show error message
      toast.error(errorMessage, {
        position: 'bottom-right',
        autoClose: 5000
      })
      
    } finally {
      // Reset loading state
      setDeleteState(prev => ({
        ...prev,
        isDeleting: false,
        deletingChecklistId: null
      }))
    }
  }

  // Handler for canceling checklist deletion
  const handleCancelDeleteChecklist = () => {
    setDeleteState(prev => ({
      ...prev,
      confirmDialog: {
        isOpen: false,
        checklistToDelete: null,
        confirmMessage: ''
      }
    }))
  }

  // Handler for Enter key press in new checklist form
  const handleChecklistKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddChecklist()
    }
  }

  // Handler for Enter key press in new item form
  const handleItemKeyPress = (e, checklistId) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddItem(checklistId, newItemTexts[checklistId] || '')
    }
  }

  // Handler for new item text change
  const handleNewItemTextChange = (checklistId, text) => {
    setNewItemTexts({
      ...newItemTexts,
      [checklistId]: text
    })
  }

  // Check if max checklists limit reached
  const isMaxChecklistsReached = checklists.length >= CHECKLIST_LIMITS.MAX_CHECKLISTS_PER_CARD

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '8px',
            maxHeight: '80vh'
          }
        }}
      >
      {/* Dialog header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid',
          borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <TaskAltOutlinedIcon sx={{ color: theme => theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Checklist
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)',
            '&:hover': {
              color: theme => theme.palette.mode === 'dark' ? '#fff' : '#000',
              backgroundColor: 'transparent'
            }
          }}
        >
          <CancelIcon />
        </IconButton>
      </DialogTitle>

      {/* Dialog content */}
      <DialogContent sx={{ padding: '24px' }}>
        {/* Form thêm checklist mới */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: '600' }}>
            Thêm checklist mới
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Nhập tiêu đề cho checklist mới..."
              value={newChecklistTitle}
              onChange={(e) => setNewChecklistTitle(e.target.value)}
              onKeyPress={handleChecklistKeyPress}
              disabled={isMaxChecklistsReached}
              inputProps={{
                maxLength: CHECKLIST_LIMITS.MAX_TITLE_LENGTH
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '4px',
                  backgroundColor: theme =>
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
                }
              }}
              InputProps={{
                endAdornment: newChecklistTitle.length > 0 && (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="text.secondary">
                      {newChecklistTitle.length}/{CHECKLIST_LIMITS.MAX_TITLE_LENGTH}
                    </Typography>
                  </InputAdornment>
                )
              }}
            />

            <Button
              variant="contained"
              color="primary"
              disabled={!newChecklistTitle.trim() || isMaxChecklistsReached}
              onClick={handleAddChecklist}
              startIcon={<AddCircleOutlineIcon />}
              sx={{
                minWidth: '120px',
                textTransform: 'none',
                borderRadius: '4px'
              }}
            >
              Thêm
            </Button>
          </Box>

          {isMaxChecklistsReached && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
              Đã đạt giới hạn tối đa ({CHECKLIST_LIMITS.MAX_CHECKLISTS_PER_CARD} checklists)
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Danh sách các checklists */}
        {checklists.length > 0 ? (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: '600' }}>
              Danh sách checklist ({checklists.length})
            </Typography>

            {checklists.map(checklist => (
              <ChecklistItem
                key={checklist._id}
                checklist={checklist}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                onToggleItem={handleToggleItem}
                onRemoveChecklist={handleRemoveChecklist}
                newItemText={newItemTexts[checklist._id] || ''}
                onNewItemTextChange={(text) => handleNewItemTextChange(checklist._id, text)}
                onItemKeyPress={(e) => handleItemKeyPress(e, checklist._id)}
                deletingChecklistId={deleteState.deletingChecklistId}
                isChecklistDeleting={deleteState.isDeleting && deleteState.deletingChecklistId === checklist._id}
                deletingItemId={deleteItemState.deletingItemId}
                isItemDeleting={deleteItemState.isDeleting && deleteItemState.deletingFromChecklistId === checklist._id}
              />
            ))}
          </Box>
        ) : (
          <Box sx={{
            mt: 3,
            textAlign: 'center',
            p: 4,
            backgroundColor: theme =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
            borderRadius: '8px'
          }}>
            <TaskAltOutlinedIcon
              sx={{
                fontSize: '48px',
                color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                mb: 1
              }}
            />
            <Typography variant="body1" color="text.secondary">
              Chưa có checklist nào. Hãy tạo checklist mới phía trên.
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* Dialog actions */}
      <DialogActions sx={{ padding: '16px 24px' }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            textTransform: 'none',
            fontWeight: 'bold',
            borderRadius: '4px'
          }}
        >
          Đóng
        </Button>
      </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Delete Checklist */}
      <ConfirmationDialog
        open={deleteState.confirmDialog.isOpen}
        title="Xác nhận xóa checklist"
        items={deleteState.confirmDialog.checklistToDelete ? [
          `Checklist: "${deleteState.confirmDialog.checklistToDelete.title}"`,
          `Số items: ${deleteState.confirmDialog.checklistToDelete.items?.length || 0}`,
          deleteState.confirmDialog.checklistToDelete.items?.length > 0 
            ? `Đã hoàn thành: ${deleteState.confirmDialog.checklistToDelete.items.filter(item => item.isCompleted || item.completed).length}`
            : 'Chưa có items nào'
        ] : []}
        loading={deleteState.isDeleting}
        onConfirm={handleConfirmDeleteChecklist}
        onCancel={handleCancelDeleteChecklist}
      />

      {/* Confirmation Dialog for Delete Item */}
      <ConfirmationDialog
        open={deleteItemState.confirmDialog.isOpen}
        title="Xác nhận xóa item"
        items={deleteItemState.confirmDialog.itemToDelete && deleteItemState.confirmDialog.checklistContext ? [
          `Item: "${deleteItemState.confirmDialog.itemToDelete.title || 'Untitled'}"`,
          `Từ checklist: "${deleteItemState.confirmDialog.checklistContext.title}"`,
          `Trạng thái: ${(deleteItemState.confirmDialog.itemToDelete.isCompleted || deleteItemState.confirmDialog.itemToDelete.completed) ? 'Đã hoàn thành' : 'Chưa hoàn thành'}`,
          (deleteItemState.confirmDialog.itemToDelete.isCompleted || deleteItemState.confirmDialog.itemToDelete.completed) 
            ? 'Cảnh báo: Item đã hoàn thành có thể quan trọng!'
            : 'Item chưa hoàn thành sẽ bị xóa vĩnh viễn'
        ] : []}
        loading={deleteItemState.isDeleting}
        onConfirm={() => handleConfirmDeleteItem()}
        onCancel={handleCancelDeleteItem}
      />
    </>
  )
}

export default ChecklistDialog