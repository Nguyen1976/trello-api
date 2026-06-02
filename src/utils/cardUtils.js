export const moveCard = async (cardId, targetListId, db) => {
  const card = await db.Card.findById(cardId)

  if (!card) {
    throw new Error('Card not found')
  }

  const targetList = await db.List.findById(targetListId)

  if (!targetList) {
    throw new Error('Target list not found')
  }

  if (card.listId === targetListId) {
    return card
  }

  card.listId = targetListId
  await card.save()

  return card
}
