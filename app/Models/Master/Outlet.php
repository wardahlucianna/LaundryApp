<?php

namespace App\\Models\\Master;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Support\\Str;

class Outlet extends Model
{
    protected $table = 'outlets';
    protected $primaryKey = 'outletId';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'code', 'name', 'address', 'whatsapp', 'email',
        'isPrimary', 'isActive', 'ordering', 'openingTime', 'closingTime',
    ];

    protected $casts = [
        'isPrimary' => 'boolean',
        'isActive' => 'boolean',
        'ordering' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(fn (Outlet $outlet) => $outlet->outletId ??= (string) Str::uuid());
    }
}
