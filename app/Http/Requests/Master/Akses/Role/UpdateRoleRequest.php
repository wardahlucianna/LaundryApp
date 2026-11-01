<?php

namespace App\Http\Requests\Master\Akses;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $role = $this->route('role');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:60',
                'alpha_dash',
                Rule::unique('roles', 'code')->ignore($role?->id),
            ],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
