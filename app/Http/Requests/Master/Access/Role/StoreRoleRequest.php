<?php

namespace App\Http\Requests\Master\Access\Role;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        // The FE sends snake_case; the Role model/database use camelCase.
        if ($this->has('is_active') && !$this->has('isActive')) {
            $this->merge(['isActive' => $this->input('is_active')]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'isActive' => ['sometimes', 'boolean'],
        ];
    }
}
