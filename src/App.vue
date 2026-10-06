<template>
  <section class="container">
    <div class="board">
      <div class="row" v-for="(row, rowIndex) in board">
        <div
          class="square"
          :class="boardBackground(rowIndex, columnIndex, activePiece)"
          v-for="(piece, columnIndex) in row"
          @click="maybeMovePiece(rowIndex, columnIndex, piece)"
        >
          <div v-if="isPotentialMove(rowIndex, columnIndex, potentialMoves)" class="circle" />
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
import { isPotentialMove, isActiveCell } from './engine/board'
import { legalMoves } from './engine/moves'
import type { ActivePiece } from './engine/types'

// ------------
// Turn
// ------------

const turn = ref<'w' | 'b'>('w')

// ------------
// Legal Moves
// ------------

const activePiece = ref<ActivePiece | null>(null)

function maybeMovePiece(rowIndex: number, columnIndex: number, piece: string) {
  if (activePiece.value && isPotentialMove(rowIndex, columnIndex, potentialMoves.value)) {
    board.value[rowIndex]![columnIndex] = activePiece.value.piece
    board.value[activePiece.value.rowIndex]![activePiece.value.columnIndex] = ''

    turn.value = turn.value === 'w' ? 'b' : 'w'

    activePiece.value = null
  } else if (piece && piece.startsWith(turn.value))
    activePiece.value = { rowIndex: rowIndex, columnIndex: columnIndex, piece: piece }
}

const potentialMoves = computed(() =>
  activePiece.value ? legalMoves(activePiece.value, board.value) : [],
)

// ------------
// Board
// ------------

const board = ref([
  ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
  ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
  ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'],
])

function boardBackground(
  rowIndex: number,
  columnIndex: number,
  activePiece: ActivePiece | null,
): string {
  if (isActiveCell(rowIndex, columnIndex, activePiece)) return 'highlight-cell'
  else return (rowIndex + columnIndex) % 2 ? 'dark-cell' : 'light-cell'
}

function getImageUrl(name: string) {
  return new URL(`./assets/piece/${name}.svg`, import.meta.url).href
}
</script>
