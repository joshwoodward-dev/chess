// Imports
import {
  isOnBoard,
  isOccupied,
  isOwnPiece,
  isFirstMove,
  canCaptureEnPassant,
  pawnForwardRow,
} from './board'
import type { Square, ActivePiece, Board, GameState, CastlingRights } from './types'
import { makeMove } from './state.ts'

export function legalMoves(activePiece: ActivePiece, state: GameState) {
  switch (activePiece.piece[1]) {
    case 'N':
      return legalKnightMoves(activePiece, state.board)
    case 'K':
      return legalKingMoves(activePiece, state)
    case 'P':
      return legalPawnMoves(activePiece, state)
    case 'R':
      return legalRookMoves(activePiece, state.board)
    case 'B':
      return legalBishopMoves(activePiece, state.board)
    case 'Q':
      return legalQueenMoves(activePiece, state.board)

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
function legalKingMoves(activePiece: ActivePiece, state: GameState): Square[] {
  const moves = legalLeaperMoves(kingOffsets, activePiece, state.board)
  const colour = activePiece.piece[0]!
  const homeRow = colour === 'w' ? 7 : 0

  if (activePiece.rowIndex !== homeRow || activePiece.columnIndex !== 4) return moves

  const attackedSquares = getAttackedSquares(state, colour)
  const isInCheckNow = attackedSquares.some(
    (move) => move.rowIndex === homeRow && move.columnIndex === 4,
  )

  if (isInCheckNow) return moves

  // --- Kingside ---
  const canCastleKingSide = state.castling[`${colour}K` as keyof CastlingRights]
  const kingSideOccupied =
    isOccupied(homeRow, 5, state.board) || isOccupied(homeRow, 6, state.board)

  const isKingSideUnderAttack = attackedSquares.some((move) => {
    return move.rowIndex === homeRow && move.columnIndex === 5
  })

  if (canCastleKingSide && !kingSideOccupied && !isKingSideUnderAttack)
    moves.push({ rowIndex: homeRow, columnIndex: 6 })

  // --- Queenside ---
  const canCastleQueenSide = state.castling[`${colour}Q` as keyof CastlingRights]
  const queenSideOccupied =
    isOccupied(homeRow, 1, state.board) ||
    isOccupied(homeRow, 2, state.board) ||
    isOccupied(homeRow, 3, state.board)

  const isQueenSideUnderAttack = attackedSquares.some((move) => {
    return move.rowIndex === homeRow && move.columnIndex === 3
  })

  if (canCastleQueenSide && !queenSideOccupied && !isQueenSideUnderAttack)
    moves.push({ rowIndex: homeRow, columnIndex: 2 })

  return moves
}

function legalLeaperMoves(
  offsets: [number, number][],
  activePiece: ActivePiece,
  board: Board,
): Square[] {
  const potentialMoves: Square[] = []
  const colour = activePiece.piece[0]

  offsets.forEach((offset) => {
    const [rowChange, cellChange] = offset
    const rowIndex = activePiece.rowIndex + rowChange
    const columnIndex = activePiece.columnIndex + cellChange

    if (isOnBoard(rowIndex, columnIndex) && !isOwnPiece(rowIndex, columnIndex, colour!, board))
      potentialMoves.push({ rowIndex: rowIndex, columnIndex: columnIndex })
  })

  return potentialMoves
}

// Pawns
function legalPawnMoves(activePiece: ActivePiece, state: GameState): Square[] {
  const potentialMoves: Square[] = []
  const colour = activePiece.piece[0]
  const columnIndex = activePiece.columnIndex
  const rowIndex = pawnForwardRow(activePiece)
  const firstMoveRowIndex = colour == 'w' ? rowIndex - 1 : rowIndex + 1

  if (
    isOnBoard(rowIndex, columnIndex) &&
    !isOwnPiece(rowIndex, columnIndex, colour!, state.board) &&
    !isOccupied(rowIndex, columnIndex, state.board)
  ) {
    potentialMoves.push({ rowIndex: rowIndex, columnIndex: columnIndex })

    if (
      isFirstMove(colour!, activePiece) &&
      !isOccupied(firstMoveRowIndex, columnIndex, state.board)
    )
      potentialMoves.push({ rowIndex: firstMoveRowIndex, columnIndex: columnIndex })
  }

  const captures = pawnAttackSquares(activePiece).filter(
    (sq) =>
      isOccupied(sq.rowIndex, sq.columnIndex, state.board) &&
      !isOwnPiece(sq.rowIndex, sq.columnIndex, colour!, state.board),
  )

  potentialMoves.push(...captures)

  if (state.enPassant !== null && canCaptureEnPassant(activePiece, state))
    potentialMoves.push(state.enPassant)
  return potentialMoves
}

function pawnAttackSquares(activePiece: ActivePiece): Square[] {
  const potentialMoves: Square[] = []
  const columnIndex = activePiece.columnIndex
  const rowIndex = pawnForwardRow(activePiece)

  const canAttackLeft = isOnBoard(rowIndex, columnIndex - 1)

  const canAttackRight = isOnBoard(rowIndex, columnIndex + 1)

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
  const colour = activePiece.piece[0]

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
        !isOwnPiece(rowAcc, columnAcc, colour!, board)
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

// ------------
// Check
// ------------
export function isInCheck(state: GameState, colour: string): boolean {
  const king = findKing(state.board, colour)

  if (!king) return false

  const attackedSquares = getAttackedSquares(state, colour)

  return attackedSquares.some((move) => {
    return move.rowIndex === king.rowIndex && move.columnIndex === king.columnIndex
  })
}

export function getSafeMoves(activePiece: ActivePiece, state: GameState): Square[] {
  const colour = activePiece.piece[0]

  return legalMoves(activePiece, state).filter((move) => {
    const next = makeMove(state, activePiece, move).state

    return !isInCheck(next, colour!)
  })
}

function findKing(board: Board, colour: string): Square | null {
  for (const [rowIndex, row] of Object.entries(board)) {
    for (const [columnIndex, piece] of Object.entries(row)) {
      if (piece.startsWith(colour) && piece.endsWith('K'))
        return { rowIndex: parseInt(rowIndex), columnIndex: parseInt(columnIndex) }
    }
  }

  return null
}

function getAttackedSquares(state: GameState, colour: string): Square[] {
  const opposition = colour === 'w' ? 'b' : 'w'
  const attackedSquares: Square[] = []

  for (const [rowIndex, row] of Object.entries(state.board)) {
    for (const [columnIndex, piece] of Object.entries(row)) {
      if (piece.startsWith(opposition)) {
        const currentPiece = {
          rowIndex: parseInt(rowIndex),
          columnIndex: parseInt(columnIndex),
          piece: piece,
        }
        attackedSquares.push(...attackSquares(currentPiece, state))
      }
    }
  }
  return attackedSquares
}

function attackSquares(piece: ActivePiece, state: GameState): Square[] {
  switch (piece.piece[1]) {
    case 'P':
      return pawnAttackSquares(piece)
    case 'K':
      return legalLeaperMoves(kingOffsets, piece, state.board)
    default:
      return legalMoves(piece, state)
  }
}

// ------------
// Checkmate
// ------------
export function hasAnySafeMove(state: GameState, colour: string): boolean {
  for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
    for (let columnIndex = 0; columnIndex < 8; columnIndex++) {
      const piece = state.board[rowIndex]![columnIndex]!

      if (piece.startsWith(colour) && getSafeMoves({ rowIndex, columnIndex, piece }, state).length)
        return true
    }
  }

  return false
}
