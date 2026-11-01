import React from "react";
import type { RoleFormValue } from "../types/role";

type RoleFormModalProps = {
    open: boolean;
    editing: boolean;
    value: RoleFormValue;
    busy?: boolean;
    onChange: (value: RoleFormValue) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onClose: () => void;
};

export default function RoleFormModal({
    open,
    editing,
    value,
    busy = false,
    onChange,
    onSubmit,
    onClose,
}: RoleFormModalProps) {
    if (!open) return null;

    return (
        <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
            <section className="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="role-modal-title" onMouseDown={event => event.stopPropagation()}>
                <div className="modal-heading">
                    <div>
                        <small>MASTER AKSES</small>
                        <h2 id="role-modal-title">{editing ? "Ubah Role" : "Tambah Role"}</h2>
                        <p>{editing ? "Perbarui informasi role." : "Masukkan nama dan kode role baru."}</p>
                    </div>
                    <button type="button" className="modal-close" onClick={onClose} aria-label="Tutup">×</button>
                </div>
                <form className="modal-form" onSubmit={onSubmit}>
                    <label>Nama Role
                        <input value={value.name} onChange={event => onChange({ ...value, name: event.target.value })} placeholder="Contoh: Administrator" required autoFocus />
                    </label>
                    <label>Kode Role
                        <input value={value.code} onChange={event => onChange({ ...value, code: event.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "_") })} placeholder="CONTOH_ROLE" required />
                    </label>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>Batal</button>
                        <button className="btn-primary" disabled={busy}>{busy ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Simpan Role"}</button>
                    </div>
                </form>
            </section>
        </div>
    );
}
