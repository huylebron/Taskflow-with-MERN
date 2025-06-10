/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { attachmentModel } from '~/models/attachmentModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

// Extract the collection name from cardModel to avoid duplication
const CARD_COLLECTION_NAME = 'cards'

// Import INVALID_UPDATE_FIELDS from the model
const INVALID_UPDATE_FIELDS = ['_id', 'boardId', 'createdAt']

const createNew = async (reqBody) => {
  try {
    // Process dueDate field if present
    if (reqBody.dueDate) {
      try {
        const dateObj = new Date(reqBody.dueDate)
        if (!isNaN(dateObj.getTime())) {
          reqBody.dueDate = dateObj
        } else {
          delete reqBody.dueDate // Invalid date format, remove it
        }
      } catch (error) {
        delete reqBody.dueDate // Error parsing date, remove it
      }
    }

    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newCard = {
      ...reqBody
    }
    const createdCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if (getNewCard) {
      // Cập nhật mảng cardOrderIds trong collection columns
      await columnModel.pushCardOrderIds(getNewCard)
    }

    return getNewCard
  } catch (error) { throw error }
}

const update = async (cardId, updateData, cardCoverFile, userInfo) => {
  try {
    // Add updatedAt to mark when card was last modified
    updateData.updatedAt = Date.now()
    
    // Lọc những field mà chúng ta không cho phép cập nhật linh tinh
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    // Process dueDate field if present (can be null to remove due date)
    if (updateData.hasOwnProperty('dueDate')) {
      // If dueDate is a valid date string, convert to Date object
      if (updateData.dueDate) {
        try {
          const dateObj = new Date(updateData.dueDate)
          if (!isNaN(dateObj.getTime())) {
            updateData.dueDate = dateObj
          } else {
            delete updateData.dueDate // Invalid date format, remove it
          }
        } catch (error) {
          delete updateData.dueDate // Error parsing date, remove it
        }
      }
      // If dueDate is null, keep it as null to remove due date
    }

    // Đối với những dữ liệu liên quan ObjectId, biến đổi ở đây
    if (updateData.columnId) updateData.columnId = new ObjectId(updateData.columnId)

    let updatedCard = {}

    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      updatedCard = await cardModel.update(cardId, { 
        cover: uploadResult.secure_url,
        coverType: 'image'
      })
    } else if (updateData.deleteCardCover) {
      // Xóa ảnh cover bằng cách set cover = null
      const currentCard = await cardModel.findOneById(cardId)
      
      // Nếu có publicId của ảnh cover trên Cloudinary, thì xóa ảnh đó
      if (currentCard && currentCard.cover && updateData.cloudinaryPublicId) {
        try {
          // Xóa ảnh trên Cloudinary (optional - có thể bỏ qua nếu không muốn xóa)
          await CloudinaryProvider.deleteResource(updateData.cloudinaryPublicId)
        } catch (error) {
          console.error('Error deleting Cloudinary resource:', error)
          // Tiếp tục xử lý ngay cả khi xóa ảnh trên Cloudinary thất bại
        }
      }
      
      updatedCard = await cardModel.update(cardId, { 
        cover: null,
        coverType: null
      })
    } else if (updateData.coverType === 'color' || updateData.coverType === 'gradient') {
      // Xử lý trường hợp cập nhật cover là màu hoặc gradient
      if (!updateData.cover) {
        throw new Error('Cover value is required for color or gradient type')
      }
      
      updatedCard = await cardModel.update(cardId, { 
        cover: updateData.cover,
        coverType: updateData.coverType
      })
    } else if (updateData.commentToAdd) {
      // Tạo dữ liệu comment để thêm vào Database, cần bổ sung thêm những field cần thiết
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email
      }
      updatedCard = await cardModel.unshiftNewComment(cardId, commentData)
    } else if (updateData.incomingMemberInfo) {
      // Trường hợp ADD hoặc REMOVE thành viên ra khỏi Card
      updatedCard = await cardModel.updateMembers(cardId, updateData.incomingMemberInfo)
    } else if (updateData.deleteAllAttachments) {
      // ⚠️ CẨN THẬN: Trường hợp xóa tất cả attachments của card
      const attachments = await attachmentModel.findByCardId(cardId)
      
      // Xóa từng attachment và file trên Cloudinary
      for (const attachment of attachments) {
        try {
          if (attachment.cloudinaryPublicId) {
            await CloudinaryProvider.deleteResource(attachment.cloudinaryPublicId)
          }
          await attachmentModel.permanentlyDeleteOne(attachment._id.toString())
        } catch (error) {
          console.error(`Failed to delete attachment ${attachment._id}:`, error)
        }
      }
      
      // Reset attachmentIds và attachmentCount
      updatedCard = await cardModel.update(cardId, { 
        attachmentIds: [], 
        attachmentCount: 0 
      })
    } else {
      // Các trường hợp update chung như title, description
      updatedCard = await cardModel.update(cardId, updateData)
    }


    return updatedCard
  } catch (error) { throw error }
}

