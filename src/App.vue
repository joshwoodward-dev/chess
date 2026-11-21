<template>
  <section class="container">
    <Modal v-if="promotionSquare" :closable="false">
      <template #header>
        <h3>Pawn Promotion</h3>
      </template>

      <div class="promotion-piece-container">
        <img
          class="promotion-piece"
          v-for="piece in promotionPieces"
          :key="piece"
          :src="getImageUrl('piece', promotionSquare?.piece[0] + piece, 'svg')"
          :alt="piece"
          @click="promotePawn(piece, promotionSquare!)"
        />
      </div>
    </Modal>

    <Modal v-if="gameStatus !== 'playing'" :closable="false">
      <template #header>
        <h3 v-if="gameStatus === 'checkmate'">{{ winner?.colour }} Wins</h3>
        <h3 v-else>Stalemate</h3>
      </template>

      <div v-if="gameStatus === 'checkmate'">{{ winner?.player }} wins by checkmate.</div>
      <div v-else>Draw by stalemate</div>

      <div class="new-game-btn-container">
        <button class="btn" @click="resetGame()">Play again</button>
      </div>
    </Modal>

    <div class="board">
      <div class="player-bar">
        <img class="player-avatar" :src="getImageUrl('icons', 'player2', 'png')" alt="player 2" />

        <div>
          <p class="player-name">Player 2 <span v-if="game.turn === 'b'" class="turn-dot" /></p>

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

      <div class="row" v-for="(row, rowIndex) in game.board">
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
        <img class="player-avatar" :src="getImageUrl('icons', 'player1', 'png')" alt="player 1" />

        <div>
          <p class="player-name">Player 1 <span v-if="game.turn === 'w'" class="turn-dot" /></p>
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

.promotion-piece-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.promotion-piece {
  margin: 0.5rem;
  transition: background-color 0.3s ease;
}

.promotion-piece:hover {
  border-radius: 5px;
  background-color: rgba(128, 128, 128, 0.5);
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

.btn {
  background-color: #04aa6d;
  border: none;
  color: white;
  padding: 10px 22px;
  border-radius: 5px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
}

.new-game-btn-container {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}

.turn-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #04aa6d;
}

.player-name {
  margin: 0 0 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.check-cell {
  background-color: rgba(220, 50, 50, 0.7);
}
</style>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { isPotentialMove, isActiveCell } from './engine/board'
import { getSafeMoves, hasAnySafeMove, isInCheck, findKing } from './engine/moves'
import type { ActivePiece, GameState } from './engine/types'
import { groupByType, getScore } from './engine/scores'
import Modal from './components/Modal.vue'
import { initialState, makeMove } from './engine/state.ts'

// ------------
// Game State
// ------------

const game = ref<GameState>(initialState())
const activePiece = ref<ActivePiece | null>(null)

function maybeMovePiece(rowIndex: number, columnIndex: number, piece: string) {
  if (gameStatus.value !== 'playing' || promotionSquare.value) return

  if (activePiece.value && isPotentialMove(rowIndex, columnIndex, potentialMoves.value)) {
    const result = makeMove(game.value, activePiece.value, { rowIndex, columnIndex })
    if (result.captured) capturedPieces.value[game.value.turn].push(result.captured)
    game.value = result.state
    activePiece.value = null
  } else if (piece && piece.startsWith(game.value.turn))
    activePiece.value = { rowIndex, columnIndex, piece }
}

const potentialMoves = computed(() =>
  activePiece.value ? getSafeMoves(activePiece.value, game.value) : [],
)

const gameStatus = computed<'playing' | 'checkmate' | 'stalemate'>(() => {
  const { turn } = game.value
  if (hasAnySafeMove(game.value, turn)) return 'playing'
  return isInCheck(game.value, turn) ? 'checkmate' : 'stalemate'
})

const winner = computed(() => {
  if (gameStatus.value !== 'checkmate') return null
  return game.value.turn === 'w'
    ? { player: 'Player 2', colour: 'Black' }
    : { player: 'Player 1', colour: 'White' }
})

function resetGame() {
  game.value = initialState()
  capturedPieces.value = { w: [], b: [] }
  activePiece.value = null
}

const checkSquare = computed(() => {
  const { turn } = game.value
  if (!isInCheck(game.value, turn)) return null

  return findKing(game.value.board, turn)
})

// ------------
// Board Display
// ------------

function boardBackground(rowIndex: number, columnIndex: number, activePiece: ActivePiece | null) {
  if (isActiveCell(rowIndex, columnIndex, activePiece)) return 'highlight-cell'
  if (checkSquare.value?.rowIndex === rowIndex && checkSquare.value?.columnIndex === columnIndex)
    return 'check-cell'

  return (rowIndex + columnIndex) % 2 ? 'dark-cell' : 'light-cell'
}

function getImageUrl(directory: string, name: string, format: string) {
  return new URL(`./assets/${directory}/${name}.${format}`, import.meta.url).href
}

// ------------
// Scores
// ------------

const capturedPieces = ref<Record<'w' | 'b', string[]>>({ w: [], b: [] })

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

// ------------
// Promotion
// ------------
const promotionPieces = ref<string[]>(['Q', 'R', 'N', 'B'])

const promotionSquare = computed<ActivePiece | null>(() => {
  const board = game.value.board
  const whiteColumn = board[0]!.indexOf('wP')
  if (whiteColumn !== -1) return { rowIndex: 0, columnIndex: whiteColumn, piece: 'wP' }

  const blackColumn = board[7]!.indexOf('bP')
  if (blackColumn !== -1) return { rowIndex: 7, columnIndex: blackColumn, piece: 'bP' }

  return null
})

function promotePawn(piece: string, square: ActivePiece) {
  game.value.board[square.rowIndex]![square.columnIndex] = square.piece[0] + piece
}
</script>
