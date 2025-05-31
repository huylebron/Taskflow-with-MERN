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
  LinearProgress
} from '@mui/material'
import CancelIcon from '@mui/icons-material/Cancel'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import Checkbox from '@mui/material/Checkbox'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'

import { 
  createNewChecklist,
  addItemToChecklist,
  removeItemFromChecklist,
  toggleItemInChecklist,
  updateChecklistInList,
  removeChecklistFromList,
  calculateChecklistProgress,
  formatProgressText,
  getProgressColor
} from '~/utils/checklistUtils'
import { CHECKLIST_LIMITS } from '~/utils/checklistConstants'

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
  onItemKeyPress
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
        <IconButton 
          size="small" 
          onClick={() => onRemoveChecklist(checklist.id)}
          sx={{
            color: theme => theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme => 
                theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.08)'
            }
          }}
        >
          <DeleteOutlinedIcon fontSize="small" />
        </IconButton>
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
            disabled={!newItemText || !newItemText.trim() || isMaxItemsReached}
            onClick={() => onAddItem(newItemText)}
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
                key={item.id}
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
                  checked={item.completed} 
                  onChange={() => onToggleItem(item.id)}
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
                      textDecoration: item.completed ? 'line-through' : 'none',
                      color: item.completed ? 'text.secondary' : 'text.primary',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {item.text}
                  </Typography>
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
                    {new Date(item.createdAt).toLocaleDateString('vi-VN', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </Typography>
                </Box>
                <IconButton 
                  size="small"
                  onClick={() => onRemoveItem(item.id)}
                  sx={{ 
                    color: theme => theme.palette.error.main,
                    opacity: 0.6,
                    p: 0.5,
                    '&:hover': {
                      opacity: 1,
                      backgroundColor: theme => 
                        theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.08)'
                    }
                  }}
                >
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
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
function ChecklistDialog({ isOpen, onClose, checklists = [], onUpdateChecklists }) {
  // State for new checklist form
  const [newChecklistTitle, setNewChecklistTitle] = useState('')

  // State for new items forms (1 form per checklist)
  const [newItemTexts, setNewItemTexts] = useState({})

  // Handler for adding a new checklist
  const handleAddChecklist = () => {
    if (!newChecklistTitle.trim()) return
    
    const newChecklist = createNewChecklist(newChecklistTitle)
    onUpdateChecklists([...checklists, newChecklist])
    
    // Reset form
    setNewChecklistTitle('')
  }

  // Handler for adding a new item to a checklist
  const handleAddItem = (checklistId, itemText) => {
    if (!itemText.trim()) return
    
    const updatedChecklists = checklists.map(checklist => {
      if (checklist.id === checklistId) {
        return addItemToChecklist(checklist, itemText)
      }
      return checklist
    })
    
    onUpdateChecklists(updatedChecklists)
    
    // Reset form for this checklist
    setNewItemTexts({
      ...newItemTexts,
      [checklistId]: ''
    })
  }

  // Handler for removing an item from a checklist
  const handleRemoveItem = (checklistId, itemId) => {
    const updatedChecklists = checklists.map(checklist => {
      if (checklist.id === checklistId) {
        return removeItemFromChecklist(checklist, itemId)
      }
      return checklist
    })
    
    onUpdateChecklists(updatedChecklists)
  }

  // Handler for toggling an item's completed status
  const handleToggleItem = (checklistId, itemId) => {
    const updatedChecklists = checklists.map(checklist => {
      if (checklist.id === checklistId) {
        return toggleItemInChecklist(checklist, itemId)
      }
      return checklist
    })
    
    onUpdateChecklists(updatedChecklists)
  }

  // Handler for removing a checklist
  const handleRemoveChecklist = (checklistId) => {
    const updatedChecklists = removeChecklistFromList(checklists, checklistId)
    onUpdateChecklists(updatedChecklists)
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
                key={checklist.id}
                checklist={checklist}
                onAddItem={(itemText) => handleAddItem(checklist.id, itemText)}
                onRemoveItem={(itemId) => handleRemoveItem(checklist.id, itemId)}
                onToggleItem={(itemId) => handleToggleItem(checklist.id, itemId)}
                onRemoveChecklist={handleRemoveChecklist}
                newItemText={newItemTexts[checklist.id] || ''}
                onNewItemTextChange={(text) => handleNewItemTextChange(checklist.id, text)}
                onItemKeyPress={(e) => handleItemKeyPress(e, checklist.id)}
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
  )
}

export default ChecklistDialog 