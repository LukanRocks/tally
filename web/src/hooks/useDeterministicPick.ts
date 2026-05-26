export const useDeterministicPick = <T>(items: readonly T[], id: number): T => items[id % items.length]
