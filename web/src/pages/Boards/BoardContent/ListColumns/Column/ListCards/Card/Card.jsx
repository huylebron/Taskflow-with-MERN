import { Card as MuiCard } from '@mui/material'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import GroupIcon from '@mui/icons-material/Group'
import CommentIcon from '@mui/icons-material/Comment'
import AttachmentIcon from '@mui/icons-material/Attachment'
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined'
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
import { useState, useEffect } from 'react'
import ImageLightbox from '~/components/Modal/ImageLightbox/ImageLightbox'

import { updateCardDetailsAPI, updateCardCompletedStatusAPI, deleteCardAPI } from '~/apis'

import { toast } from 'react-toastify'
import { updateCardInBoard, removeCardFromBoard, fetchBoardDetailsAPI } from '~/redux/activeBoard/activeBoardSlice'
import LabelChip from '~/components/LabelChip/LabelChip'
import { selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { findLabelById } from '~/utils/labelHelpers'
import {
  calculateTotalProgress,
  shouldShowChecklistProgress,
  formatProgressText,
  getProgressColor
} from '~/utils/checklistUtils'
import {
  getDueDateStatus,
  formatDueDateDisplay,
  getDueDateChipStyles,
  getUrgencyText,
  DUE_DATE_STATUS
} from '~/utils/dueDateConstants'
import ConfirmationDialog from '~/components/ConfirmationDialog/ConfirmationDialog'
import PermissionWrapper from '~/components/PermissionWrapper/PermissionWrapper'
import { socketIoInstance } from '~/socketClient'
import { selectCurrentUser } from '~/redux/user/userSlice'

function Card({ card, shouldShake = false }) {
  const dispatch = useDispatch()
  const [showLightbox, setShowLightbox] = useState(false)
  const activeBoard = useSelector(selectCurrentActiveBoard)
  const boardLabels = activeBoard?.labels || []
  const currentUser = useSelector(selectCurrentUser)

  const [hovered, setHovered] = useState(false)
  const [loadingComplete, setLoadingComplete] = useState(false)

  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  // Thêm state cho bell shake animation
  const [isShaking, setIsShaking] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
    data: { ...card }
  })

  // Effect để handle shake animation từ prop
  useEffect(() => {
    if (shouldShake && !isDragging) {
      setIsShaking(true)
      const timer = setTimeout(() => {
        setIsShaking(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [shouldShake, isDragging])
  const dndKitCardStyles = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0 : undefined,
    visibility: isDragging ? 'hidden' : 'visible',
    border: isDragging ? '1px dashed transparent' : undefined,
    boxShadow: isDragging ? 'none !important' : undefined,
    WebkitBoxShadow: isDragging ? 'none !important' : undefined,
    MozBoxShadow: isDragging ? 'none !important' : undefined,
    filter: isDragging ? 'none !important' : undefined
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

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    setShowConfirmDelete(true)
  }

  const handleConfirmDelete = async () => {
    setShowConfirmDelete(false)
    // Optimistic removal
    dispatch(removeCardFromBoard({ cardId: card._id, columnId: card.columnId }))
    try {
      setIsDeleting(true)
      await deleteCardAPI(card._id)
      toast.success('Card deleted successfully!', { position: 'bottom-right' })
    } catch (error) {
      // Revert optimistic update on failure
      dispatch(fetchBoardDetailsAPI(/* boardId required */))
      toast.error('Xóa thẻ thất bại! Đang khôi phục.', { position: 'bottom-right' })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setShowConfirmDelete(false)
  }

  // Lấy thông tin label object từ ID
  const getCardLabels = () => {
    if (!card?.labelIds?.length || !boardLabels.length) return []

    // Tăng giới hạn hiển thị lên 5 labels
    const displayLimit = 5
    const labelIdsToShow = card.labelIds.slice(0, displayLimit)
    return labelIdsToShow.map(labelId => {
      return findLabelById(labelId, boardLabels)
    }).filter(Boolean) // Loại bỏ các giá trị null nếu có
  }

  // Tính số labels còn lại không hiển thị
  const getRemainingLabelsCount = () => {
    if (!card?.labelIds?.length) return 0
    const displayLimit = 5
    return Math.max(0, card.labelIds.length - displayLimit)
  }

  const cardLabels = getCardLabels()
  const remainingLabelsCount = getRemainingLabelsCount()

  // Get due date status for current card
  const dueDateStatus = getDueDateStatus(card?.dueDate)
  const isOverdue = dueDateStatus === DUE_DATE_STATUS.OVERDUE
  const isDueSoon = dueDateStatus === DUE_DATE_STATUS.DUE_SOON

  const handleCardCompletedChange = async (e) => {
    e.stopPropagation()
    setLoadingComplete(true)
    
    // Trigger star burst animation
    const checkboxContainer = e.currentTarget.closest('.checkbox-container') || e.currentTarget
    if (checkboxContainer) {
      checkboxContainer.classList.add('star-burst')
      setTimeout(() => {
        checkboxContainer.classList.remove('star-burst')
      }, 800)
    }
    
    try {
      const updatedCard = await updateCardCompletedStatusAPI(card._id, !card.isCardCompleted)
      dispatch(updateCardInBoard(updatedCard))

      // Emit Universal Notifications event after successful update
      if (socketIoInstance && activeBoard?._id && currentUser?._id) {
        socketIoInstance.emit('FE_CARD_COMPLETED', {
          boardId: activeBoard._id,
          cardId: card._id,
          columnId: card.columnId,
          cardTitle: card?.title,
          isCardCompleted: updatedCard.isCardCompleted,
          userInfo: {
            _id: currentUser._id,
            displayName: currentUser.displayName || currentUser.username || 'Unknown User',
            username: currentUser.username || 'unknown',
            avatar: currentUser.avatar || null
          },
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      toast.error('Cập nhật trạng thái hoàn thành thất bại!', { position: 'bottom-right' })
    } finally {
      setLoadingComplete(false)
    }
  }

  return (
    <>
      <MuiCard
        onClick={setActiveCard}
        ref={setNodeRef} style={dndKitCardStyles} {...attributes} {...listeners}
        data-dragging={isDragging}
        className={`
          card-border-highlight
          due-date-indicator 
          ${isOverdue ? 'overdue' : isDueSoon ? 'due-soon' : ''}
          ${isShaking ? 'drag-shake-card' : ''}
          ${isDragging ? 'drag-active-card' : ''}
        `.trim()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          cursor: 'pointer',
          boxShadow: isDragging ? 'none !important' : isOverdue
            ? '0 2px 8px rgba(211, 47, 47, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)'
            : isDueSoon
              ? '0 2px 8px rgba(245, 124, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.2)'
              : '0 1px 1px rgba(0, 0, 0, 0.2)',
          overflow: 'unset',
          display: card?.FE_PlaceholderCard ? 'none' : 'block',
          border: isOverdue
            ? '2px solid #d32f2f'
            : isDueSoon
              ? '1px solid #f57c00'
              : '1px solid transparent',
          borderRadius: '8px',
          position: 'relative',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            borderColor: (theme) => theme.palette.primary.main,
            transform: isDragging ? 'none' : 'translateY(-2px)',
            boxShadow: isDragging ? 'none !important' : isOverdue
              ? '0 4px 16px rgba(211, 47, 47, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)'
              : isDueSoon
                ? '0 4px 16px rgba(245, 124, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)'
                : '0 4px 16px rgba(0, 0, 0, 0.15)'
          },
          // Add urgency indicator for overdue cards
          ...(isOverdue && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              right: '-2px',
              bottom: '-2px',
              background: 'linear-gradient(45deg, rgba(211, 47, 47, 0.1), rgba(183, 28, 28, 0.1))',
              borderRadius: 'inherit',
              zIndex: -1,
              animation: 'pulse 2s infinite'
            }
          })
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
        <CardContent sx={{ p: 1.5, pl: 1.5, '&:last-child': { p: 1.5, pl: 1.5 } }}>
          {/* Labels */}
          {cardLabels.length > 0 && (
            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                flexWrap: 'wrap',
                gap: '6px',
                mb: 1.5
              }}
            >
              {cardLabels.map(label => (
                <LabelChip
                  key={label.id}
                  label={label}
                  size="small"
                  sx={{
                    '& .MuiChip-label': {
                      maxWidth: '60px'
                    }
                  }}
                />
              ))}

              {remainingLabelsCount > 0 && (
                <Chip
                  size="small"
                  label={`+${remainingLabelsCount}`}
                  sx={{
                    height: '20px',
                    minWidth: '32px',
                    borderRadius: '3px',
                    fontSize: '12px',
                    fontWeight: 600,
                    '& .MuiChip-label': {
                      padding: '0 6px',
                      lineHeight: 1.2
                    },
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                    color: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                />
              )}
            </Stack>
          )}

          {/* Enhanced Due Date Badge */}
          {card?.dueDate && (
            <Box sx={{ mb: 1 }}>
              <Tooltip title={getUrgencyText(dueDateStatus)}>
                <Chip
                  icon={<WatchLaterOutlinedIcon />}
                  label={formatDueDateDisplay(card.dueDate)}
                  size="small"
                  sx={getDueDateChipStyles(dueDateStatus)}
                  className={`due-date-chip ${dueDateStatus}`}
                />
              </Tooltip>
              {/* Urgency indicator for overdue items */}
              {isOverdue && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: '#d32f2f',
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    animation: 'pulse 1.5s infinite'
                  }}
                />
              )}
            </Box>
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

          {/* Title với checkbox - Enhanced Trello-like interaction */}
          <Box
            sx={{
              position: 'relative',
              minHeight: '1.4em',
              overflow: 'hidden'
            }}
          >
            {/* Checkbox hoàn thành với animation tỏa sáng */}
            <Box 
              sx={{ 
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                opacity: (card.isCardCompleted || hovered) ? 1 : 0,
                visibility: (card.isCardCompleted || hovered) ? 'visible' : 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 2
              }}
            >
              <Tooltip title={card.isCardCompleted ? 'Bỏ đánh dấu hoàn thành' : 'Đánh dấu là hoàn thành'}>
                <Box
                  sx={{
                    position: 'relative',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: card.isCardCompleted 
                        ? 'radial-gradient(circle, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.1) 40%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(25, 118, 210, 0.15) 0%, rgba(25, 118, 210, 0.08) 40%, transparent 70%)',
                      opacity: 0,
                      transition: 'all 0.3s ease',
                      pointerEvents: 'none',
                      zIndex: 0
                    },
                    '&:hover::before': {
                      opacity: 1,
                      transform: 'translate(-50%, -50%) scale(1.2)'
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '0',
                      height: '0',
                      borderRadius: '50%',
                      background: card.isCardCompleted 
                        ? 'radial-gradient(circle, rgba(255, 193, 7, 0.8) 0%, rgba(255, 152, 0, 0.6) 50%, transparent 100%)'
                        : 'radial-gradient(circle, rgba(25, 118, 210, 0.6) 0%, rgba(33, 150, 243, 0.4) 50%, transparent 100%)',
                      transform: 'translate(-50%, -50%)',
                      opacity: 0,
                      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      pointerEvents: 'none',
                      zIndex: 1
                    },
                    '&.star-burst::after': {
                      width: '100px',
                      height: '100px',
                      opacity: 1,
                      animation: 'starBurst 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                    },
                    '@keyframes starBurst': {
                      '0%': {
                        width: '0',
                        height: '0',
                        opacity: 1,
                        transform: 'translate(-50%, -50%) rotate(0deg)'
                      },
                      '30%': {
                        width: '60px',
                        height: '60px',
                        opacity: 0.8,
                        transform: 'translate(-50%, -50%) rotate(120deg)'
                      },
                      '60%': {
                        width: '90px',
                        height: '90px',
                        opacity: 0.4,
                        transform: 'translate(-50%, -50%) rotate(240deg)'
                      },
                      '100%': {
                        width: '120px',
                        height: '120px',
                        opacity: 0,
                        transform: 'translate(-50%, -50%) rotate(360deg)'
                      }
                    }
                  }}
                  onClick={handleCardCompletedChange}
                  className="checkbox-container"
                >
                  {/* Custom Circular Checkbox */}
                  <Box
                    sx={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: card.isCardCompleted ? 'none' : '2px solid rgba(25, 118, 210, 0.6)',
                      backgroundColor: card.isCardCompleted ? '#4caf50' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      zIndex: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'scale(1.15)',
                        borderColor: card.isCardCompleted ? '#4caf50' : 'rgba(25, 118, 210, 0.8)',
                        boxShadow: card.isCardCompleted 
                          ? '0 0 0 4px rgba(76, 175, 80, 0.2), 0 0 12px rgba(76, 175, 80, 0.4)'
                          : '0 0 0 4px rgba(25, 118, 210, 0.15), 0 0 12px rgba(25, 118, 210, 0.3)'
                      }
                    }}
                  >
                    {card.isCardCompleted && (
                      <Box
                        sx={{
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          animation: 'checkMarkPop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                          '@keyframes checkMarkPop': {
                            '0%': {
                              transform: 'scale(0) rotate(-45deg)',
                              opacity: 0
                            },
                            '50%': {
                              transform: 'scale(1.3) rotate(-22.5deg)',
                              opacity: 0.8
                            },
                            '100%': {
                              transform: 'scale(1) rotate(0deg)',
                              opacity: 1
                            }
                          }
                        }}
                      >
                        ✓
                      </Box>
                    )}
                  </Box>
                </Box>
              </Tooltip>
            </Box>

            {/* Title với animation dịch chuyển */}
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                lineHeight: 1.4,
                color: 'text.primary',
                wordBreak: 'break-word',
                hyphens: 'auto',
                paddingLeft: (card.isCardCompleted || hovered) ? '32px' : '0px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textDecoration: card.isCardCompleted ? 'line-through' : 'none',
                opacity: card.isCardCompleted ? 0.7 : 1,
                position: 'relative',
                zIndex: 1
              }}
            >
              {card?.title}
            </Typography>
          </Box>
        </CardContent>
        {shouldShowCardActions() &&
          <CardActions sx={{ p: '0 4px 8px 4px' }}>
            {!!card?.memberIds?.length &&
              <Button
                size="small"
                startIcon={<GroupIcon />}
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: 'text.secondary',
                  minWidth: 'auto',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.04)',
                    color: 'primary.main'
                  },
                  '& .MuiButton-startIcon': {
                    marginRight: '4px',
                    '& svg': { fontSize: '14px' }
                  }
                }}
              >
                {card?.memberIds?.length}
              </Button>
            }
            {!!card?.comments?.length &&
              <Button
                size="small"
                startIcon={<CommentIcon />}
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: 'text.secondary',
                  minWidth: 'auto',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.04)',
                    color: 'primary.main'
                  },
                  '& .MuiButton-startIcon': {
                    marginRight: '4px',
                    '& svg': { fontSize: '14px' }
                  }
                }}
              >
                {card?.comments?.length}
              </Button>
            }
            {!!card?.attachments?.length &&
              <Button
                size="small"
                startIcon={<AttachmentIcon />}
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: 'text.secondary',
                  minWidth: 'auto',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.04)',
                    color: 'primary.main'
                  },
                  '& .MuiButton-startIcon': {
                    marginRight: '4px',
                    '& svg': { fontSize: '14px' }
                  }
                }}
              >
                {card?.attachments?.length}
              </Button>
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
            <PermissionWrapper adminOnly={true}>
              <Tooltip title="Delete card">
                <IconButton
                  size="small"
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </PermissionWrapper>
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

      {/* Confirmation Dialog for deletion */}
      <ConfirmationDialog
        open={showConfirmDelete}
        title="Delete Card"
        items={[
          'Checklists',
          'Cover image',
          'Attachments',
          'Comments',
          'Description',
          'Due date'
        ]}
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  )
}

export default Card