/**
 * ⚠️ CẨN THẬN: Xóa một card và tất cả attachments liên quan (cascade delete)
 * @param {string} cardId - Card ID
 * @returns {Promise<Object>} - Delete result
 */
const deleteCardAndAttachments = async (cardId) => {
  try {
    // Lấy thông tin card trước khi xóa
    const existingCard = await cardModel.findOneById(cardId)
    if (!existingCard) {
      throw new Error('Card not found.')
    }

    // 🚨 CRITICAL: Xóa tất cả attachments của card trước
    const attachments = await attachmentModel.findByCardId(cardId)
    
    // Xóa từng attachment và file trên Cloudinary
    const deletionResults = {
      totalAttachments: attachments.length,
      deletedAttachments: 0,
      failedAttachments: 0,
      errors: []
    }

    for (const attachment of attachments) {
      try {
        // Xóa file trên Cloudinary
        if (attachment.cloudinaryPublicId) {
          await CloudinaryProvider.deleteResource(attachment.cloudinaryPublicId)
        }
        
        // Hard delete attachment khỏi database
        await attachmentModel.permanentlyDeleteOne(attachment._id.toString())
        
        deletionResults.deletedAttachments++
      } catch (error) {
        console.error(`Failed to delete attachment ${attachment._id}:`, error)
        deletionResults.failedAttachments++
        deletionResults.errors.push({
          attachmentId: attachment._id,
          error: error.message
        })
      }
    }

    // Sau khi xóa attachments, xóa card
    const deletedCard = await cardModel.update(cardId, { _destroy: true })

    return {
      message: 'Card and attachments deleted successfully.',
      cardId: cardId,
      attachmentsDeletion: deletionResults,
      deletedCard
    }

  } catch (error) {
    console.error('Delete card and attachments error:', error)
    throw error
  }
}

/**
 * Lấy card với attachments đầy đủ (populate attachments)
 * @param {string} cardId - Card ID
 * @returns {Promise<Object>} - Card with populated attachments
 */
const getCardWithAttachments = async (cardId) => {
  try {
    const card = await cardModel.findOneById(cardId)
    if (!card) {
      throw new Error('Card not found.')
    }

    // Lấy danh sách attachments của card
    const attachments = await attachmentModel.findByCardId(cardId)
    
    // Kết hợp card với attachments
    return {
      ...card,
      attachments: attachments || []
    }

  } catch (error) {
    console.error('Get card with attachments error:', error)
    throw error
  }
}

/**
 * Get cards with due dates for calendar view
 * Supports filtering by boardId, startDate, endDate
 * @param {string} boardId - Optional board ID to filter cards
 * @param {string} startDate - Optional start date for filtering (ISO string)
 * @param {string} endDate - Optional end date for filtering (ISO string)
 * @returns {Promise<Array>} - Array of cards with due dates
 */
const getCardsWithDueDate = async (boardId, startDate, endDate) => {
  try {
    const query = { 
      _destroy: false,
      dueDate: { $ne: null } // Only get cards with due dates
    }

    // Add boardId filter if provided
    if (boardId) {
      query.boardId = new ObjectId(boardId)
    }

    // Add date range filter if both startDate and endDate are provided
    if (startDate && endDate) {
      query.dueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    } else if (startDate) {
      // Only filter by start date
      query.dueDate = {
        $gte: new Date(startDate)
      }
    } else if (endDate) {
      // Only filter by end date
      query.dueDate = {
        $lte: new Date(endDate)
      }
    }

    // Get cards with due dates
    const cards = await GET_DB().collection(CARD_COLLECTION_NAME)
      .find(query)
      .sort({ dueDate: 1 }) // Sort by due date ascending
      .toArray()
    
    // Populate column information for each card
    // This is important for calendar display to show which column/status the card is in
    const cardsWithColumnInfo = await Promise.all(cards.map(async (card) => {
      try {
        const column = await GET_DB().collection('columns').findOne({ _id: card.columnId })
        return {
          ...card,
          columnTitle: column ? column.title : 'Unknown Column'
        }
      } catch (error) {
        return {
          ...card,
          columnTitle: 'Unknown Column'
        }
      }
    }))
    
    return cardsWithColumnInfo
  } catch (error) {
    throw new Error(`Error getting cards with due dates: ${error.message}`)
  }
}

// Cập nhật labelIds cho card
const updateCardLabels = async (cardId, labelIds) => {
  const result = await GET_DB().collection(cardModel.CARD_COLLECTION_NAME).findOneAndUpdate(
    { _id: new ObjectId(cardId), _destroy: false },
    { $set: { labelIds, updatedAt: Date.now() } },
    { returnDocument: 'after' }
  );
  return result;
};

export const cardService = {
  createNew,
  update,
  
  // Thêm các function mới để xử lý attachments
  deleteCardAndAttachments,
  getCardWithAttachments,
  getCardsWithDueDate,
  updateCardLabels
}
