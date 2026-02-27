const fs = require('fs');

async function generateOg() {
    const project = {
        name: 'My Modern Project',
        description: 'A cutting-edge tech startup',
        backgroundColor: '#4F46E5', // Indigo-600
        colors: {}
    };

    const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <circle cx="256" cy="256" r="200" fill="white" />
        <path d="M156 156 L356 356 M356 156 L156 356" stroke="#4F46E5" stroke-width="40" stroke-linecap="round" />
    </svg>`;

    try {
        const response = await fetch('http://localhost:4321/api/generate-og', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project, svgContent })
        });

        if (!response.ok) {
            console.error('Failed to fetch OG image:', response.status, response.statusText);
            const text = await response.text();
            console.error('Response:', text);
            return;
        }

        const svg = await response.text();
        fs.writeFileSync('verification/og_output.svg', svg);
        console.log('Successfully generated verification/og_output.svg');
    } catch (e) {
        console.error('Error generating OG image:', e);
    }
}

generateOg();
