export const getSvgDimensions = (svgString: string) => {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgString, 'image/svg+xml');
        const svg = doc.querySelector('svg');
        if (!svg) return { width: 512, height: 512 };

        let width = parseFloat(svg.getAttribute('width') || '');
        let height = parseFloat(svg.getAttribute('height') || '');
        const viewBox = svg.getAttribute('viewBox');

        // Prioritize viewBox for accurate dimensions and aspect ratio
        if (viewBox) {
            const parts = viewBox.split(/[\s,]+/).filter(Boolean);
            if (parts.length === 4) {
                const vbWidth = parseFloat(parts[2]);
                const vbHeight = parseFloat(parts[3]);

                if (!isNaN(vbWidth) && !isNaN(vbHeight)) {
                    return { width: vbWidth, height: vbHeight };
                }
            }
        }

        // Fallback to width/height attributes if viewBox is missing or invalid
        // Handle percentage widths/heights by defaulting to 512
        if (isNaN(width) || svg.getAttribute('width')?.includes('%')) width = 512;
        if (isNaN(height) || svg.getAttribute('height')?.includes('%')) height = 512;

        return {
            width: width,
            height: height
        };
    } catch (e) {
        return { width: 512, height: 512 };
    }
};

export const normalizeSvg = (svgContent: string): string => {
    try {
        // Remove <?xml ... ?> if present to avoid nesting issues or string concatenation issues
        let cleanContent = svgContent.trim();
        if (cleanContent.startsWith('<?xml')) {
            cleanContent = cleanContent.replace(/<\?xml.*?\?>/, '');
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(cleanContent, 'image/svg+xml');
        const originalSvg = doc.querySelector('svg');

        if (!originalSvg) return svgContent;

        // Create wrapper
        const wrapper = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        wrapper.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        wrapper.setAttribute("viewBox", "0 0 512 512");
        wrapper.setAttribute("width", "512");
        wrapper.setAttribute("height", "512");

        // Configure original SVG to fit
        // We clone it to avoid moving it from the parsed doc (though strictly not necessary if we just discard doc)
        const clonedSvg = originalSvg.cloneNode(true) as SVGElement;

        // Set attributes to ensure it scales to fill the 512x512 container while preserving aspect ratio
        clonedSvg.setAttribute("width", "100%");
        clonedSvg.setAttribute("height", "100%");
        clonedSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");

        // Clear positioning that might interfere
        clonedSvg.removeAttribute("x");
        clonedSvg.removeAttribute("y");

        wrapper.appendChild(clonedSvg);

        return new XMLSerializer().serializeToString(wrapper);
    } catch (e) {
        console.error("Failed to normalize SVG", e);
        return svgContent;
    }
};
