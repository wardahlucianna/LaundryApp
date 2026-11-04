<?php

namespace App\Models\Access;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PermissionGroup extends Model
{
    protected $table = 'groupFeature';
    protected $primaryKey = 'groupFeatureId';
    public $incrementing = false;
    protected $keyType = 'string';
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    protected $fillable = ['name', 'icon', 'ordering', 'isActive'];
    protected $casts = ['isActive' => 'boolean'];

    protected static function booted(): void
    {
        static::creating(fn (PermissionGroup $group) => $group->groupFeatureId ??= (string) Str::uuid());
    }

    public function features()
    {
        return $this->hasMany(PermissionFeature::class, 'groupFeatureId', 'groupFeatureId');
    }
}
