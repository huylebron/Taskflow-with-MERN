import { usePermissions } from '~/customHooks/usePermissions'

const PermissionWrapper = ({
  children,
  adminOnly = false,
  memberOnly = false,
  fallback = null
}) => {
  const { isAdmin, isMember } = usePermissions()

  // If admin only and user is not admin, don't render
  if (adminOnly && !isAdmin) {
    return fallback
  }

  // If member only and user is not member, don't render
  if (memberOnly && !isMember) {
    return fallback
  }

  // Otherwise render the children
  return children
}

export default PermissionWrapper
