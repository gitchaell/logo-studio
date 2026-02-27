import type { APIRoute } from 'astro';
import satori from 'satori';
import { html } from 'satori-html';
import fs from 'node:fs/promises';
import path from 'node:path';

export const prerender = false;

function getContrastingTextColor(hex: string): string {
  const cleanHex = hex.replace('#', '');
  let r = 0, g = 0, b = 0;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else {
    return '#000000';
  }
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 128 ? '#000000' : '#ffffff';
}

export const POST: APIRoute = async ({ request }) => {
  console.log('[API] generate-og called');
  try {
    const { project, svgContent } = await request.json();
    const { backgroundColor, name, description } = project;
    const bg = backgroundColor || '#ffffff';
    const textColor = getContrastingTextColor(bg);

    const base64Logo = Buffer.from(svgContent).toString('base64');
    const logoDataUri = `data:image/svg+xml;base64,${base64Logo}`;

    let fontData;
    try {
         const fontPath = path.join(process.cwd(), 'public/fonts/google-sans/GoogleSans-Bold.ttf');
         fontData = await fs.readFile(fontPath);
    } catch (e) {
         throw new Error('Font load failed');
    }

    // Attempt 1: Full layout with Logo + Text.
    try {
        const markup = {
            type: 'div',
            props: {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                    backgroundColor: bg,
                    padding: '80px',
                    justifyContent: 'space-between',
                    fontFamily: 'CustomFont',
                },
                children: [
                     {
                        type: 'img',
                        props: {
                            src: logoDataUri,
                            width: '200',
                            height: '200',
                            style: {
                                objectFit: 'contain',
                            },
                        },
                    },
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                            },
                            children: [
                                {
                                    type: 'div',
                                    props: {
                                        children: name,
                                        style: {
                                            color: textColor,
                                            fontSize: '80px',
                                            fontWeight: 700,
                                            lineHeight: 1.05,
                                        },
                                    },
                                },
                                {
                                    type: 'div',
                                    props: {
                                        children: description || '',
                                        style: {
                                            color: textColor,
                                            fontSize: '36px',
                                            fontWeight: 700,
                                            opacity: 0.85,
                                            marginTop: '32px',
                                            lineHeight: 1.4,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        };

        const svg = await satori(markup as any, {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: 'CustomFont',
                    data: fontData,
                    weight: 700,
                    style: 'normal',
                },
            ],
        });

        return new Response(svg, {
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });

    } catch (innerError) {
        console.warn('Full OG generation failed, trying Logo-only as per user request...', innerError);

        // Fallback: Logo Only (Centered, large)
        // User requested: "solo muestra el logo como fallback, pero prioriza que se vea el opengraph que quiero"
        try {
            const markupLogo = {
                type: 'div',
                props: {
                    style: {
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        backgroundColor: bg,
                        alignItems: 'center',
                        justifyContent: 'center',
                    },
                     children: [
                        {
                            type: 'img',
                            props: {
                                src: logoDataUri,
                                width: '600', // Larger for centered logo
                                height: '600',
                                style: {
                                    objectFit: 'contain',
                                },
                            },
                        },
                    ],
                },
            };
            const svgLogo = await satori(markupLogo as any, {
                width: 1200,
                height: 630,
                fonts: [
                    {
                        name: 'CustomFont',
                        data: fontData,
                        weight: 700,
                        style: 'normal',
                    },
                ],
            });
            return new Response(svgLogo, {
                headers: {
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
            });
        } catch (fallbackError) {
             console.error('Logo-only fallback failed too. Trying Text-only...', fallbackError);

             // Fallback 2: Text Only (If logo fails too)
             try {
                const markupText = {
                    type: 'div',
                    props: {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            height: '100%',
                            backgroundColor: bg,
                            padding: '80px',
                            justifyContent: 'center',
                            fontFamily: 'CustomFont',
                        },
                        children: [
                             {
                                type: 'div',
                                props: {
                                    children: name,
                                    style: {
                                        color: textColor,
                                        fontSize: '80px',
                                        fontWeight: 700,
                                        textAlign: 'center',
                                    },
                                },
                            },
                        ],
                    },
                };
                const svgText = await satori(markupText as any, {
                    width: 1200,
                    height: 630,
                    fonts: [
                        {
                            name: 'CustomFont',
                            data: fontData,
                            weight: 700,
                            style: 'normal',
                        },
                    ],
                });
                 return new Response(svgText, {
                    headers: {
                        'Content-Type': 'image/svg+xml',
                        'Cache-Control': 'public, max-age=31536000, immutable',
                    },
                });
             } catch (finalError) {
                 console.error('All fallbacks failed', finalError);
                 throw finalError;
             }
        }
    }

  } catch (error) {
    console.error('OG Generation Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate OG image', details: error instanceof Error ? error.message : String(error) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
};
