<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\Outlet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class OutletController extends Controller
{
    public function index(Request $request)
    {
        $query = Outlet::query()
            ->select([
                'outletId', 'code', 'name', 'address', 'whatsapp', 'email',
                'isPrimary', 'isActive', 'ordering', 'openingTime', 'closingTime',
            ])
            ->orderByDesc('isPrimary')
            ->orderBy('ordering')
            ->orderBy('name');

        if ($search = trim($request->string('search')->toString())) {
            $query->where(fn ($q) => $q
                ->where('code', 'ilike', "%{$search}%")
                ->orWhere('name', 'ilike', "%{$search}%")
                ->orWhere('address', 'ilike', "%{$search}%"));
        }

        if ($request->has('isActive')) {
            $query->where('isActive', $request->boolean('isActive'));
        }

        $paginator = $query->paginate(min(max($request->integer('per_page', 10), 1), 100));

        return response()->json([
            'data' => $paginator->items(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validatedData($request);
        $outlet = DB::transaction(function () use ($data) {
            if ($data['isPrimary'] ?? false) {
                Outlet::query()->lockForUpdate()->update(['isPrimary' => false]);
            }
            return Outlet::create($data);
        });

        return response()->json(['data' => $outlet], 201);
    }

    public function show(Outlet $outlet)
    {
        return response()->json(['data' => $outlet]);
    }

    public function update(Request $request, Outlet $outlet)
    {
        $data = $this->validatedData($request, $outlet);
        $updated = DB::transaction(function () use ($data, $outlet) {
            if ($data['isPrimary'] ?? false) {
                Outlet::query()->where('outletId', '!=', $outlet->outletId)
                    ->lockForUpdate()->update(['isPrimary' => false]);
            }
            $outlet->update($data);
            return $outlet->fresh();
        });

        return response()->json(['data' => $updated]);
    }

    public function destroy(Outlet $outlet)
    {
        if ($outlet->isPrimary) {
            return response()->json(['message' => 'Outlet utama tidak dapat dihapus. Tetapkan outlet utama lain terlebih dahulu.'], 422);
        }

        $outlet->delete();
        return response()->json(['message' => 'Outlet berhasil dihapus.']);
    }

    private function validatedData(Request $request, ?Outlet $outlet = null): array
    {
        $data = $request->validate([
            'code' => ['sometimes', 'nullable', 'string', 'max:30', Rule::unique('outlets', 'code')->ignore($outlet?->outletId, 'outletId')],
            'name' => ['required', 'string', 'max:120'],
            'address' => ['nullable', 'string', 'max:2000'],
            'whatsapp' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:120'],
            'isPrimary' => ['sometimes', 'boolean'],
            'isActive' => ['sometimes', 'boolean'],
            'ordering' => ['sometimes', 'integer', 'min:1'],
            'openingTime' => ['nullable', 'date_format:H:i'],
            'closingTime' => ['nullable', 'date_format:H:i'],
        ]);

        if (!$outlet && empty($data['code'])) {
            do {
                $data['code'] = 'OUT-' . Str::upper(Str::random(8));
            } while (Outlet::query()->where('code', $data['code'])->exists());
        }

        return $data;
    }
}
