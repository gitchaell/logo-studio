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
    try {
        const baseUrl = import.meta.env.BASE_URL.endsWith('/')
            ? import.meta.env.BASE_URL
            : `${import.meta.env.BASE_URL}/`;

        const response = await fetch(`${baseUrl}api/generate-og`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ project, svgContent }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate OG image via API');
        }

        return await response.text();
    } catch (e) {
        console.error("Failed to generate OG image", e);
        return svgContent;
    }
};
