<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Outlet extends Model
{
    protected $table = 'outlets';
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';
    protected $primaryKey = 'outletId';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name', 'address', 'whatsapp',
        'isPrimary', 'isActive',
    ];

    protected $casts = [
        'isPrimary' => 'boolean',
        'isActive' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(fn (Outlet $outlet) => $outlet->outletId ??= (string) Str::uuid());
    }
}
