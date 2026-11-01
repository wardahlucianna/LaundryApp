import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Pencil, Plus, RotateCcw, Search, Trash2, X } from "lucide-react";
import { request } from "../../../../lib/api/request";
import type { Permission } from "../../../types/permission";
import type { Page } from "../../../../types/pagination";
import Pagination from "../../../components/common/Pagination";

type Props = {
    token: string;
    canManage: boolean;
    refreshKey: number;
    onAdd: () => void;
    onEdit: (permission: Permission) => void;
    onDeleted: () => void;
};

export default function PermissionList({
    token,
    canManage,
    refreshKey,
    onAdd,
    onEdit,
    onDeleted,
}: Props) {
    const [data, setData] = useState<Page<Permission> | null>(null);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<Permission | null>(null);

    const load = useCallback(async () => {
        const query = new URLSearchParams({
            page: String(page),
            per_page: String(perPage),
        });

        if (search) query.set("search", search);
        if (status !== "") query.set("is_active", status);

        const result = await request<Page<Permission>>(
            `/permissions?${query.toString()}`,
            token,
        );

        setData(result);
    }, [token, page, perPage, search, status, refreshKey]);

    useEffect(() => {
        load().catch(error => setError((error as Error).message));
    }, [load]);

    const confirmDelete = async () => {
        if (!deleteTarget || busy) return;

        setBusy(true);
        setError("");

        try {
            await request(`/permissions/${deleteTarget.id}`, token, {
                method: "DELETE",
            });

            if ((data?.data.length ?? 0) === 1 && page > 1) {
                setPage(value => value - 1);
            } else {
                onDeleted();
            }
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setBusy(false);
            setDeleteTarget(null);
        }
    };

    const applySearch = () => {
        setPage(1);
        setSearch(searchInput.trim());
    };

    const resetFilters = () => {
        setSearchInput("");
        setSearch("");
        setStatus("");
        setPage(1);
    };

    return (
        <>
            {error && (
                <div className="alert error">
                    {error}
                    <button onClick={() => setError("")}>×</button>
                </div>
            )}

            {deleteTarget && (
                <div
                    className="delete-modal-backdrop"
                    onClick={() => !busy && setDeleteTarget(null)}
                >
                    <section
                        className="delete-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-modal-title"
                        onClick={event => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="delete-modal-close"
                            aria-label="Tutup"
                            disabled={busy}
                            onClick={() => setDeleteTarget(null)}
                        >
                            <X size={18} />
                        </button>
                        <div className="delete-modal-icon">
                            <AlertTriangle size={25} />
                        </div>
                        <h2 id="delete-modal-title">Hapus fitur?</h2>
                        <p>
                            Apakah kamu yakin ingin menghapus fitur{" "}
                            <strong>“{deleteTarget.name}”</strong>? Tindakan ini tidak dapat
                            dibatalkan.
                        </p>
                        <div className="delete-modal-actions">
                            <button
                                type="button"
                                className="btn-secondary"
                                disabled={busy}
                                onClick={() => setDeleteTarget(null)}
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                className="delete-confirm-button"
                                disabled={busy}
                                onClick={confirmDelete}
                            >
                                <Trash2 size={15} />
                                {busy ? "Menghapus..." : "Ya, Hapus"}
                            </button>
                        </div>
                    </section>
                </div>
            )}

            <div className="access-panel">
                <div className="panel-heading">
                    <div>
                        <h2>Daftar Fitur</h2>
                    </div>

                    <div className="heading-actions">
                        {canManage && (
                            <button className="btn-primary" onClick={onAdd}>
                                <Plus size={15} />
                                Tambah Fitur
                            </button>
                        )}
                    </div>
                </div>

                <div className="list-toolbar access-toolbar">
                    <input
                        value={searchInput}
                        onChange={event => setSearchInput(event.target.value)}
                        onKeyDown={event => event.key === "Enter" && applySearch()}
                        placeholder="Cari nama, kode, atau path fitur..."
                    />

                    <select
                        value={status}
                        onChange={event => {
                            setStatus(event.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">Semua Status</option>
                        <option value="1">Aktif</option>
                        <option value="0">Nonaktif</option>
                    </select>

                    <button className="btn-primary" onClick={applySearch}>
                        <Search size={15} />
                        Cari
                    </button>

                    <button className="btn-secondary" onClick={resetFilters}>
                        <RotateCcw size={15} />
                        Atur Ulang
                    </button>
                </div>

                <div className="table-wrap">
                    <table className="access-table">
                        <thead>
                            <tr>
                                <th>NO</th>
                                <th>NAMA FITUR</th>
                                <th>KODE</th>
                                <th>PATH MENU</th>
                                <th>STATUS</th>
                                <th>AKSI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.data.map((permission, index) => (
                                <tr key={permission.id}>
                                    <td>{(page - 1) * perPage + index + 1}</td>
                                    <td><b>{permission.name}</b></td>
                                    <td>{permission.code}</td>
                                    <td>{permission.path || "—"}</td>
                                    <td>
                                        <span className={permission.is_active ? "pill active" : "pill"}>
                                            {permission.is_active ? "Aktif" : "Nonaktif"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="row-actions">
                                            {canManage && (
                                                <>
                                                    <button
                                                        className="icon-action"
                                                        title="Edit"
                                                        onClick={() => onEdit(permission)}
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        className="icon-action danger"
                                                        title="Hapus"
                                                        disabled={busy}
                                                        onClick={() => setDeleteTarget(permission)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {!data?.data.length && (
                                <tr>
                                    <td colSpan={6} className="empty-cell">
                                        Belum ada data fitur.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    data={data}
                    page={page}
                    setPage={setPage}
                    perPage={perPage}
                    setPerPage={setPerPage}
                />
            </div>
        </>
    );
}
