
import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'
import { CARD_COVER_COLORS, CARD_COVER_GRADIENTS } from '~/utils/constants'

const createNew = async (req, res, next) => {
  try {
    const createdCard = await cardService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdCard)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const cardCoverFile = req.file
    const userInfo = req.jwtDecoded
    const updatedCard = await cardService.update(cardId, req.body, cardCoverFile, userInfo)

    res.status(StatusCodes.OK).json(updatedCard)
  } catch (error) { next(error) }
}

/**
 * Get cards with due dates for calendar view
 * Supports filtering by boardId, startDate, endDate
 */
const getCardsWithDueDate = async (req, res, next) => {
  try {
    const { boardId, startDate, endDate } = req.query
    const cardsWithDueDate = await cardService.getCardsWithDueDate(boardId, startDate, endDate)

    res.status(StatusCodes.OK).json(cardsWithDueDate)
  } catch (error) { next(error) }
}

/**
 * Quick update card due date (for calendar drag-and-drop)
 */
const updateDueDate = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const { dueDate } = req.body

    if (!cardId || dueDate === undefined) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Card ID and due date are required'
      })
    }

    const updatedCard = await cardService.update(cardId, { dueDate })
    res.status(StatusCodes.OK).json(updatedCard)
  } catch (error) { next(error) }
}

const getCoverOptions = async (req, res, next) => {
  try {
    const coverOptions = {
      colors: CARD_COVER_COLORS,
      gradients: CARD_COVER_GRADIENTS
    }

    res.status(StatusCodes.OK).json(coverOptions)
  } catch (error) { next(error) }
}

export const cardController = {
  createNew,
  update,
  getCoverOptions,
  getCardsWithDueDate,
  updateDueDate
}
