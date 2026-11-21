import type { GameState, ActivePiece, Square, MoveResult, CastlingRights } from './types'

export function initialState(): GameState {
  return {
    board: [
      ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
      ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
      ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'],
    ],
    turn: 'w',
    castling: { wK: true, wQ: true, bK: true, bQ: true },
    enPassant: null,
  }
}

export function makeMove(state: GameState, from: ActivePiece, to: Square): MoveResult {
  let captured: string | null = state.board[to.rowIndex]![to.columnIndex] || null

  const board = state.board.map((row) => [...row])
  board[to.rowIndex]![to.columnIndex] = from.piece
  board[from.rowIndex]![from.columnIndex] = ''

  // Castling
  const castling = { ...state.castling }

  const isKing: boolean = from.piece[1] === 'K'
  const colour = from.piece[0]

  if (isKing && Math.abs(to.columnIndex - from.columnIndex) === 2) {
    const isKingside = to.columnIndex === 6
    const isQueenSide = to.columnIndex === 2

    if (isKingside) {
      board[from.rowIndex]![7] = ''
      board[from.rowIndex]![5] = `${colour}R`
    }
    if (isQueenSide) {
      board[from.rowIndex]![0] = ''
      board[from.rowIndex]![3] = `${colour}R`
    }
  }

  if (isKing) {
    castling[`${colour}K` as keyof CastlingRights] = false
    castling[`${colour}Q` as keyof CastlingRights] = false
  }

  clearRightsForCorner(from, castling)
  clearRightsForCorner(to, castling)

  // En Passant
  let enPassant: Square | null = null
  const isPawn: boolean = from.piece[1] === 'P'

  if (isPawn && Math.abs(to.rowIndex - from.rowIndex) === 2) {
    enPassant = {
      rowIndex: (from.rowIndex + to.rowIndex) / 2,
      columnIndex: from.columnIndex,
    }
  }

  if (
    isPawn &&
    to.rowIndex === state.enPassant?.rowIndex &&
    to.columnIndex === state.enPassant.columnIndex
  ) {
    captured = board[from.rowIndex]![to.columnIndex]!
    board[from.rowIndex]![to.columnIndex] = ''
  }

  return {
    state: {
      board,
      turn: state.turn === 'w' ? 'b' : 'w',
      castling,
      enPassant,
    },
    captured,
  }
}

function clearRightsForCorner(square: Square, castling: CastlingRights): void {
  if (square.rowIndex === 7 && square.columnIndex === 7) castling.wK = false
  if (square.rowIndex === 7 && square.columnIndex === 0) castling.wQ = false
  if (square.rowIndex === 0 && square.columnIndex === 7) castling.bK = false
  if (square.rowIndex === 0 && square.columnIndex === 0) castling.bQ = false
}
