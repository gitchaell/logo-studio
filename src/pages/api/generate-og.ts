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

    // Helper to ensure SVG is valid and has dimensions
    const fixSvgAttributes = (svg: string) => {
        let fixed = svg.trim();
        if (!fixed.includes('xmlns="http://www.w3.org/2000/svg"')) {
            fixed = fixed.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if (!fixed.includes('width=') && !fixed.includes('viewBox')) {
            fixed = fixed.replace('<svg', '<svg width="512" height="512" viewBox="0 0 512 512"');
        }
        return fixed;
    };

    const cleanSvg = fixSvgAttributes(svgContent);
    // Parse SVG string to VDOM using satori-html
    // This embeds the SVG directly instead of using an image tag, which can be more reliable for some SVGs
    // However, we need to make sure we wrap it correctly.
    let logoVdom;
    try {
        logoVdom = html(cleanSvg);
    } catch (e) {
        console.warn('Failed to parse SVG with satori-html, falling back to img tag', e);
    }

    const base64Logo = Buffer.from(cleanSvg).toString('base64');
    const logoDataUri = `data:image/svg+xml;base64,${base64Logo}`;

    // SVG Pattern for Noise Effect
    // This adds a subtle grain/noise texture
    const noiseSvg = `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" opacity="0.15" />
    </svg>
    `;
    const noiseDataUri = `data:image/svg+xml;base64,${Buffer.from(noiseSvg).toString('base64')}`;

    let fontData;
    try {
         const fontPath = path.join(process.cwd(), 'public/fonts/google-sans/GoogleSans-Bold.ttf');
         fontData = await fs.readFile(fontPath);
    } catch (e) {
         throw new Error('Font load failed');
    }

    // Attempt 1: Full Modern Layout
    try {
        // Grid pattern background
        const gridColor = textColor === '#ffffff' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
        const gridBg = `
            radial-gradient(circle at 10% 20%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 90%),
            linear-gradient(${gridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
        `;

        const markup = {
            type: 'div',
            props: {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                    backgroundColor: bg,
                    backgroundImage: gridBg,
                    backgroundSize: '100% 100%, 40px 40px, 40px 40px',
                    fontFamily: 'CustomFont',
                    position: 'relative',
                },
                children: [
                     // Noise Overlay
                    {
                        type: 'div',
                        props: {
                            style: {
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundImage: `url('${noiseDataUri}')`,
                                backgroundRepeat: 'repeat',
                                opacity: 0.2, // Adjust visibility of noise
                            },
                        },
                    },
                    // Main Content Container
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                width: '100%',
                                height: '100%',
                                padding: '60px',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center',
                            },
                            children: [
                                // Logo Area
                                logoVdom ? {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            width: '256px',
                                            height: '256px',
                                            marginBottom: '40px',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        },
                                        children: [
                                            {
                                                ...logoVdom,
                                                props: {
                                                    ...logoVdom.props,
                                                    width: '100%',
                                                    height: '100%',
                                                    style: {
                                                        ...logoVdom.props.style,
                                                        width: '100%',
                                                        height: '100%',
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                } : {
                                    type: 'img',
                                    props: {
                                        src: logoDataUri,
                                        width: '256',
                                        height: '256',
                                        style: {
                                            objectFit: 'contain',
                                            marginBottom: '40px',
                                        },
                                    },
                                },
                                // Text Area
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            width: '100%',
                                        },
                                        children: [
                                            {
                                                type: 'div',
                                                props: {
                                                    children: name,
                                                    style: {
                                                        color: textColor,
                                                        fontSize: '72px',
                                                        fontWeight: 700,
                                                        lineHeight: 1.1,
                                                        letterSpacing: '-0.02em',
                                                        textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                                        textAlign: 'center',
                                                        wordBreak: 'break-word',
                                                    },
                                                },
                                            },
                                            {
                                                type: 'div',
                                                props: {
                                                    children: description || '',
                                                    style: {
                                                        color: textColor,
                                                        fontSize: '32px',
                                                        fontWeight: 500,
                                                        opacity: 0.9,
                                                        marginTop: '24px',
                                                        lineHeight: 1.4,
                                                        textAlign: 'center',
                                                        maxWidth: '80%',
                                                    },
                                                },
                                            },
                                        ],
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
        try {
            const markupLogo = {
                type: 'div',
                props: {
                    style: {
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        backgroundColor: bg,
                        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%)`, // Add gradient here too
                        alignItems: 'center',
                        justifyContent: 'center',
                    },
                     children: [
                         // Noise Overlay Fallback
                        {
                            type: 'div',
                            props: {
                                style: {
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    backgroundImage: `url('${noiseDataUri}')`,
                                    backgroundRepeat: 'repeat',
                                    opacity: 0.3,
                                },
                            },
                        },
                        {
                            type: 'img',
                            props: {
                                src: logoDataUri,
                                width: '600',
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
             // Fallback 2: Text Only
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
