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
    const newCard = {
      ...reqBody
    }

    const createdCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    //...
    if (getNewCard) {
      //Cập nhật mảng cardOrderIds trong collection boards

      await columnModel.pushCardOrderIds(getNewCard)
    }

    return getNewCard
  } catch (error) {
    throw error
  }
}
const update = async (cardId, reqBody, cardCoverFile) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    let updatedCard = {}

    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(
        cardCoverFile.buffer,
        'cards-trello-web'
      )

      //Lưu url file ảnh vào db (secure_url)
      updatedCard = await cardModel.update(cardId, {
        cover: uploadResult.secure_url
      })
    } else {
      //Các trường hợp update chung
      updatedCard = await cardModel.update(cardId, updateData)
    }

    return updatedCard
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew,
  update
}
