import React from "react";

export type PermissionFormValue = {
    name: string;
    code: string;
    path: string;
};

type PermissionFormModalProps = {
    open: boolean;
    editing: boolean;
    value: PermissionFormValue;
    busy?: boolean;
    onChange: (value: PermissionFormValue) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onClose: () => void;
};

export default function PermissionFormModal({
    open,
    editing,
    value,
    busy = false,
    onChange,
    onSubmit,
    onClose,
}: PermissionFormModalProps) {
    if (!open) return null;

    return (
        <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
            <section className="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="permission-modal-title" onMouseDown={event => event.stopPropagation()}>
                <div className="modal-heading">
                    <div>
                        <small>MASTER FITUR</small>
                        <h2 id="permission-modal-title">{editing ? "Ubah Fitur" : "Tambah Fitur"}</h2>
                        <p>{editing ? "Perbarui informasi fitur." : "Masukkan nama, kode, dan path fitur."}</p>
                    </div>
                    <button type="button" className="modal-close" onClick={onClose} aria-label="Tutup">×</button>
                </div>
                <form className="modal-form" onSubmit={onSubmit}>
                    <label>Nama Fitur
                        <input value={value.name} onChange={event => onChange({ ...value, name: event.target.value })} placeholder="Contoh: Manajemen Pelanggan" required autoFocus />
                    </label>
                    <label>Kode Fitur
                        <input value={value.code} onChange={event => onChange({ ...value, code: event.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "_") })} placeholder="CUSTOMER_VIEW" required />
                    </label>
                    <label>Path Menu
                        <input value={value.path} onChange={event => onChange({ ...value, path: event.target.value })} placeholder="/customers" />
                    </label>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>Batal</button>
                        <button className="btn-primary" disabled={busy}>{busy ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Simpan Fitur"}</button>
                    </div>
                </form>
            </section>
        </div>
    );
}
