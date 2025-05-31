import { Card as MuiCard } from '@mui/material'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import GroupIcon from '@mui/icons-material/Group'
import CommentIcon from '@mui/icons-material/Comment'
import AttachmentIcon from '@mui/icons-material/Attachment'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import DeleteIcon from '@mui/icons-material/Delete'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import LinearProgress from '@mui/material/LinearProgress'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDispatch, useSelector } from 'react-redux'
import { updateCurrentActiveCard, showModalActiveCard } from '~/redux/activeCard/activeCardSlice'
import { useState } from 'react'
import ImageLightbox from '~/components/Modal/ImageLightbox/ImageLightbox'
import { updateCardDetailsAPI } from '~/apis'
import { toast } from 'react-toastify'
import { updateCardInBoard } from '~/redux/activeBoard/activeBoardSlice'
import LabelChip from '~/components/LabelChip/LabelChip'
import { selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { findLabelById } from '~/utils/labelHelpers'
import { 
  calculateTotalProgress, 
  shouldShowChecklistProgress, 
  formatProgressText, 
  getProgressColor 
} from '~/utils/checklistUtils'

function Card({ card }) {
  const dispatch = useDispatch()
  const [showLightbox, setShowLightbox] = useState(false)
  const activeBoard = useSelector(selectCurrentActiveBoard)
  const boardLabels = activeBoard?.labels || []

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
    data: { ...card }
  })
  const dndKitCardStyles = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    border: isDragging ? '1px solid #2ecc71' : undefined
  }

  const shouldShowCardActions = () => {
    return !!card?.memberIds?.length || !!card?.comments?.length || !!card?.attachments?.length || 
           (card?.checklists && shouldShowChecklistProgress(card.checklists))
  }

  // Tính toán progress cho checklists
  const getChecklistsProgress = () => {
    if (!card?.checklists || !Array.isArray(card.checklists) || card.checklists.length === 0) {
      return null
    }
    
    const progress = calculateTotalProgress(card.checklists)
    
    // Chỉ hiển thị nếu có ít nhất một item
    if (progress.total === 0) {
      return null
    }
    
    return progress
  }

  // Kiểm tra xem có nên hiển thị progress hay không
  const shouldDisplayChecklistProgress = () => {
    return card?.checklists && shouldShowChecklistProgress(card.checklists)
  }

  const setActiveCard = () => {
    dispatch(updateCurrentActiveCard(card))
    dispatch(showModalActiveCard())
  }

  const handleCoverClick = (e) => {
    e.stopPropagation()
    setShowLightbox(true)
  }

  const handleCloseLightbox = () => {
    setShowLightbox(false)
  }

  const handleDeleteCover = async (e) => {
    e.stopPropagation()
    
    try {
      const updatedCard = await updateCardDetailsAPI(card._id, { 
        deleteCardCover: true 
      })
      
      dispatch(updateCardInBoard(updatedCard))
      toast.success('Xóa ảnh cover thành công!', { position: 'bottom-right' })
    } catch (error) {
      toast.error('Xóa ảnh cover thất bại!', { position: 'bottom-right' })
    }
  }

  // Lấy thông tin label object từ ID
  const getCardLabels = () => {
    if (!card?.labelIds?.length || !boardLabels.length) return []
    
    // Giới hạn hiển thị tối đa 3 labels
    const displayLimit = 3
    const labelIdsToShow = card.labelIds.slice(0, displayLimit)
    
    return labelIdsToShow.map(labelId => {
      return findLabelById(labelId, boardLabels)
    }).filter(Boolean) // Loại bỏ các giá trị null nếu có
  }

  // Tính số labels còn lại không hiển thị
  const getRemainingLabelsCount = () => {
    if (!card?.labelIds?.length) return 0
    const displayLimit = 3
    return Math.max(0, card.labelIds.length - displayLimit)
  }

  const cardLabels = getCardLabels()
  const remainingLabelsCount = getRemainingLabelsCount()

  return (
    <>
      <MuiCard
        onClick={setActiveCard}
        ref={setNodeRef} style={dndKitCardStyles} {...attributes} {...listeners}
        sx={{
          cursor: 'pointer',
          boxShadow: '0 1px 1px rgba(0, 0, 0, 0.2)',
          overflow: 'unset',
          display: card?.FE_PlaceholderCard ? 'none' : 'block',
          border: '1px solid transparent',
          '&:hover': { borderColor: (theme) => theme.palette.primary.main }
        }}
      >
        {card?.cover && 
          <Box sx={{ 
            position: 'relative',
            '&:hover .delete-button': {
              opacity: 1
            }
          }}>
            {card?.coverType === 'image' && (
              <CardMedia 
                sx={{ 
                  height: 140, 
                  cursor: 'zoom-in',
                  '&:hover': { opacity: 0.9 }
                }} 
                image={card?.cover} 
                onClick={handleCoverClick}
              />
            )}
            
            {(card?.coverType === 'color' || card?.coverType === 'gradient') && (
              <Box 
                sx={{ 
                  height: 80, 
                  background: card?.cover,
                  borderTopLeftRadius: 'inherit',
                  borderTopRightRadius: 'inherit'
                }} 
              />
            )}
            
            <Tooltip title="Xóa ảnh cover">
              <IconButton
                className="delete-button"
                onClick={handleDeleteCover}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  color: 'white',
                  padding: '4px',
                  opacity: 0,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    transform: 'scale(1.1)'
                  },
                  '.MuiSvgIcon-root': {
                    fontSize: '18px'
                  }
                }}
                size="small"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        }
        <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
          {/* Labels */}
          {cardLabels.length > 0 && (
            <Stack 
              direction="row" 
              spacing={0.5} 
              sx={{ 
                flexWrap: 'wrap', 
                gap: '4px',
                mb: 1
              }}
            >
              {cardLabels.map(label => (
                <LabelChip
                  key={label.id}
                  label={label}
                  size="small"
                  sx={{ 
                    height: '8px',
                    maxWidth: '40px',
                    '& .MuiChip-label': { 
                      p: '0 4px',
                      lineHeight: 1.2,
                      fontSize: '8px'
                    }
                  }}
                />
              ))}
              
              {remainingLabelsCount > 0 && (
                <Chip
                  size="small"
                  label={`+${remainingLabelsCount}`}
                  sx={{ 
                    height: '8px',
                    '& .MuiChip-label': { 
                      p: '0 4px',
                      lineHeight: 1.2,
                      fontSize: '8px'
                    },
                    backgroundColor: (theme) => 
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'
                  }}
                />
              )}
            </Stack>
          )}
          
          {/* Checklist Progress */}
          {shouldDisplayChecklistProgress() && (
            <Box sx={{ mb: 1 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  mb: 0.5
                }}
              >
                <TaskAltOutlinedIcon 
                  fontSize="small" 
                  sx={{ 
                    fontSize: '14px',
                    color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#0079bf' 
                  }} 
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontSize: '11px',
                    color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' 
                  }}
                >
                  {formatProgressText(getChecklistsProgress().completed, getChecklistsProgress().total)}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={getChecklistsProgress().percentage}
                sx={{ 
                  height: 4, 
                  borderRadius: 2,
                  backgroundColor: theme => 
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getProgressColor(getChecklistsProgress().percentage)
                  }
                }} 
              />
            </Box>
          )}
          
          <Typography>{card?.title}</Typography>
        </CardContent>
        {shouldShowCardActions() &&
          <CardActions sx={{ p: '0 4px 8px 4px' }}>
            {!!card?.memberIds?.length &&
              <Button size="small" startIcon={<GroupIcon />}>{card?.memberIds?.length}</Button>
            }
            {!!card?.comments?.length &&
              <Button size="small" startIcon={<CommentIcon />}>{card?.comments?.length}</Button>
            }
            {!!card?.attachments?.length &&
              <Button size="small" startIcon={<AttachmentIcon />}>{card?.attachments?.length}</Button>
            }
            {shouldDisplayChecklistProgress() &&
              <Button 
                size="small" 
                startIcon={<TaskAltOutlinedIcon />} 
                sx={{
                  color: getProgressColor(getChecklistsProgress().percentage) + ' !important',
                  '& .MuiButton-startIcon': {
                    color: getProgressColor(getChecklistsProgress().percentage) + ' !important'
                  }
                }}
              >
                {formatProgressText(getChecklistsProgress().completed, getChecklistsProgress().total)}
              </Button>
            }
          </CardActions>
        }
      </MuiCard>

      {card?.cover && card?.coverType === 'image' && 
        <ImageLightbox 
          isOpen={showLightbox} 
          onClose={handleCloseLightbox} 
          imageSrc={card?.cover} 
        />
      }
    </>
  )
}

export default Card
