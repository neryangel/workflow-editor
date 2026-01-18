// Load Testing Configuration - K6
// Run with: k6 run tests/load/k6-config.js

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 20 },   // Ramp up to 20 users
        { duration: '1m', target: 20 },    // Stay at 20 users
        { duration: '30s', target: 50 },   // Ramp up to 50 users
        { duration: '1m', target: 50 },    // Stay at 50 users
        { duration: '30s', target: 0 },    // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
        http_req_failed: ['rate<0.01'],    // Less than 1% failure rate
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
    // Health check
    const healthRes = http.get(`${BASE_URL}/api/health`);
    check(healthRes, {
        'health status is 200': (r) => r.status === 200,
        'health is healthy': (r) => r.json('status') === 'healthy',
    });

    sleep(1);

    // LLM API (mock mode)
    const llmRes = http.post(
        `${BASE_URL}/api/ai/llm`,
        JSON.stringify({ prompt: 'Hello world' }),
        { headers: { 'Content-Type': 'application/json' } }
    );
    check(llmRes, {
        'llm status is 200': (r) => r.status === 200,
        'llm has text': (r) => r.json('text') !== undefined,
    });

    sleep(1);

    // Run workflow
    const workflowRes = http.post(
        `${BASE_URL}/api/run-workflow`,
        JSON.stringify({
            nodes: [
                { id: 'n1', type: 'inputText', data: { text: 'test' } },
            ],
            edges: [],
        }),
        { headers: { 'Content-Type': 'application/json' } }
    );
    check(workflowRes, {
        'workflow status is 200': (r) => r.status === 200,
        'workflow success': (r) => r.json('success') === true,
    });

    sleep(1);
}

export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: '  ', enableColors: true }),
    };
}

function textSummary(data, options) {
    return `
Load Test Summary
=================
Total Requests: ${data.metrics.http_reqs.values.count}
Request Duration (p95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
Failed Requests: ${data.metrics.http_req_failed.values.rate * 100}%
`;
}
