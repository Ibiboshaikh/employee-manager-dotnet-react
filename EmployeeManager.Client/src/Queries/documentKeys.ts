export const documentKeys = {
    all: ["documents"] as const,
    mine: () => [...documentKeys.all, "mine"] as const,
    allAdmin: () => [...documentKeys.all, 'admin'] as const,
    detail: (id: string) => [...documentKeys.all, 'detail', id] as const,
}