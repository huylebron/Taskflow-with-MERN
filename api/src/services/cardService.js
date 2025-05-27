/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const createNew = async (reqBody) => {
  try {
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

const update = async (cardId, reqBody, cardCoverFile, userInfo) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

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
    } else {
      // Các trường hợp update chung như title, description
      updatedCard = await cardModel.update(cardId, updateData)
    }


    return updatedCard
  } catch (error) { throw error }
}

export const cardService = {
  createNew,
  update
}
