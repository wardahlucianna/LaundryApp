export type Page<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
};

export const DEFAULT_PER_PAGE = 10;
export const PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;
