import type { Permission } from "../../fitur/permission/types/permission";

export type Role = {
    id: string;
    name: string;
    code: string;
    is_active: boolean;
    permissions_count?: number;
    permissions?: Permission[];
};

export type RoleFormValue = {
    name: string;
    code: string;
};
