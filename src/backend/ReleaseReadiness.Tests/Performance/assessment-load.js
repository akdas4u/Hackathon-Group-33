// k6 load test for the Release Readiness AI Assistant API.
//
// Run against a locally running API (see ../../LocalSetup / docs):
//   k6 run assessment-load.js
//   k6 run -e BASE_URL=http://localhost:5080 -e RELEASE_ID=REL-2001 assessment-load.js
//
// Profile: ramp 0 -> 10 VUs over 30s, hold 100 VUs for 2 minutes, then ramp down.
// Thresholds: P95 request duration < 500ms, error rate < 1%.
// Two scenarios run concurrently: triggering an assessment, and fetching the cached report.

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5080';
const RELEASE_ID = __ENV.RELEASE_ID || 'REL-2001';
const USERNAME = __ENV.USERNAME || 'coordinator@demo.io';
const PASSWORD = __ENV.PASSWORD || 'Password123!';

const rampProfile = [
  { duration: '30s', target: 10 }, // ramp 0 -> 10 VUs
  { duration: '2m', target: 100 }, // hold 100 VUs for 2 minutes
  { duration: '30s', target: 0 }, // ramp down
];

export const options = {
  scenarios: {
    trigger_assessment: {
      executor: 'ramping-vus',
      exec: 'triggerAssessment',
      startVUs: 0,
      stages: rampProfile,
      gracefulRampDown: '10s',
    },
    fetch_report: {
      executor: 'ramping-vus',
      exec: 'fetchReport',
      startVUs: 0,
      stages: rampProfile,
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

/** Logs in once and shares the access token across every VU via k6's setup() data. */
export function setup() {
  const loginRes = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ username: USERNAME, password: PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(loginRes, { 'setup: login succeeded': (r) => r.status === 200 });

  return { token: loginRes.json('accessToken') };
}

function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
}

export function triggerAssessment(data) {
  const res = http.post(`${BASE_URL}/api/v1/releases/${RELEASE_ID}/assess`, null, authHeaders(data.token));

  check(res, {
    'assess: status is 200': (r) => r.status === 200,
    'assess: response has a decision': (r) => {
      const body = r.json();
      return body && typeof body.decision === 'string';
    },
  });

  sleep(1);
}

export function fetchReport(data) {
  const res = http.get(`${BASE_URL}/api/v1/releases/${RELEASE_ID}/report`, authHeaders(data.token));

  check(res, {
    // The report may not exist yet if this VU races ahead of the first assessment.
    'report: status is 200 or 404': (r) => r.status === 200 || r.status === 404,
  });

  sleep(1);
}
