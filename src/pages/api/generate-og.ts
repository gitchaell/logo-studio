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

    const markup = html`
    <div style="display: flex; width: 100%; height: 100%; background-color: ${bg}; align-items: center; justify-content: center; position: relative; font-family: 'Inter', sans-serif;">
        <!-- Centered Logo Area -->
        <div style="display: flex; align-items: center; justify-content: center; width: 80%; height: 50%;">
             <img src="${logoDataUri}" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>

        <!-- Bottom Floating Card for Project Info -->
        <div style="display: flex; position: absolute; bottom: 40px; width: 90%; background-color: rgba(255, 255, 255, 0.95); border-radius: 24px; padding: 32px 40px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); align-items: center; justify-content: space-between;">
             <div style="display: flex; flex-direction: column; width: 100%;">
                 <h1 style="font-size: 48px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1;">${name}</h1>
                 ${description ? `<p style="font-size: 24px; color: #475569; margin-top: 12px; margin-bottom: 0; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${description}</p>` : ''}
             </div>
        </div>
    </div>
    `;

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
        // Fallback or error re-throw if critical
        // We can proceed without custom font if needed, but it looks bad.
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
