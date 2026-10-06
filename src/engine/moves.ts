// Imports
import { isOnBoard, isOccupied, isOwnPiece, isFirstMove } from './board'
import type { Square, ActivePiece, Board } from './types'

export function legalMoves(activePiece: ActivePiece, board: Board) {
  switch (activePiece.piece[1]) {
    case 'N':
      return legalKnightMoves(activePiece, board)
    case 'K':
      return legalKingMoves(activePiece, board)
    case 'P':
      return legalPawnMoves(activePiece, board)
    case 'R':
      return legalRookMoves(activePiece, board)
    case 'B':
      return legalBishopMoves(activePiece, board)
    case 'Q':
      return legalQueenMoves(activePiece, board)

    default:
      return []
  }
}

// Leapers

function legalKnightMoves(activePiece: ActivePiece, board: Board): Square[] {
  const knightOffsets: [number, number][] = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ]
  return legalLeaperMoves(knightOffsets, activePiece, board)
}

function legalKingMoves(activePiece: ActivePiece, board: Board): Square[] {
  const kingOffsets: [number, number][] = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ]

  return legalLeaperMoves(kingOffsets, activePiece, board)
}

function legalLeaperMoves(
  offsets: [number, number][],
  activePiece: ActivePiece,
  board: Board,
): Square[] {
  const potentialMoves: Square[] = []
  const pieceColour = activePiece.piece[0]

  offsets.forEach((offset) => {
    const [rowChange, cellChange] = offset
    const rowIndex = activePiece.rowIndex + rowChange
    const columnIndex = activePiece.columnIndex + cellChange

    if (isOnBoard(rowIndex, columnIndex) && !isOwnPiece(rowIndex, columnIndex, pieceColour!, board))
      potentialMoves.push({ rowIndex: rowIndex, columnIndex: columnIndex })
  })

  return potentialMoves
}

// Pawns
function legalPawnMoves(activePiece: ActivePiece, board: Board): Square[] {
  const potentialMoves: Square[] = []
  const pieceColour = activePiece.piece[0]
  const columnIndex = activePiece.columnIndex
  const rowIndex = pieceColour == 'w' ? activePiece.rowIndex - 1 : activePiece.rowIndex + 1
  const firstMoveRowIndex = pieceColour == 'w' ? rowIndex - 1 : rowIndex + 1

  const canAttackLeft =
    isOnBoard(rowIndex, columnIndex - 1) &&
    isOccupied(rowIndex, columnIndex - 1, board) &&
    !isOwnPiece(rowIndex, columnIndex - 1, pieceColour!, board)

  const canAttackRight =
    isOnBoard(rowIndex, columnIndex + 1) &&
    isOccupied(rowIndex, columnIndex + 1, board) &&
    !isOwnPiece(rowIndex, columnIndex + 1, pieceColour!, board)

  if (
    isOnBoard(rowIndex, columnIndex) &&
    !isOwnPiece(rowIndex, columnIndex, pieceColour!, board) &&
    !isOccupied(rowIndex, columnIndex, board)
  ) {
    potentialMoves.push({ rowIndex: rowIndex, columnIndex: columnIndex })

    if (
      isFirstMove(pieceColour!, activePiece) &&
      !isOccupied(firstMoveRowIndex, columnIndex, board)
    )
      potentialMoves.push({ rowIndex: firstMoveRowIndex, columnIndex: columnIndex })
  }
  if (canAttackLeft) potentialMoves.push({ rowIndex: rowIndex, columnIndex: columnIndex - 1 })
  if (canAttackRight) potentialMoves.push({ rowIndex: rowIndex, columnIndex: columnIndex + 1 })

  return potentialMoves
}

// Sliders
const straightLines: [number, number][] = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
]
const diagnalLines: [number, number][] = [
  [1, -1],
  [1, 1],
  [-1, -1],
  [-1, 1],
]

function legalRookMoves(activePiece: ActivePiece, board: Board): Square[] {
  return legalSliderMoves(straightLines, activePiece, board)
}

function legalBishopMoves(activePiece: ActivePiece, board: Board): Square[] {
  return legalSliderMoves(diagnalLines, activePiece, board)
}

function legalQueenMoves(activePiece: ActivePiece, board: Board): Square[] {
  return legalSliderMoves([...straightLines, ...diagnalLines], activePiece, board)
}

function legalSliderMoves(directions: [number, number][], activePiece: ActivePiece, board: Board) {
  const potentialMoves: Square[] = []
  const pieceColour = activePiece.piece[0]

  directions.forEach((dir) => {
    const [row, column] = dir

    let rowAcc = activePiece.rowIndex
    let columnAcc = activePiece.columnIndex

    while (true) {
      rowAcc += row
      columnAcc += column

      if (
        isOnBoard(rowAcc, columnAcc) &&
        isOccupied(rowAcc, columnAcc, board) &&
        !isOwnPiece(rowAcc, columnAcc, pieceColour!, board)
      ) {
        potentialMoves.push({ rowIndex: rowAcc, columnIndex: columnAcc })
        break
      } else if (isOnBoard(rowAcc, columnAcc) && !isOccupied(rowAcc, columnAcc!, board))
        potentialMoves.push({ rowIndex: rowAcc, columnIndex: columnAcc })
      else break
    }
  })

  return potentialMoves
}
