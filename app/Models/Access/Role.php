<?php

namespace App\Models\Access;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Role extends Model
{
    protected $table = 'roles';
    protected $primaryKey = 'rolesId';
    public $incrementing = false;
    protected $keyType = 'string';
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    protected $fillable = ['name', 'isActive'];
    protected $casts = ['isActive' => 'boolean'];

    protected static function booted(): void
    {
        static::creating(fn (Role $role) => $role->rolesId ??= (string) Str::uuid());
    }

    public function features()
    {
        return $this->belongsToMany(PermissionFeature::class, 'roleFeatures', 'roleId', 'featureId', 'rolesId', 'featureId')
            ->withPivot('roleFeaturesId', 'createdAt', 'updatedAt');
    }

    public function users()
    {
        return $this->hasMany(User::class, 'roleId', 'rolesId');
    }
}
