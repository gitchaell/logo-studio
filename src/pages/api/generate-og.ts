import type { APIRoute } from 'astro';
import satori from 'satori';
import { html } from 'satori-html';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { project, svgContent } = await request.json();
    const { backgroundColor } = project;

    const markup = html`
    <div style="display: flex; flex-direction: column; width: 100%; height: 100%; background-color: #f0f2f5; align-items: center; justify-content: center; font-family: 'Inter', sans-serif;">
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: ${backgroundColor || 'white'}; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
             <div style="width: 256px; height: 256px; display: flex; align-items: center; justify-content: center;">
                <img src="${'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgContent)))}" width="256" height="256" />
             </div>
             <h1 style="font-size: 48px; font-weight: bold; color: #1e293b; margin-top: 24px; margin-bottom: 8px;">${project.name}</h1>
             <p style="font-size: 24px; color: #64748b;">${project.description || 'Designed with Logo Studio'}</p>
        </div>
    </div>
    `;

    // Fetch font (Use TTF from Google Fonts to avoid WOFF2 issues in satori)
    const fontRes = await fetch('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.ttf');
    if (!fontRes.ok) {
        throw new Error(`Failed to load font: ${fontRes.statusText}`);
    }
    const fontData = await fontRes.arrayBuffer();

    const svg = await satori(markup, {
        width: 1200,
        height: 630,
        fonts: [
            {
                name: 'Inter',
                data: fontData,
                weight: 700,
                style: 'normal',
            },
        ],
    });

    return new Response(svg, {
        headers: {
            'Content-Type': 'image/svg+xml',
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
