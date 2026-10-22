import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const metadata = new Trend('takura_metadata_duration', true);
export const options = {
  scenarios: { representative: { executor: 'constant-vus', vus: 20, duration: '2m' } },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    takura_metadata_duration: ['p(95)<1000'],
  },
};
const base = __ENV.TAKURA_BASE_URL || 'http://127.0.0.1:8080';

export default function () {
  const response = http.get(`${base}/api/v1/catalogue/boards?page_size=12`, {
    headers: { 'X-Correlation-Id': `load-${__VU}-${__ITER}` },
    tags: { operation: 'catalogue_metadata' },
  });
  metadata.add(response.timings.duration);
  check(response, { 'catalogue returned': (r) => r.status === 200 });
  sleep(0.25);
}
