export const cardSocket = (io, socket) => {
  // Client join vào room board
  socket.on('joinBoard', (boardId) => {
    socket.join(boardId)
  })

  // Khi có bình luận mới, emit tới room
  socket.on('FE_NEW_COMMENT', (data) => {
    // data cần chứa boardId, cardId, comment
    io.to(data.boardId).emit('BE_NEW_COMMENT', data)
  })

  // Xoá card realtime
  socket.on('FE_CARD_DELETED', (data) => {
    socket.to(data.boardId).emit('BE_CARD_DELETED', data)
  })

  // Thêm card realtime
  socket.on('FE_CARD_CREATED', (data) => {
    socket.to(data.boardId).emit('BE_CARD_CREATED', data)
  })

  // Xóa checklist realtime
  socket.on('FE_CHECKLIST_DELETED', (data) => {
    // data: { boardId, cardId, checklistId }
    socket.to(data.boardId).emit('BE_CHECKLIST_DELETED', data)
  })

  // Xóa checklist item realtime
  socket.on('FE_CHECKLIST_ITEM_DELETED', (data) => {
    // data: { boardId, cardId, checklistId, itemId }
    socket.to(data.boardId).emit('BE_CHECKLIST_ITEM_DELETED', data)
  })
} 