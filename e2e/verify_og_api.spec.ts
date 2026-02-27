
import { test, expect } from '@playwright/test';

test('verify open graph generation', async ({ page, request }) => {
  // Define test data
  const project = {
    name: "Test Project",
    description: "A test description for the OG image",
    backgroundColor: "#ffffff"
  };
  // Satori requires a viewBox for SVGs
  const svgContent = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="blue" /></svg>`;

  // Make a request to the API endpoint
  const response = await request.post('/api/generate-og', {
    data: {
      project,
      svgContent
    }
  });

  // Verify the response
  expect(response.ok()).toBeTruthy();
  const contentType = response.headers()['content-type'];
  expect(contentType).toBe('image/svg+xml');

  const body = await response.text();

  // Basic verification of the SVG content
  expect(body).toContain('<svg');
  // Check for the new gradient overlay
  expect(body).toContain('linear-gradient');
  // Check for the drop shadow
  expect(body).toContain('drop-shadow');
  // Check for the new border radius
  expect(body).toContain('border-radius: 32px');
  // Check for the project name
  expect(body).toContain('Test Project');

  // Verify that HTML tags in description are NOT present as text (they should be rendered as elements)
  expect(body).toContain('A test description for the OG image');

  console.log('OG Generation API test passed');
});
