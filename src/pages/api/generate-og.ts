import type { APIRoute } from 'astro';
import satori from 'satori';
import { html } from 'satori-html';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  console.log('[API] generate-og called');
  try {
    const { project, svgContent } = await request.json();
    const { backgroundColor, name, description } = project;

    // Ensure background color is valid or fallback to white
    const bg = backgroundColor || '#ffffff';

    // Prepare logo data URI
    const logoDataUri = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;

    // Construct HTML string first to avoid escaping issues with satori-html template literal
    const template = `
    <div style="display: flex; width: 100%; height: 100%; background-color: ${bg}; align-items: center; justify-content: center; position: relative; font-family: 'Inter', sans-serif;">
        <!-- Background Overlay for Depth (Subtle Gradient) -->
        <div style="display: flex; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to bottom right, rgba(255,255,255,0.1), rgba(0,0,0,0.05));"></div>

        <!-- Centered Logo Area -->
        <div style="display: flex; align-items: center; justify-content: center; width: 65%; height: 60%;">
             <img src="${logoDataUri}" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 20px 40px rgba(0,0,0,0.15));" />
        </div>

        <!-- Bottom Floating Card for Project Info -->
        <div style="display: flex; position: absolute; bottom: 48px; left: 48px; right: 48px; background-color: rgba(255, 255, 255, 0.95); border: 1px solid rgba(255,255,255,0.8); border-radius: 32px; padding: 32px 48px; box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.18); align-items: center; justify-content: space-between;">
             <div style="display: flex; flex-direction: column; width: 100%;">
                 <h1 style="font-size: 56px; font-weight: 900; color: #0f172a; margin: 0; line-height: 1.1; letter-spacing: -0.02em;">${name}</h1>
                 ${description ? `<p style="font-size: 28px; color: #475569; margin-top: 12px; margin-bottom: 0; line-height: 1.5; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${description}</p>` : ''}
             </div>
             <!-- Decorative Element (Optional) -->
             <div style="display: flex; width: 12px; height: 12px; background-color: #cbd5e1; border-radius: 50%; margin-left: 24px;"></div>
        </div>
    </div>
    `;

    const markup = html(template);

    // Fetch font (Use TTF/WOFF to avoid WOFF2 issues in satori)
    let fontData;
    try {
        const fontRes = await fetch('https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-800-normal.woff');
        if (!fontRes.ok) {
            throw new Error(`Failed to load font: ${fontRes.statusText}`);
        }
        fontData = await fontRes.arrayBuffer();
    } catch (fontError) {
        console.error('Font loading failed:', fontError);
        throw fontError;
    }

    const svg = await satori(markup, {
        width: 1200,
        height: 630,
        fonts: [
            {
                name: 'Inter',
                data: fontData,
                weight: 800,
                style: 'normal',
            },
        ],
    });

    return new Response(svg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            // Add Cache-Control if desired
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    });
  } catch (error) {
    console.error('OG Generation Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate OG image' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
};
