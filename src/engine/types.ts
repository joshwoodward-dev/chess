export interface Square {
  rowIndex: number
  columnIndex: number
}

export interface ActivePiece extends Square {
  piece: string
}

export type PotentialMoves = Square[]

export type Board = string[][]
