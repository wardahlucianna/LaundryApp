<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\ServiceType;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ServiceTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = ServiceType::query()
            ->select(['serviceTypeId', 'name', 'description', 'isActive'])
            ->orderBy('name');

        if ($search = trim($request->string('search')->toString())) {
            $query->where(fn ($q) => $q
                ->where('name', 'ilike', "%{$search}%")
                ->orWhere('description', 'ilike', "%{$search}%"));
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
        $serviceType = ServiceType::create($this->validatedData($request));

        return response()->json(['data' => $serviceType], 201);
    }

    public function show(ServiceType $serviceType)
    {
        return response()->json(['data' => $serviceType]);
    }

    public function update(Request $request, ServiceType $serviceType)
    {
        $serviceType->update($this->validatedData($request, $serviceType));

        return response()->json(['data' => $serviceType->fresh()]);
    }

    public function destroy(ServiceType $serviceType)
    {
        $serviceType->delete();

        return response()->json(['message' => 'Jenis layanan berhasil dihapus.']);
    }

    private function validatedData(Request $request, ?ServiceType $serviceType = null): array
    {
        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('serviceTypes', 'name')->ignore($serviceType?->serviceTypeId, 'serviceTypeId'),
            ],
            'description' => ['nullable', 'string', 'max:500'],
            'isActive' => ['sometimes', 'boolean'],
        ]);
    }
}
