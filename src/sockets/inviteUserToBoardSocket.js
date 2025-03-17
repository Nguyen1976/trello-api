/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

//param socket được lấy từ thư viện socket.io
export const inviteUserToBoardSocket = (socket) => {
  //Lắng nghe sự kiện mà client emit lên có tên là: FE_USER_INVITED_TO_BOARD
  socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
    //Cách đơn giản nhất: Emit ngược lại 1 sự kiện về cho mọi client khác (ngoại trừ chính cái thằng gửi req lên), rồi để FE check
    socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
  })
}
