import { useState } from "react";
import type { Role } from "../../../types/role";
import RoleForm from "./RoleForm";
import RoleList from "./RoleList";

type Props = {
    token: string;
    canManage: boolean;
};

export default function RolePage({ token, canManage }: Props) {
    const [editing, setEditing] = useState<Role | null>(null);
    const [formVisible, setFormVisible] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [notice, setNotice] = useState("");

    const openForm = (role?: Role) => {
        setEditing(role ?? null);
        setNotice("");
        setFormVisible(true);
    };

    const closeForm = () => {
        setFormVisible(false);
        setEditing(null);
    };

    const handleSaved = (message: string) => {
        closeForm();
        setNotice(message);
        setRefreshKey(value => value + 1);
    };

    const handleDeleted = () => {
        setNotice("Role berhasil dihapus.");
        setRefreshKey(value => value + 1);
    };

    return (
        <>
            <div className="access-heading">
                <div>
                    <h1 className="text-lg">Manajemen Role</h1>
                </div>
            </div>

            {notice && !formVisible && (
                <div className="alert success">
                    {notice}
                    <button onClick={() => setNotice("")}>×</button>
                </div>
            )}

            {formVisible ? (
                <RoleForm
                    token={token}
                    role={editing}
                    onSaved={handleSaved}
                    onCancel={closeForm}
                />
            ) : (
                <RoleList
                    token={token}
                    canManage={canManage}
                    refreshKey={refreshKey}
                    onAdd={() => openForm()}
                    onEdit={openForm}
                    onDeleted={handleDeleted}
                />
            )}
        </>
    );
}
