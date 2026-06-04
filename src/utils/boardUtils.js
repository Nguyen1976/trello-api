export const validateBoardTitle = (title) => {
  if (typeof title !== 'string') {
    return { valid: false, error: 'EMPTY_TITLE' }
  }

  if (title === '') {
    return { valid: false, error: 'EMPTY_TITLE' }
  }

  if (title.length > 255) {
    return { valid: false, error: 'TOO_LONG' }
  }

  return { valid: true }
}
