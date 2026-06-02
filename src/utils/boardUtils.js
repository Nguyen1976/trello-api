export const validateBoardTitle = (title) => {
  if (title === '') {
    return { valid: false, error: 'EMPTY_TITLE' }
  }

  if (title.length > 255) {
    return { valid: false, error: 'TOO_LONG' }
  }

  return { valid: true }
}
