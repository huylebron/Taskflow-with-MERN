import { StatusCodes } from 'http-status-codes'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'

const removeMember = async (req, res, next) => {
  try {
    const { boardId, memberId } = req.params
    
    // Remove member from board
    const updatedBoard = await boardModel.removeMemberFromBoard(boardId, memberId)
    
    if (!updatedBoard) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }

    res.status(StatusCodes.OK).json({
      message: 'Member removed successfully',
      board: updatedBoard
    })
  } catch (error) {
    next(error)
  }
}

const getBoardMembers = async (req, res, next) => {
  try {
    const { boardId } = req.params
    const userId = req.jwtDecoded._id
    
    // Get board with members populated
    const board = await boardModel.getDetails(userId, boardId)
    
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }

    res.status(StatusCodes.OK).json({
      owners: board.owners,
      members: board.members
    })
  } catch (error) {
    next(error)
  }
}

export const memberController = {
  removeMember,
  getBoardMembers
}
