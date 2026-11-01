import { useState } from "react";
import type { Role } from "../../../../features/master/akses/role/types/role";
import RoleForm from "./RoleForm";
import RoleList from "./RoleList";
type Props = { token: string; canManage: boolean };
export default function RolePage({ token, canManage }: Props) {
 const [editing,setEditing]=useState<Role|null>(null), [formVisible,setFormVisible]=useState(false), [refreshKey,setRefreshKey]=useState(0), [notice,setNotice]=useState("");
 const openForm=(role?:Role)=>{setEditing(role??null);setNotice("");setFormVisible(true);};
 const closeForm=()=>{setFormVisible(false);setEditing(null);};
 const saved=(message:string)=>{closeForm();setNotice(message);setRefreshKey(v=>v+1);};
 return <><div className="access-heading"><div><small>MASTER DATA</small><h1>{formVisible?(editing?"Ubah Role":"Tambah Role"):"Manajemen Role"}</h1><p>{formVisible?"Lengkapi informasi role.":"Kelola kelompok pengguna dan perannya."}</p></div></div>{notice&&!formVisible&&<div className="alert success">{notice}<button onClick={()=>setNotice("")}>×</button></div>}{formVisible?<RoleForm token={token} role={editing} onSaved={saved} onCancel={closeForm}/>:<RoleList token={token} canManage={canManage} refreshKey={refreshKey} onAdd={()=>openForm()} onEdit={openForm} onDeleted={()=>{setNotice("Role berhasil dihapus.");setRefreshKey(v=>v+1);}}/>}</>;
}