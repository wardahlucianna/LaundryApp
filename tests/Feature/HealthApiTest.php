<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthApiTest extends TestCase
{
    public function test_health_endpoint_returns_success(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('application', 'Sunrise Laundry');
    }
}
