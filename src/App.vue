<template>
  <section class="container">
    <div class="board">
      <div class="player-bar">
        <img
          class="player-avatar"
          :src="getImageUrl('icons', 'deepJuice', 'png')"
          alt="deepJuice"
        />

        <div>
          <p class="player-name">Deep Juice</p>

          <div class="captured-pieces">
            <template v-for="(count, piece) in groupedCapturedPieces.b" :key="piece">
              <div v-if="count" class="captured-group">
                <img
                  v-for="index in count"
                  class="captured-piece"
                  :key="index"
                  :src="getImageUrl('piece', 'w' + piece.toUpperCase(), 'svg')"
                  :alt="piece"
                />
              </div>
            </template>

            <span class="captured-score" v-if="capturedScores.b > capturedScores.w">
              +{{ capturedScores.b - capturedScores.w }}
            </span>
          </div>
        </div>
      </div>

      <div class="row" v-for="(row, rowIndex) in board">
        <div
          class="square"
          :class="boardBackground(rowIndex, columnIndex, activePiece)"
          v-for="(piece, columnIndex) in row"
          @click="maybeMovePiece(rowIndex, columnIndex, piece)"
        >
          <div v-if="isPotentialMove(rowIndex, columnIndex, potentialMoves)" class="circle" />
          <img
            class="piece"
            v-if="piece.length"
            :src="getImageUrl('piece', piece, 'svg')"
            :alt="piece"
          />
        </div>
      </div>

      <div class="player-bar">
        <img class="player-avatar" :src="getImageUrl('icons', 'guest', 'png')" alt="guest" />

        <div>
          <p class="player-name">Guest</p>
          <div class="captured-pieces">
            <template v-for="(count, piece) in groupedCapturedPieces.w" :key="piece">
              <div v-if="count" class="captured-group">
                <img
                  v-for="index in count"
                  class="captured-piece"
                  :key="index"
                  :src="getImageUrl('piece', 'b' + piece.toUpperCase(), 'svg')"
                  :alt="piece"
                />
              </div>
            </template>

            <span class="captured-score" v-if="capturedScores.w > capturedScores.b">
              +{{ capturedScores.w - capturedScores.b }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="css">
body {
  font-family: Arial, Helvetica, sans-serif;
}

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

.captured-piece {
  width: 25px;
  height: 25px;
}

.captured-piece:not(:first-child) {
  margin-left: -1rem;
}

.captured-pieces {
  display: flex;
  align-items: center;
}

.player-bar {
  display: flex;
  height: 45px;
  margin: 0.5rem 0;
}

.player-avatar {
  width: 45px;
  height: 45px;
  border-radius: 10%;
}

.player-name {
  margin: 0 0 0 0.5rem;
}

.captured-group {
  display: flex;
}

.captured-group:not(:first-child) {
  margin-left: -0.25rem;
}

.captured-score {
  color: #a9a9a9;
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
import { getSafeMoves, hasAnySafeMove, isInCheck } from './engine/moves'
import type { ActivePiece } from './engine/types'
import { groupByType, getScore } from './engine/scores'

// ------------
// Legal Moves
// ------------

const activePiece = ref<ActivePiece | null>(null)
const turn = ref<'w' | 'b'>('w')

function maybeMovePiece(rowIndex: number, columnIndex: number, piece: string) {
  if (gameStatus.value !== 'playing') return

  if (activePiece.value && isPotentialMove(rowIndex, columnIndex, potentialMoves.value)) {
    maybeAssignCapturedPiece(rowIndex, columnIndex)

    board.value[rowIndex]![columnIndex]! = activePiece.value.piece
    board.value[activePiece.value.rowIndex]![activePiece.value.columnIndex] = ''

    turn.value = turn.value === 'w' ? 'b' : 'w'

    activePiece.value = null
  } else if (piece && piece.startsWith(turn.value))
    activePiece.value = { rowIndex: rowIndex, columnIndex: columnIndex, piece: piece }
}

const potentialMoves = computed(() =>
  activePiece.value ? getSafeMoves(activePiece.value, board.value) : [],
)

const gameStatus = computed<'playing' | 'checkmate' | 'stalemate'>(() => {
  if (hasAnySafeMove(board.value, turn.value)) return 'playing'
  return isInCheck(board.value, turn.value) ? 'checkmate' : 'stalemate'
})

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

function getImageUrl(directory: string, name: string, format: string) {
  return new URL(`./assets/${directory}/${name}.${format}`, import.meta.url).href
}

// ------------
// Scores
// ------------

const capturedPieces = ref<Record<'w' | 'b', string[]>>({ w: [], b: [] })
function maybeAssignCapturedPiece(rowIndex: number, columnIndex: number) {
  if (board.value[rowIndex]![columnIndex]!.length) {
    capturedPieces.value[turn.value].push(board.value[rowIndex]![columnIndex]!)
  }
}

const groupedCapturedPieces = computed(() => {
  return {
    w: groupByType(capturedPieces.value.w),
    b: groupByType(capturedPieces.value.b),
  }
})

const capturedScores = computed(() => {
  return {
    w: getScore(groupedCapturedPieces.value.w),
    b: getScore(groupedCapturedPieces.value.b),
  }
})
</script>
