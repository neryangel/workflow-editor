// Health Check API Route
import { NextResponse } from 'next/server';

interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    version: string;
    checks: {
        api: boolean;
        environment: boolean;
    };
}

export async function GET() {
    const health: HealthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '0.1.0',
        checks: {
            api: true,
            environment: !!process.env.NODE_ENV,
        },
    };

    // Determine overall status
    const allChecks = Object.values(health.checks);
    if (allChecks.every((c) => c)) {
        health.status = 'healthy';
    } else if (allChecks.some((c) => c)) {
        health.status = 'degraded';
    } else {
        health.status = 'unhealthy';
    }

    return NextResponse.json(health, {
        status: health.status === 'unhealthy' ? 503 : 200,
    });
}
