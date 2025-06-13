import { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, Button, Chip } from '@mui/material'
import { usePermissions } from '~/customHooks/usePermissions'
import { useSelector } from 'react-redux'
import { selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'
import { toast } from 'react-toastify'

const MemberManagement = ({ open, onClose, boardId }) => {
  const [members, setMembers] = useState([])
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(false)
  const { canManageMembers } = usePermissions()
  const activeBoard = useSelector(selectCurrentActiveBoard)

  // Only show if user has permission
  if (!canManageMembers) {
    return null
  }

  const fetchMembers = async () => {
    if (!boardId) return

    try {
      setLoading(true)
      const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/members/${boardId}`)
      setMembers(response.data.members || [])
      setOwners(response.data.owners || [])
    } catch (error) {
      console.error('Error fetching members:', error)
      toast.error('Failed to fetch board members', { position: 'bottom-right' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && boardId) {
      fetchMembers()
    }
  }, [open, boardId])

  const handleRemoveMember = async (memberId) => {
    if (!boardId || !memberId) return

    try {
      setLoading(true)
      await authorizedAxiosInstance.delete(`${API_ROOT}/v1/members/${boardId}/${memberId}`)
      toast.success('Member removed successfully', { position: 'bottom-right' })
      fetchMembers() // Refresh the list
    } catch (error) {
      console.error('Error removing member:', error)
      toast.error('Failed to remove member', { position: 'bottom-right' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Board Members</DialogTitle>
      <DialogContent>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <List>
            {owners.map(owner => (
              <ListItem key={owner._id}>
                <ListItemText
                  primary={owner.displayName}
                  secondary={owner.email}
                />
                <Chip label="Admin" color="primary" size="small" />
              </ListItem>
            ))}
            {members.map(member => (
              <ListItem key={member._id}>
                <ListItemText
                  primary={member.displayName}
                  secondary={member.email}
                />
                <Chip label="Member" color="default" size="small" />
                <Button
                  color="error"
                  onClick={() => handleRemoveMember(member._id)}
                  disabled={loading}
                  sx={{ ml: 1 }}
                  size="small"
                >
                  Remove
                </Button>
              </ListItem>
            ))}
            {owners.length === 0 && members.length === 0 && !loading && (
              <ListItem>
                <ListItemText primary="No members found" />
              </ListItem>
            )}
          </List>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default MemberManagement
