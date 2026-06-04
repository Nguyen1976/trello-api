import fc from 'fast-check'
import { moveCard } from '~/utils/cardUtils'

describe('cardUtils fuzz (TC-FUZZ-04)', () => {
  it('moveCard respects control-flow contracts across card/list presence combinations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          cardExists: fc.boolean(),
          targetExists: fc.boolean(),
          sameList: fc.boolean()
        }),
        async ({ cardExists, targetExists, sameList }) => {
          const cardId = 'card-1'
          const sourceListId = 'list-a'
          const targetListId = sameList ? sourceListId : 'list-b'
          const mockSave = jest.fn().mockResolvedValue(undefined)
          const mockCard = {
            _id: cardId,
            listId: sourceListId,
            save: mockSave
          }
          const mockDb = {
            Card: { findById: jest.fn() },
            List: { findById: jest.fn() }
          }

          mockDb.Card.findById.mockResolvedValue(cardExists ? mockCard : null)
          mockDb.List.findById.mockResolvedValue(
            targetExists ? { _id: targetListId } : null
          )

          if (!cardExists) {
            await expect(
              moveCard(cardId, targetListId, mockDb)
            ).rejects.toThrow('Card not found')
            expect(mockDb.List.findById).not.toHaveBeenCalled()
            expect(mockSave).not.toHaveBeenCalled()
            return
          }

          if (!targetExists) {
            await expect(
              moveCard(cardId, targetListId, mockDb)
            ).rejects.toThrow('Target list not found')
            expect(mockSave).not.toHaveBeenCalled()
            return
          }

          const result = await moveCard(cardId, targetListId, mockDb)

          if (sameList) {
            expect(result).toBe(mockCard)
            expect(result.listId).toBe(sourceListId)
            expect(mockSave).not.toHaveBeenCalled()
            return
          }

          expect(result).toBe(mockCard)
          expect(result.listId).toBe(targetListId)
          expect(mockSave).toHaveBeenCalledTimes(1)
        }
      ),
      { numRuns: 300 }
    )
  })
})
