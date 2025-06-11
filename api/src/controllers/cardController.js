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

    console.log('🔄 Card update request:', {
      cardId,
      hasFile: !!cardCoverFile,
      fileInfo: cardCoverFile ? {
        fieldname: cardCoverFile.fieldname,
        originalname: cardCoverFile.originalname,
        mimetype: cardCoverFile.mimetype,
        size: cardCoverFile.size
      } : null,
      bodyKeys: Object.keys(req.body)
    })

    const updatedCard = await cardService.update(cardId, req.body, cardCoverFile, userInfo)

    res.status(StatusCodes.OK).json(updatedCard)
  } catch (error) {
    console.error('❌ Card update error:', error)
    next(error)
  }
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

// Cập nhật labelIds cho card
export const updateCardLabels = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { labelIds } = req.body;
    const result = await cardService.updateCardLabels(cardId, labelIds);
    res.status(200).json(result);
  } catch (error) { next(error); }
};

/**
 * Tạo checklist mới cho card
 */
const createChecklist = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { title } = req.body;
    
    if (!title) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Checklist title is required'
      });
    }
    
    const result = await cardService.createChecklist(cardId, title);
    res.status(StatusCodes.OK).json(result);
  } catch (error) { next(error); }
};

/**
 * Thêm item vào checklist
 */
const addChecklistItem = async (req, res, next) => {
  try {
    const { cardId, checklistId } = req.params;
    const { title } = req.body;
    
    if (!title) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Item title is required'
      });
    }
    
    const result = await cardService.addChecklistItem(cardId, checklistId, title);
    res.status(StatusCodes.OK).json(result);
  } catch (error) { next(error); }
};

/**
 * Cập nhật trạng thái hoàn thành của checklist item
 */
const updateChecklistItemStatus = async (req, res, next) => {
  try {
    const { cardId, checklistId, itemId } = req.params;
    const { isCompleted } = req.body;
    
    if (typeof isCompleted !== 'boolean') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'isCompleted must be a boolean value'
      });
    }
    
    const result = await cardService.updateChecklistItemStatus(cardId, checklistId, itemId, isCompleted);
    res.status(StatusCodes.OK).json(result);
  } catch (error) { next(error); }
};

export const cardController = {
  createNew,
  update,
  getCoverOptions,
  getCardsWithDueDate,
  updateDueDate,
  updateCardLabels,
  // Thêm các API mới để xử lý checklists
  createChecklist,
  addChecklistItem,
  updateChecklistItemStatus
}
