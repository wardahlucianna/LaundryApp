<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ServiceType extends Model
{
    protected $table = 'serviceTypes';
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';
    protected $primaryKey = 'serviceTypeId';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['name', 'isActive'];

    protected $casts = [
        'isActive' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(fn (ServiceType $serviceType) => $serviceType->serviceTypeId ??= (string) Str::uuid());
    }
}
