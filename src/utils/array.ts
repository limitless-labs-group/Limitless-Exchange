export function chunkArray(array: any[], itemsPerRow: number) {
  const result = []
  let currentIndex = 0

  while (currentIndex < array.length) {
    // For the last row, check if we have enough items left
    const remainingItems = array.length - currentIndex
    const currentRowSize =
      currentIndex === 0
        ? itemsPerRow // first row
        : remainingItems < itemsPerRow
        ? remainingItems // last row
        : itemsPerRow // middle rows

    result.push(array.slice(currentIndex, currentIndex + currentRowSize))
    currentIndex += currentRowSize
  }

  return result
}
