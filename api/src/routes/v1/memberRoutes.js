import express from 'express'
import { memberController } from '~/controllers/memberController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { rbacMiddleware } from '~/middlewares/rbacMiddleware'

const Router = express.Router()

// Get board members (any board member can see this)
Router.route('/:boardId')
  .get(authMiddleware.isAuthorized, rbacMiddleware.isMemberOfBoard, memberController.getBoardMembers)

// Remove member from board (admin only)
Router.route('/:boardId/:memberId')
  .delete(authMiddleware.isAuthorized, rbacMiddleware.canManageBoard, memberController.removeMember)

export const memberRoutes = Router
