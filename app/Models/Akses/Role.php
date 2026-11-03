<?php

namespace App\Models\Akses;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Role extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['name', 'code', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];

    protected static function booted(): void
    {
        static::creating(function (Role $role) {
            $role->id ??= (string) Str::uuid();
        });
    }

    public function features()
    {
        return $this->belongsToMany(PermissionFeature::class, 'role_permission_features', 'role_id', 'permission_feature_id');
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
