import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'

export const usePermissions = () => {
  const currentUser = useSelector(selectCurrentUser)
  const activeBoard = useSelector(selectCurrentActiveBoard)

  // Check if current user is admin of the active board
  const isAdmin = () => {
    if (!currentUser || !activeBoard) return false
    return activeBoard.ownerIds?.some(ownerId => ownerId === currentUser._id)
  }

  // Check if current user is member of the active board
  const isMember = () => {
    if (!currentUser || !activeBoard) return false
    return activeBoard.memberIds?.some(memberId => memberId === currentUser._id) || isAdmin()
  }

  // Permission checks for specific actions
  const canDeleteCards = () => isAdmin()
  const canDeleteBoard = () => isAdmin()
  const canDeleteColumns = () => isAdmin()
  const canSetDueDates = () => isAdmin()
  const canManageMembers = () => isAdmin()

  return {
    isAdmin: isAdmin(),
    isMember: isMember(),
    canDeleteCards: canDeleteCards(),
    canDeleteBoard: canDeleteBoard(),
    canDeleteColumns: canDeleteColumns(),
    canSetDueDates: canSetDueDates(),
    canManageMembers: canManageMembers()
  }
}
