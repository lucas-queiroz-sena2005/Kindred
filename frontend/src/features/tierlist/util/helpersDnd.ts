/**
 * Moves an element from one index to another within the same array.
 * @param list The array to modify.
 * @param startIndex The index of the element to move.
 * @param endIndex The index to move the element to.
 * @returns A new array with the element moved.
 */
export function arrayMove<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

/**
 * Moves an element from one array to another.
 * @param source The source array.
 * @param destination The destination array.
 * @param droppableSource The source droppable information.
 * @param droppableDestination The destination droppable information.
 * @returns A tuple containing the new source and destination arrays.
 */
export function arrayTransfer<T>(
  sourceList: T[],
  destList: T[],
  sourceIndex: number,
  destIndex: number
): [T[], T[]] {
  const newSource = Array.from(sourceList);
  const newDest = Array.from(destList);
  const [removed] = newSource.splice(sourceIndex, 1);
  newDest.splice(destIndex, 0, removed);
  return [newSource, newDest];
}