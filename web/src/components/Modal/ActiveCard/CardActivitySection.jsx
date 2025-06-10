import { useState } from 'react'
import moment from 'moment'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import SendIcon from '@mui/icons-material/Send'
import CancelIcon from '@mui/icons-material/Cancel'
import { useColorScheme } from '@mui/material/styles'
import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize from 'rehype-sanitize'

import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'

function CardActivitySection({ cardComments=[], onAddCardComment }) {
  const currentUser = useSelector(selectCurrentUser)
  const { mode } = useColorScheme()

  // State for new comment input
  const [newComment, setNewComment] = useState('')
  const [isAddingComment, setIsAddingComment] = useState(false)

  // Handle adding new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return

    const commentToAdd = {
      userAvatar: currentUser?.avatar,
      userDisplayName: currentUser?.displayName,
      content: newComment.trim()
    }

    try {
      await onAddCardComment(commentToAdd)
      setNewComment('')
      setIsAddingComment(false)
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (event) => {
    // Ctrl+Enter or Cmd+Enter to submit
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault()
      handleAddComment()
    }
    // Escape to cancel
    if (event.key === 'Escape') {
      setIsAddingComment(false)
      setNewComment('')
    }
  }

  const handleCancelComment = () => {
    setIsAddingComment(false)
    setNewComment('')
  }

  return (
    <Box sx={{ mt: 2 }}>
      {/* Add Comment Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Avatar
            sx={{ width: 36, height: 36, cursor: 'pointer', mt: 0.5 }}
            alt={currentUser?.displayName}
            src={currentUser?.avatar}
          />
          <Box sx={{ flex: 1 }}>
            {!isAddingComment ? (
              <Box
                onClick={() => setIsAddingComment(true)}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: (theme) => theme.palette.mode === 'dark' ? '#555' : '#ddd',
                  borderRadius: '8px',
                  cursor: 'text',
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#2a2a2a' : '#fafafa',
                  '&:hover': {
                    borderColor: (theme) => theme.palette.mode === 'dark' ? '#777' : '#bbb',
                  },
                  transition: 'border-color 0.2s ease'
                }}
              >
                <Typography 
                  sx={{ 
                    color: (theme) => theme.palette.mode === 'dark' ? '#aaa' : '#666',
                    fontSize: '14px'
                  }}
                >
                  Write a comment... (supports Markdown)
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box data-color-mode={mode}>
                  <MDEditor
                    value={newComment}
                    onChange={setNewComment}
                    previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
                    height={150}
                    preview="edit"
                    onKeyDown={handleKeyDown}
                    data-color-mode={mode}
                    toolbarHeight={35}
                    style={{
                      backgroundColor: 'transparent'
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    onClick={handleCancelComment}
                    startIcon={<CancelIcon />}
                    sx={{ minWidth: 'auto' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    startIcon={<SendIcon />}
                    className="interceptor-loading"
                  >
                    Comment
                  </Button>
                </Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: (theme) => theme.palette.mode === 'dark' ? '#aaa' : '#666',
                    fontSize: '11px',
                    textAlign: 'right'
                  }}
                >
                  Tip: Use Ctrl+Enter to submit quickly
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Comments List */}
      {cardComments.length === 0 ? (
        <Typography 
          sx={{ 
            pl: '45px', 
            fontSize: '14px', 
            fontWeight: '500', 
            color: (theme) => theme.palette.mode === 'dark' ? '#aaa' : '#b1b1b1',
            fontStyle: 'italic'
          }}
        >
          No comments yet. Be the first to add one!
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {cardComments.map((comment, index) => (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                gap: 1, 
                width: '100%',
                '&:hover .comment-actions': {
                  opacity: 1
                }
              }}
            >
              <Tooltip title={comment.userDisplayName}>
                <Avatar
                  sx={{ width: 36, height: 36, cursor: 'pointer', flexShrink: 0 }}
                  alt={comment.userDisplayName}
                  src={comment.userAvatar}
                />
              </Tooltip>
              
              <Box sx={{ width: '100%', minWidth: 0 }}>
                {/* Comment Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#172b4d'
                    }}
                  >
                    {comment.userDisplayName}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '11px',
                      color: (theme) => theme.palette.mode === 'dark' ? '#aaa' : '#6b778c'
                    }}
                  >
                    {moment(comment.commentedAt).format('MMM D [at] h:mm A')}
                  </Typography>
                </Box>

                {/* Comment Content with Markdown Support */}
                <Box sx={{
                  position: 'relative',
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#282c34' : '#f4f5f7',
                  border: '1px solid',
                  borderColor: (theme) => theme.palette.mode === 'dark' ? '#444' : '#dfe1e6',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <Box 
                    data-color-mode={mode}
                    sx={{
                      '& .w-md-editor-preview': {
                        backgroundColor: 'transparent !important',
                        padding: '12px 16px !important'
                      },
                      '& .w-md-editor-preview p:last-child': {
                        marginBottom: '0 !important'
                      },
                      '& .w-md-editor-preview p:first-of-type': {
                        marginTop: '0 !important'
                      },
                      '& .w-md-editor-preview pre': {
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f8f8',
                        border: '1px solid',
                        borderColor: (theme) => theme.palette.mode === 'dark' ? '#555' : '#e1e4e8',
                        borderRadius: '4px'
                      },
                      '& .w-md-editor-preview code': {
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#444' : '#f1f2f4',
                        padding: '2px 4px',
                        borderRadius: '3px',
                        fontSize: '85%'
                      },
                      '& .w-md-editor-preview blockquote': {
                        borderLeft: '4px solid',
                        borderLeftColor: (theme) => theme.palette.mode === 'dark' ? '#555' : '#dfe2e5',
                        paddingLeft: '16px',
                        color: (theme) => theme.palette.mode === 'dark' ? '#aaa' : '#6a737d'
                      }
                    }}
                  >
                    <MDEditor.Markdown 
                      source={comment.content || ''}
                      rehypePlugins={[[rehypeSanitize]]}
                      style={{
                        backgroundColor: 'transparent',
                        color: mode === 'dark' ? '#fff' : '#172b4d'
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default CardActivitySection
