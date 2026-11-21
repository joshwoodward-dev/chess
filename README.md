# Chess

A two-player chess game built with Vue 3, TypeScript and Vite. All the move logic is written from scratch, with no chess libraries. A computer opponent is planned.

**[Play it here](https://chess-joshwoodward.netlify.app/)**

## Features

- Full move rules for every piece, including castling, en passant and pawn promotion
- Check, checkmate and stalemate detection
- Legal-move hints, check highlighting and a turn indicator
- Captured pieces and material score for each player

## Design notes

- **Position state, not move history.** The game is stored as a `GameState` (board, turn, castling rights, en passant target), the same information a FEN string holds. The rules only need the current position, not how you got there.
- **One place to make moves.** `makeMove` is the only function that changes the board. It returns a new state plus any captured piece, and legal-move filtering reuses it to reject moves that leave the king in check.
- **Moves vs attacks.** Attack detection is kept separate from move generation, because pawns attack differently from how they move, and because it stops castling and check detection from calling each other forever.

## Setup

```sh
npm install
npm run dev        # start the dev server
npm run test:unit  # run tests in watch mode (Vitest)
npm run type-check
npm run lint
```

## Layout

- `src/engine/` – game logic (pure TypeScript, no Vue)
- `src/components/` – UI components

## Next steps

- Promotion through `makeMove`
- Draw rules (50-move, threefold repetition, insufficient material)
- FEN import and export
- Perft tests to verify move generation
- A computer opponent (minimax with alpha-beta, in a Web Worker)
