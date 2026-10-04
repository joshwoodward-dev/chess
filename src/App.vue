<template>
  <section class="container">
    <div class="board">
      <div class="row" v-for="(row, rowIndex) in board">
        <div
          class="square"
          :class="boardBackground(rowIndex, columnIndex)"
          v-for="(piece, columnIndex) in row"
          @click="maybeMovePiece(rowIndex, columnIndex, piece)"
        >
          <div v-if="activePiece && isPotentialMove(rowIndex, columnIndex)" class="circle" />
          <img class="piece" v-if="piece.length" :src="getImageUrl(piece)" :alt="piece" />
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="css">
.container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.board {
  width: 600px;
}

.row {
  display: flex;
}

.square {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 75px;
  width: 75px;
}

.light-cell {
  background-color: #eeeed2;
}

.dark-cell {
  background-color: #769656;
}

.highlight-cell {
  background-color: rgba(255, 255, 0, 0.65);
}

.piece {
  width: 70px;
  height: 70px;
}

.circle {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.1);
}
</style>

<script setup lang="ts">
import { computed, ref } from 'vue'

// ------------
// Board
// ------------

let board = ref([
  ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
  ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
  ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'],
])

function boardBackground(rowIndex: number, columnIndex: number): string {
  if (isActiveCell(rowIndex, columnIndex)) return 'highlight-cell'
  else return (rowIndex + columnIndex) % 2 ? 'dark-cell' : 'light-cell'
}

function getImageUrl(name: string) {
  return new URL(`./assets/piece/${name}.svg`, import.meta.url).href
}

interface Square {
  rowIndex: number
  columnIndex: number
}

interface ActivePiece extends Square {
  piece: string
}

// ------------
// Legal Moves
// ------------

const activePiece = ref<ActivePiece | null>(null)

function maybeMovePiece(rowIndex: number, columnIndex: number, piece: string) {
  if (activePiece.value && isMoveLegal(rowIndex, columnIndex, activePiece.value)) {
    board.value[rowIndex]![columnIndex] = activePiece.value.piece
    board.value[activePiece.value.rowIndex]![activePiece.value.columnIndex] = ''

    activePiece.value = null
  } else if (piece)
    activePiece.value = { rowIndex: rowIndex, columnIndex: columnIndex, piece: piece }
}

function legalMoves(activePiece: ActivePiece) {
  switch (activePiece.piece[1]) {
    case 'N':
      return legalKnightMoves(activePiece)
    case 'K':
      return legalKingMoves(activePiece)
    case 'P':
      return legalPawnMoves(activePiece)
    case 'R':
      return legalRookMoves(activePiece)
    case 'B':
      return legalBishopMoves(activePiece)
    case 'Q':
      return legalQueenMoves(activePiece)

    default:
      return []
  }
}

const potentialMoves = computed(() => {
  return legalMoves(activePiece.value!) || []
})

// Leapers

function legalKnightMoves(activePiece: ActivePiece): Square[] {
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
  return legalLeaperMoves(knightOffsets, activePiece)
}

function legalKingMoves(activePiece: ActivePiece): Square[] {
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

  return legalLeaperMoves(kingOffsets, activePiece)
}

function legalLeaperMoves(offsets: [number, number][], activePiece: ActivePiece): Square[] {
  const potentialMoves: Square[] = []
  const pieceColour = activePiece.piece[0]

  offsets.forEach((offset) => {
    const [rowChange, cellChange] = offset
    const rowIndex = activePiece.rowIndex + rowChange
    const columnIndex = activePiece.columnIndex + cellChange

    if (isOnBoard(rowIndex, columnIndex) && !isOwnPiece(rowIndex, columnIndex, pieceColour!))
      potentialMoves.push({ rowIndex: rowIndex, columnIndex: columnIndex })
  })

  return potentialMoves
}

// Pawns

function legalPawnMoves(activePiece: ActivePiece): Square[] {
  const potentialMoves: Square[] = []
  const pieceColour = activePiece.piece[0]
  const columnIndex = activePiece.columnIndex
  const rowIndex = pieceColour == 'w' ? activePiece.rowIndex - 1 : activePiece.rowIndex + 1
  const firstMoveRowIndex = pieceColour == 'w' ? rowIndex - 1 : rowIndex + 1

  const canAttackLeft =
    isOnBoard(rowIndex, columnIndex - 1) &&
    board.value[rowIndex]![columnIndex - 1] !== '' &&
    !isOwnPiece(rowIndex, columnIndex - 1, pieceColour!)

  const canAttackRight =
    isOnBoard(rowIndex, columnIndex + 1) &&
    board.value[rowIndex]![columnIndex + 1] !== '' &&
    !isOwnPiece(rowIndex, columnIndex + 1, pieceColour!)

  if (
    isOnBoard(rowIndex, columnIndex) &&
    !isOwnPiece(rowIndex, columnIndex, pieceColour!) &&
    !isOccupied(rowIndex, columnIndex)
  ) {
    potentialMoves.push({ rowIndex: rowIndex, columnIndex: columnIndex })

    if (isFirstMove(pieceColour!, activePiece) && !isOccupied(firstMoveRowIndex, columnIndex))
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

function legalRookMoves(activePiece: ActivePiece): Square[] {
  return legalSliderMoves(straightLines, activePiece)
}

function legalBishopMoves(activePiece: ActivePiece): Square[] {
  return legalSliderMoves(diagnalLines, activePiece)
}

function legalQueenMoves(activePiece: ActivePiece): Square[] {
  return legalSliderMoves([...straightLines, ...diagnalLines], activePiece)
}

function legalSliderMoves(directions: [number, number][], activePiece: ActivePiece) {
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
        isOccupied(rowAcc, columnAcc) &&
        !isOwnPiece(rowAcc, columnAcc, pieceColour!)
      ) {
        potentialMoves.push({ rowIndex: rowAcc, columnIndex: columnAcc })
        break
      } else if (isOnBoard(rowAcc, columnAcc) && !isOccupied(rowAcc, columnAcc!))
        potentialMoves.push({ rowIndex: rowAcc, columnIndex: columnAcc })
      else break
    }
  })

  return potentialMoves
}

// ------------
// Helpers
// ------------

const isFirstMove = (pieceColour: string, activePiece: ActivePiece): boolean => {
  return pieceColour == 'w' ? activePiece.rowIndex === 6 : activePiece.rowIndex === 1
}

const isOccupied = (rowIndex: number, columnIndex: number): boolean => {
  return board.value[rowIndex]![columnIndex] !== ''
}

const isOnBoard = (rowIndex: number, columnIndex: number): boolean => {
  return rowIndex >= 0 && rowIndex <= 7 && columnIndex >= 0 && columnIndex <= 7
}

const isOwnPiece = (rowIndex: number, columnIndex: number, pieceColour: string): boolean => {
  return board.value[rowIndex]![columnIndex]!.includes(pieceColour!)
}

const isActiveCell = (rowIndex: number, columnIndex: number): boolean => {
  return activePiece.value?.rowIndex === rowIndex && activePiece.value?.columnIndex === columnIndex
}

const isMoveLegal = (rowIndex: number, columnIndex: number, activePiece: ActivePiece): boolean => {
  return legalMoves(activePiece).some((move) => {
    return move.columnIndex === columnIndex && move.rowIndex === rowIndex
  })
}

const isPotentialMove = (rowIndex: number, columnIndex: number): boolean => {
  return potentialMoves.value?.some(
    (move) => move.rowIndex === rowIndex && move.columnIndex === columnIndex,
  )
}
</script>
