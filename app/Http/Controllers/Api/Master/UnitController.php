<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UnitController extends Controller
{
    public function index(Request $request)
    {
        $query = Unit::query()
            ->select(['unitId', 'name', 'symbol', 'isActive'])
            ->orderBy('name');

        if ($search = trim($request->string('search')->toString())) {
            $query->where(fn ($q) => $q
                ->where('name', 'ilike', "%{$search}%")
                ->orWhere('symbol', 'ilike', "%{$search}%"));
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
        $unit = Unit::create($data);

        return response()->json(['data' => $unit], 201);
    }

    public function show(Unit $unit)
    {
        return response()->json(['data' => $unit]);
    }

    public function update(Request $request, Unit $unit)
    {
        $unit->update($this->validatedData($request));

        return response()->json(['data' => $unit->fresh()]);
    }

    public function destroy(Unit $unit)
    {
        $unit->delete();

        return response()->json(['message' => 'Satuan berhasil dihapus.']);
    }

    private function validatedData(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'symbol' => ['required', 'string', 'max:20'],
            'isActive' => ['sometimes', 'boolean'],
        ]);
    }
}
