export function calcPoints(n: number, rank: number): number {
  if (n < 2) return 0
  return n - (rank - 1) + (rank === 1 ? 1 : 0)
}
