import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  Divider,
  Tooltip
} from '@mui/material'
import { styled } from '@mui/material/styles'
import PropTypes from 'prop-types'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import { LABEL_COLORS } from '~/utils/labelConstants'
import { filterLabelsBySearchTerm, isLabelAssignedToCard, getContrastText } from '~/utils/labelHelpers'
import LabelPicker from './LabelPicker'

// Styled components
const DialogWrapper = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '8px',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 0 12px rgba(255, 255, 255, 0.15)' 
      : '0 0 12px rgba(0, 0, 0, 0.15)',
    backgroundColor: theme.palette.mode === 'dark' ? '#2f3542' : '#fff',
    overflow: 'hidden',
    width: '400px',
    maxWidth: '100%',
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

const LabelListItem = styled(ListItem)(({ theme, selected }) => ({
  borderRadius: '4px',
  marginBottom: '4px',
  padding: '8px 12px',
  cursor: 'pointer',
  backgroundColor: selected 
    ? theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.2)' : 'rgba(0, 121, 191, 0.1)'
    : 'transparent',
  '&:hover': {
    backgroundColor: selected 
      ? theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.3)' : 'rgba(0, 121, 191, 0.15)'
      : theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
  }
}))

const ColorCircle = styled(Box)(({ color }) => ({
  width: '32px',
  height: '32px',
  borderRadius: '4px',
  backgroundColor: color || '#ddd',
  marginRight: '12px',
  flexShrink: 0
}))

/**
 * LabelDialog component để quản lý labels của card
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Trạng thái hiển thị dialog
 * @param {Function} props.onClose - Callback khi đóng dialog
 * @param {Array} props.predefinedLabels - Danh sách labels có sẵn
 * @param {Array} props.cardLabelIds - Mảng IDs labels của card hiện tại
 * @param {Function} props.onToggleLabel - Callback khi toggle label
 * @param {Function} props.onCreateLabel - Callback khi tạo label mới
 * @param {Function} props.onDeleteLabel - Callback khi xóa label
 * @returns {JSX.Element} - LabelDialog component
 */
const LabelDialog = ({
  isOpen,
  onClose,
  predefinedLabels = [],
  cardLabelIds = [],
  onToggleLabel,
  onCreateLabel,
  onDeleteLabel
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [newLabelName, setNewLabelName] = useState('')
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS.GREEN)
  const [filteredLabels, setFilteredLabels] = useState(predefinedLabels)

  useEffect(() => {
    if (searchTerm) {
      setFilteredLabels(filterLabelsBySearchTerm(predefinedLabels, searchTerm))
    } else {
      setFilteredLabels(predefinedLabels)
    }
  }, [searchTerm, predefinedLabels])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleCreateLabel = () => {
    if (!newLabelName.trim()) {
      return // Không tạo label nếu tên rỗng
    }

    const newLabel = {
      name: newLabelName.trim(),
      color: selectedColor
    }

    onCreateLabel(newLabel)
    
    // Reset form
    setNewLabelName('')
    setSelectedColor(LABEL_COLORS.GREEN)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && newLabelName.trim()) {
      handleCreateLabel()
    }
  }

  return (
    <DialogWrapper open={isOpen} onClose={onClose}>
      <DialogHeader>
        <Typography variant="h6" component="div">
          Labels
        </Typography>
        <CloseButton onClick={onClose} aria-label="Đóng">
          <CloseIcon fontSize="small" />
        </CloseButton>
      </DialogHeader>

      <DialogContent sx={{ p: 2 }}>
        {/* Search input */}
        <TextField
          fullWidth
          placeholder="Tìm kiếm labels..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
        />

        {/* Labels list */}
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
          Labels
        </Typography>
        
        <List sx={{ mb: 2 }}>
          {filteredLabels.length > 0 ? (
            filteredLabels.map((label) => {
              const isSelected = isLabelAssignedToCard(label.id, cardLabelIds)
              const textColor = getContrastText(label.color)
              
              return (
                <LabelListItem
                  key={label.id}
                  selected={isSelected}
                  onClick={() => onToggleLabel(label.id)}
                >
                  <ColorCircle color={label.color} />
                  <ListItemText 
                    primary={label.name} 
                    sx={{ 
                      '& .MuiListItemText-primary': { 
                        fontWeight: isSelected ? 500 : 400 
                      } 
                    }}
                  />
                  {isSelected && (
                    <Box sx={{ 
                      ml: 1, 
                      width: 20, 
                      height: 20, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      borderRadius: '50%',
                      bgcolor: label.color,
                      color: textColor,
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      ✓
                    </Box>
                  )}
                  <Tooltip title="Xóa label này" placement="top">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation(); // Ngăn việc click vào label (toggle)
                        onDeleteLabel(label.id);
                      }}
                      sx={{ 
                        ml: 1,
                        opacity: 0.7,
                        '&:hover': {
                          opacity: 1,
                          backgroundColor: 'rgba(211, 47, 47, 0.1)'
                        }
                      }}
                    >
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </LabelListItem>
              )
            })
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              Không tìm thấy label nào
            </Typography>
          )}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Create new label */}
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
          Tạo label mới
        </Typography>
        
        <Box sx={{ display: 'flex', mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Tên label mới..."
            variant="outlined"
            size="small"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocalOfferOutlinedIcon 
                    fontSize="small" 
                    sx={{ color: selectedColor }}
                  />
                </InputAdornment>
              )
            }}
          />
          <Button
            variant="contained"
            color="primary"
            disabled={!newLabelName.trim()}
            onClick={handleCreateLabel}
            sx={{ ml: 1, minWidth: '40px', px: 1 }}
          >
            <AddIcon />
          </Button>
        </Box>

        {/* Color picker */}
        <LabelPicker
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} variant="outlined" sx={{ textTransform: 'none' }}>
          Đóng
        </Button>
      </DialogActions>
    </DialogWrapper>
  )
}

LabelDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  predefinedLabels: PropTypes.array,
  cardLabelIds: PropTypes.array,
  onToggleLabel: PropTypes.func.isRequired,
  onCreateLabel: PropTypes.func.isRequired,
  onDeleteLabel: PropTypes.func.isRequired
}

export default LabelDialog 