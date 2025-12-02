// Gerador de capas vintage para vinis
function generateVinylCover(element, nome, artista, ano) {
    // Gerar hash simples baseado no nome e artista
    const hash = simpleHash(nome + artista);
    
    // Selecionar padrão de cor baseado no hash
    const patternClass = `cover-pattern-${(hash % 6) + 1}`;
    
    // Aplicar estilo vintage
    element.className = 'vinil-cover texture-grain texture-vinyl-scratches texture-aged-paper ' + patternClass;
    
    // Criar conteúdo da capa
    element.innerHTML = `
        <div class="vinil-cover-title">${nome}</div>
        <div class="vinil-cover-artist">${artista}</div>
        <div class="vinil-cover-year">${ano}</div>
    `;
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

// Aplicar capas vintage quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    const vinilImages = document.querySelectorAll('.vinil-image');
    vinilImages.forEach(function(img) {
        const card = img.closest('.vinil-card');
        if (card) {
            const titleElement = card.querySelector('.vinil-title');
            const artistElement = card.querySelector('.vinil-artist');
            const metaElement = card.querySelector('.vinil-meta');
            
            if (titleElement && artistElement) {
                const nome = titleElement.textContent.trim();
                const artista = artistElement.textContent.trim();
                let ano = new Date().getFullYear();
                
                if (metaElement) {
                    const anoMatch = metaElement.textContent.match(/(\d{4})/);
                    if (anoMatch) {
                        ano = anoMatch[1];
                    }
                }
                
                generateVinylCover(img, nome, artista, ano);
            }
        }
    });
});

