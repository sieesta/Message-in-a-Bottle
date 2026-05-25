// Particle animation setup
document.addEventListener('DOMContentLoaded', () => {
    const particlesContainer = document.getElementById('particles');
    
    if (particlesContainer) {
        createParticles(50); // Increased amount so we have a rich mix of big and small
    }
});

function createParticles(count) {
    const container = document.getElementById('particles');
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random properties, mixing large and small bubbles
        const isBigBubble = Math.random() > 0.7; // 30% chance for a big bubble
        const size = isBigBubble ? Math.random() * 45 + 15 : Math.random() * 8 + 3; // Big: 15-60px, Small: 3-11px
        const posX = Math.random() * 100;
        const delay = Math.random() * 10;
        const duration = Math.random() * 15 + 10; // 10s to 25s
        
        // Make big bubbles a little softer/more transparent so they look like they are in the background
        if (isBigBubble) {
            particle.style.opacity = Math.random() * 0.4 + 0.1;
        }
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}vw`;
        particle.style.bottom = `-50px`; // Start slightly further below the screen
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        
        container.appendChild(particle);
    }
}

function getPresetMoodColor(mood) {
    switch (mood) {
        case 'happy':
            return '#fb8500';
        case 'sad':
            return '#023e8a';
        case 'calm':
            return '#219ebc';
        case 'hopeful':
            return '#b8d8d8';
        case 'romantic':
            return '#ffafcc';
        default:
            return '#8ecae6';
    }
}

function normalizeHexColor(color) {
    if (!color || typeof color !== 'string') {
        return null;
    }

    const trimmed = color.trim();
    if (/^#[0-9a-fA-F]{3}$/.test(trimmed) || /^#[0-9a-fA-F]{6}$/.test(trimmed)) {
        return trimmed;
    }

    return null;
}

function hexToRgba(color, alpha) {
    const normalized = normalizeHexColor(color);
    if (!normalized) {
        return `rgba(255, 255, 255, ${alpha})`;
    }

    const hex = normalized.slice(1);
    const fullHex = hex.length === 3
        ? hex.split('').map(char => char + char).join('')
        : hex;
    const value = parseInt(fullHex, 16);
    const red = (value >> 16) & 255;
    const green = (value >> 8) & 255;
    const blue = value & 255;

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function buildBottleGradient(color, startAlpha = 0.6, endAlpha = 0.2) {
    return `linear-gradient(135deg, ${hexToRgba(color, startAlpha)} 0%, ${hexToRgba(color, endAlpha)} 100%)`;
}

function buildMoodPageGradient(color) {
    return `linear-gradient(135deg, ${hexToRgba(color, 0.95)} 0%, ${hexToRgba(color, 0.55)} 100%)`;
}

function getMoodLabel(mood) {
    if (!mood) {
        return 'Mood';
    }

    return mood.charAt(0).toUpperCase() + mood.slice(1);
}