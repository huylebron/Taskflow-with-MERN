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

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDispatch } from 'react-redux'
import { updateCurrentActiveCard, showModalActiveCard } from '~/redux/activeCard/activeCardSlice'
import { useState } from 'react'
import ImageLightbox from '~/components/Modal/ImageLightbox/ImageLightbox'
import { updateCardDetailsAPI } from '~/apis'
import { toast } from 'react-toastify'
import { updateCardInBoard } from '~/redux/activeBoard/activeBoardSlice'

function Card({ card }) {
  const dispatch = useDispatch()
  const [showLightbox, setShowLightbox] = useState(false)

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
    return !!card?.memberIds?.length || !!card?.comments?.length || !!card?.attachments?.length
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
