const scores: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
}

export function groupByType(pieces: string[]) {
  const groupedPiecesCount: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0 }

  pieces.forEach((piece) => {
    const formattedPiece = piece[1]!.toLowerCase()
    groupedPiecesCount[formattedPiece]! += 1
  })

  return groupedPiecesCount
}

export function getScore(groups: Record<string, number>) {
  let score = 0
  for (const [type, count] of Object.entries(groups)) {
    score += scores[type]! * count
  }

  return score
}
