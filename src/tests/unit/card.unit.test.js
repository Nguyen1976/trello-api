import { moveCard } from '~/utils/cardUtils'

describe('cardUtils - moveCard (white box)', () => {
  const cardId = 'card-1'
  const listA = 'list-a'
  const listB = 'list-b'

  let mockSave
  let mockCard
  let mockDb

  beforeEach(() => {
    mockSave = jest.fn().mockResolvedValue(undefined)
    mockCard = {
      _id: cardId,
      listId: listA,
      save: mockSave
    }
    mockDb = {
      Card: { findById: jest.fn() },
      List: { findById: jest.fn() }
    }
  })

  // Nhánh: card không tồn tại → throw Error 'Card not found'
  it('throws Card not found when card does not exist', async () => {
    mockDb.Card.findById.mockResolvedValue(null)

    await expect(moveCard(cardId, listB, mockDb)).rejects.toThrow('Card not found')
    expect(mockDb.List.findById).not.toHaveBeenCalled()
    expect(mockSave).not.toHaveBeenCalled()
  })

  // Nhánh: targetList không tồn tại → throw Error 'Target list not found'
  it('throws Target list not found when target list does not exist', async () => {
    mockDb.Card.findById.mockResolvedValue(mockCard)
    mockDb.List.findById.mockResolvedValue(null)

    await expect(moveCard(cardId, listB, mockDb)).rejects.toThrow(
      'Target list not found'
    )
    expect(mockSave).not.toHaveBeenCalled()
  })

  // Nhánh: card.listId === targetListId → return card, không gọi save()
  it('returns card unchanged without save when already in target list', async () => {
    mockCard.listId = listA
    mockDb.Card.findById.mockResolvedValue(mockCard)
    mockDb.List.findById.mockResolvedValue({ _id: listA })

    const result = await moveCard(cardId, listA, mockDb)

    expect(result).toBe(mockCard)
    expect(result.listId).toBe(listA)
    expect(mockSave).not.toHaveBeenCalled()
  })

  // Nhánh: move thành công → return card với listId mới, đã gọi save()
  it('updates listId and calls save on successful move', async () => {
    mockCard.listId = listA
    mockDb.Card.findById.mockResolvedValue(mockCard)
    mockDb.List.findById.mockResolvedValue({ _id: listB })

    const result = await moveCard(cardId, listB, mockDb)

    expect(result.listId).toBe(listB)
    expect(mockSave).toHaveBeenCalledTimes(1)
  })
})
