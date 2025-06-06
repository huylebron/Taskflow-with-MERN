/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
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
  getCoverOptions
}
