import type { Page } from "../../../types/pagination";

type Props<T> = {
    data: Page<T> | null;
    page: number;
    setPage: (page: number) => void;
    perPage: number;
    setPerPage: (size: number) => void;
};

export default function Pagination<T>({ data, page, setPage, perPage, setPerPage }: Props<T>) {
    return (
        <div className="pagination-bar">
            <div>Menampilkan {data?.data.length ?? 0} dari {data?.total ?? 0} data</div>
            <div className="pagination-actions">
                <select value={perPage} onChange={event => { setPerPage(Number(event.target.value)); setPage(1); }} aria-label="Jumlah data per halaman">
                    {[10, 25, 50, 100].map(size => <option key={size} value={size}>{size} / halaman</option>)}
                </select>
                <button disabled={!data || page <= 1} onClick={() => setPage(page - 1)}>Sebelumnya</button>
                <span>Halaman {data?.current_page ?? 1} / {data?.last_page ?? 1}</span>
                <button disabled={!data || page >= data.last_page} onClick={() => setPage(page + 1)}>Berikutnya</button>
            </div>
        </div>
    );
}
