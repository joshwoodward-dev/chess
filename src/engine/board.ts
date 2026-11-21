import type { ActivePiece, Board, GameState, PotentialMoves } from './types'

// ------------
// Helpers
// ------------

export const isFirstMove = (pieceColour: string, activePiece: ActivePiece): boolean => {
  return pieceColour == 'w' ? activePiece.rowIndex === 6 : activePiece.rowIndex === 1
}

export const isOccupied = (rowIndex: number, columnIndex: number, board: Board): boolean => {
  return board[rowIndex]![columnIndex] !== ''
}

export const isOnBoard = (rowIndex: number, columnIndex: number): boolean => {
  return rowIndex >= 0 && rowIndex <= 7 && columnIndex >= 0 && columnIndex <= 7
}

export const isOwnPiece = (
  rowIndex: number,
  columnIndex: number,
  pieceColour: string,
  board: Board,
): boolean => {
  return board[rowIndex]![columnIndex]!.includes(pieceColour!)
}

export const isActiveCell = (
  rowIndex: number,
  columnIndex: number,
  activePiece: ActivePiece | null,
): boolean => {
  return activePiece?.rowIndex === rowIndex && activePiece?.columnIndex === columnIndex
}

export const isPotentialMove = (
  rowIndex: number,
  columnIndex: number,
  potentialMoves: PotentialMoves,
): boolean => {
  return potentialMoves?.some(
    (move) => move.rowIndex === rowIndex && move.columnIndex === columnIndex,
  )
}

export const pawnForwardRow = (activePiece: ActivePiece): number =>
  activePiece.piece[0] === 'w' ? activePiece.rowIndex - 1 : activePiece.rowIndex + 1

export const canCaptureEnPassant = (activePiece: ActivePiece, state: GameState): boolean => {
  const enemyColour = activePiece.piece[0] === 'w' ? 'b' : 'w'
  const rowIndex = pawnForwardRow(activePiece)

  return (
    state.enPassant !== null &&
    state.board[activePiece.rowIndex]![state.enPassant.columnIndex]![0] === enemyColour &&
    rowIndex === state.enPassant.rowIndex &&
    (activePiece.columnIndex - 1 === state.enPassant.columnIndex ||
      activePiece.columnIndex + 1 === state.enPassant.columnIndex)
  )
}
