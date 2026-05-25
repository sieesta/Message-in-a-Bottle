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