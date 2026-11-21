export interface Square {
  rowIndex: number
  columnIndex: number
}

export interface ActivePiece extends Square {
  piece: string
}

export type Colour = 'w' | 'b'

export interface CastlingRights {
  wK: boolean
  wQ: boolean
  bK: boolean
  bQ: boolean
}

export interface GameState {
  board: Board
  turn: Colour
  castling: CastlingRights
  enPassant: Square | null
}

export interface MoveResult {
  state: GameState
  captured: string | null
}

export type PotentialMoves = Square[]

export type Board = string[][]
