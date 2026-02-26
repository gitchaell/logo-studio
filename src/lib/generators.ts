import satori from "satori";
import { html } from "satori-html";

export const generateManifest = (project: any, sizes: number[]) => {
  return {
      name: project.name,
      short_name: project.shortName || project.name,
      description: project.description || '',
      theme_color: project.themeColor || '#ffffff',
      background_color: project.appBackgroundColor || '#ffffff',
      display: project.displayMode || 'standalone',
      orientation: project.orientation || 'any',
      start_url: project.startUrl || '/',
      icons: sizes.map(size => ({
          src: `icon-${size}.png`,
          sizes: `${size}x${size}`,
          type: 'image/png',
          purpose: size === 512 || size === 1024 ? 'any maskable' : 'any'
      })),
      screenshots: [
        {
            src: "splash.png",
            sizes: "1080x1920",
            type: "image/png",
            form_factor: "wide"
        }
      ],
      categories: [], // Optional but good to have structure
      // iarc_rating_id: "" // Optional
  };
};

export const generateAppJson = (project: any, sizes: number[]) => {
  const sortedSizes = [...sizes].sort((a, b) => a - b);
  const largestSize = sortedSizes.length > 0 ? sortedSizes[sortedSizes.length - 1] : undefined;

  // Prefer standard sizes if available
  const icon192 = sizes.includes(192) ? 192 : undefined;
  const icon512 = sizes.includes(512) ? 512 : undefined;

  const slug = project.shortName?.toLowerCase().replace(/\s+/g, '-') || project.name.toLowerCase().replace(/\s+/g, '-');
  const bundleId = `com.example.${slug.replace(/-/g, '')}`;

  return {
      expo: {
          name: project.name,
          slug: slug,
          version: "1.0.0",
          orientation: project.orientation === 'any' ? 'default' : project.orientation,
          icon: icon512 ? `./icon-${icon512}.png` : (largestSize ? `./icon-${largestSize}.png` : undefined),
          userInterfaceStyle: "light",
          splash: {
              image: "./splash.png",
              resizeMode: "contain",
              backgroundColor: project.appBackgroundColor || "#ffffff"
          },
          ios: {
              supportsTablet: true,
              bundleIdentifier: bundleId
          },
          android: {
              adaptiveIcon: {
                  foregroundImage: icon192 ? `./icon-${icon192}.png` : (largestSize ? `./icon-${largestSize}.png` : undefined),
                  backgroundColor: project.appBackgroundColor || "#ffffff"
              },
              package: bundleId
          },
          web: {
              favicon: "./favicon.ico"
          },
          description: project.description || ''
      }
  };
};

export const generateOpenGraph = async (project: any, svgContent: string) => {
    const { backgroundColor, themeColor } = project;
    // Basic OG Template
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

    try {
        // Fetch font
        const fontData = await fetch('/fonts/inter/Inter-Bold.woff2').then(res => res.arrayBuffer());

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

        return svg;
    } catch (e) {
        console.error("Failed to generate OG image", e);
        // Fallback or rethrow
        return svgContent; // Fail gracefully?
    }
};
