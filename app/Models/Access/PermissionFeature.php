<?php

namespace App\Models\Access;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PermissionFeature extends Model
{
    protected $table = 'features';
    protected $primaryKey = 'featureId';
    public $incrementing = false;
    protected $keyType = 'string';
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    protected $fillable = ['groupFeatureId', 'name', 'path', 'menuType', 'ordering', 'isActive'];
    protected $casts = ['isActive' => 'boolean'];

    protected static function booted(): void
    {
        static::creating(fn (PermissionFeature $feature) => $feature->featureId ??= (string) Str::uuid());
    }

    public function group()
    {
        return $this->belongsTo(PermissionGroup::class, 'groupFeatureId', 'groupFeatureId');
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'roleFeatures', 'featureId', 'roleId', 'featureId', 'roleId')
            ->withPivot('roleFeatureId');
    }
}
