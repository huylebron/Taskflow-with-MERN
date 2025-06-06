
import express from 'express'
import { cardValidation } from '~/validations/cardValidation'
import { cardController } from '~/controllers/cardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, cardValidation.createNew, cardController.createNew)

Router.route('/cover-options')
  .get(authMiddleware.isAuthorized, cardController.getCoverOptions)

Router.route('/:id')
  .put(
    authMiddleware.isAuthorized,
    multerUploadMiddleware.upload.single('cardCover'),
    cardValidation.update,
    cardController.update
  )

// ⚠️ CẨN THẬN: Route để lấy card với attachments (nếu cần)
// Note: Attachment routes đã handle việc lấy attachments của card
// Route này có thể bổ sung nếu muốn lấy card + attachments trong một API call

export const cardRoute = Router
