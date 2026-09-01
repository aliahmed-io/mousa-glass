import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5s', target: 50 },  // Ramp up to 50 concurrent VUs
    { duration: '15s', target: 50 }, // Sustain peak 50 VUs load
    { duration: '5s', target: 0 },   // Graceful ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300', 'p(99)<500'], // 95% of requests < 300ms, 99% < 500ms
    http_req_failed: ['rate<0.01'],                 // Strict error rate below 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // 1. Storefront Home HTML & SSR
  const homeRes = http.get(`${BASE_URL}/`);
  check(homeRes, {
    'storefront HTML status is 200': (r) => r.status === 200,
  });

  // 2. Categories Taxonomy API
  const catRes = http.get(`${BASE_URL}/api/trpc/categories.list`);
  check(catRes, {
    'categories API status is 200': (r) => r.status === 200,
  });

  // 3. Featured 6 Luxury Products API
  const featRes = http.get(`${BASE_URL}/api/trpc/products.featured`);
  check(featRes, {
    'featured products status is 200': (r) => r.status === 200,
  });

  // 4. Products Catalog (Page 1 of 50 products)
  const page1Res = http.get(`${BASE_URL}/api/trpc/products.list?input=${encodeURIComponent(JSON.stringify({ json: { page: 1, limit: 12 } }))}`);
  check(page1Res, {
    'catalog page 1 status is 200': (r) => r.status === 200,
  });

  // 5. Products Catalog (Page 2 of 50 products)
  const page2Res = http.get(`${BASE_URL}/api/trpc/products.list?input=${encodeURIComponent(JSON.stringify({ json: { page: 2, limit: 12 } }))}`);
  check(page2Res, {
    'catalog page 2 status is 200': (r) => r.status === 200,
  });

  // 6. Category Filtering (Shower Accessories - categoryId 2)
  const catFilterRes = http.get(`${BASE_URL}/api/trpc/products.list?input=${encodeURIComponent(JSON.stringify({ json: { categoryId: 2 } }))}`);
  check(catFilterRes, {
    'category filter status is 200': (r) => r.status === 200,
  });

  // 7. Search Query API (Arabic search across 50 products)
  const searchRes = http.get(`${BASE_URL}/api/trpc/products.list?input=${encodeURIComponent(JSON.stringify({ json: { search: "زجاج" } }))}`);
  check(searchRes, {
    'search query status is 200': (r) => r.status === 200,
  });

  // 8. Individual Product Details
  const prodByIdRes = http.get(`${BASE_URL}/api/trpc/products.byId?input=${encodeURIComponent(JSON.stringify({ json: { id: 1 } }))}`);
  check(prodByIdRes, {
    'product by ID status is 200': (r) => r.status === 200,
  });

  sleep(0.3);
}

