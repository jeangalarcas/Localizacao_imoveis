// Gerenciamento do mapa
class MapManager {
    constructor() {
        this.map = null;
        this.markers = [];
        this.clusterGroup = null;
    }

    init() {
        // Inicializar mapa
        this.map = L.map('map').setView([-30.0346, -51.2177], 11);

        // Adicionar tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);

        return this.map;
    }

    updateMap(properties, region) {
        // Limpar marcadores existentes
        this.clearMarkers();

        // Atualizar visão do mapa para a região
        if (region) {
            this.map.setView(region.center, region.zoom);
        }

        // Adicionar novos marcadores
        properties.forEach(property => {
            const marker = this.createPropertyMarker(property);
            this.markers.push(marker);
        });

        // Agrupar marcadores se houver muitos
        if (this.markers.length > 10) {
            this.clusterMarkers();
        } else {
            this.markers.forEach(marker => marker.addTo(this.map));
        }
    }

    createPropertyMarker(property) {
        const markerColor = this.getMarkerColor(property.opportunity);
        
        const marker = L.circleMarker([property.lat, property.lng], {
            radius: 8,
            fillColor: markerColor,
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });

        // Popup com informações
        const popupContent = `
            <div class="property-popup">
                <h6>${property.title}</h6>
                <p><strong>Preço:</strong> R$ ${property.price.toLocaleString('pt-BR')}</p>
                <p><strong>Área:</strong> ${property.area}m²</p>
                <p><strong>Valor/m²:</strong> R$ ${property.value_per_m2.toLocaleString('pt-BR')}</p>
                <p><strong>Oportunidade:</strong> ${this.getOpportunityText(property.opportunity)}</p>
                <button class="btn btn-sm btn-primary w-100 mt-2" onclick="app.showPropertyDetails('${property.id}')">
                    Ver detalhes
                </button>
            </div>
        `;

        marker.bindPopup(popupContent);

        // Evento de clique
        marker.on('click', () => {
            app.highlightProperty(property.id);
        });

        return marker;
    }

    clusterMarkers() {
        if (this.clusterGroup) {
            this.map.removeLayer(this.clusterGroup);
        }

        this.clusterGroup = L.markerClusterGroup({
            chunkedLoading: true,
            maxClusterRadius: 50
        });

        this.clusterGroup.addLayers(this.markers);
        this.map.addLayer(this.clusterGroup);
    }

    clearMarkers() {
        this.markers.forEach(marker => {
            if (this.map.hasLayer(marker)) {
                this.map.removeLayer(marker);
            }
        });
        this.markers = [];

        if (this.clusterGroup) {
            this.map.removeLayer(this.clusterGroup);
            this.clusterGroup = null;
        }
    }

    getMarkerColor(opportunity) {
        switch(opportunity) {
            case 'high': return '#4CAF50';
            case 'medium': return '#FF9800';
            case 'low': return '#F44336';
            default: return '#9E9E9E';
        }
    }

    getOpportunityText(opportunity) {
        switch(opportunity) {
            case 'high': return '⭐ ALTA OPORTUNIDADE';
            case 'medium': return '💡 BOA OFERTA';
            case 'low': return '⚠️ ACIMA DA MÉDIA';
            default: return '💲 PREÇO EQUILIBRADO';
        }
    }

    focusOnProperty(lat, lng) {
        this.map.setView([lat, lng], 15);
    }
}

// Adicionar métodos ao app principal
GeoImoveisApp.prototype.initMap = function() {
    this.mapManager = new MapManager();
    this.map = this.mapManager.init();
};

GeoImoveisApp.prototype.updateMap = function() {
    const region = CONFIG.regions[CONFIG.currentRegion];
    this.mapManager.updateMap(CONFIG.filteredProperties, region);
};

GeoImoveisApp.prototype.highlightProperty = function(propertyId) {
    const propertyElement = document.getElementById(`property-${propertyId}`);
    if (propertyElement) {
        propertyElement.scrollIntoView({ behavior: 'smooth' });
        propertyElement.classList.add('bg-light');
        setTimeout(() => {
            propertyElement.classList.remove('bg-light');
        }, 2000);
    }
};

GeoImoveisApp.prototype.showPropertyDetails = function(propertyId) {
    const property = CONFIG.properties.find(p => p.id === propertyId);
    if (!property) return;

    const modalTitle = document.getElementById('propertyModalTitle');
    const modalBody = document.getElementById('propertyModalBody');

    modalTitle.textContent = property.title;

    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <div class="ratio ratio-16x9 mb-3">
                    <img src="${property.photos[0]}" class="img-fluid rounded" alt="${property.title}">
                </div>
                <div class="row">
                    ${property.photos.slice(1, 4).map(photo => `
                        <div class="col-4">
                            <img src="${photo}" class="img-fluid rounded" style="height: 80px; object-fit: cover; width: 100%;">
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="col-md-6">
                <h5 class="text-primary">R$ ${property.price.toLocaleString('pt-BR')}</h5>
                <p><strong>Endereço:</strong> ${property.address}</p>
                <p><strong>Área:</strong> ${property.area}m²</p>
                <p><strong>Valor/m²:</strong> R$ ${property.value_per_m2.toLocaleString('pt-BR')}</p>
                <p><strong>Quartos:</strong> ${property.bedrooms}</p>
                <p><strong>Banheiros:</strong> ${property.bathrooms}</p>
                <p><strong>Vagas:</strong> ${property.parking_spaces}</p>
                
                <div class="mb-3">
                    <span class="badge ${this.getOpportunityBadgeClass(property.opportunity)}">
                        ${this.getOpportunityText(property.opportunity)}
                    </span>
                    <span class="badge bg-secondary">${property.source.toUpperCase()}</span>
                </div>

                <p>${property.description}</p>

                ${property.features && property.features.length > 0 ? `
                    <h6>Características:</h6>
                    <div class="d-flex flex-wrap gap-1 mb-3">
                        ${property.features.map(feature => `
                            <span class="badge bg-light text-dark">${feature}</span>
                        `).join('')}
                    </div>
                ` : ''}

                <div class="contact-info">
                    <h6>Contato:</h6>
                    <p><i class="bi bi-telephone"></i> ${property.contact.phone}</p>
                    <p><i class="bi bi-envelope"></i> ${property.contact.email}</p>
                </div>

                <div class="d-grid gap-2 mt-3">
                    <a href="${property.url}" target="_blank" class="btn btn-primary">
                        <i class="bi bi-link"></i> Ver no site original
                    </a>
                    <button class="btn btn-outline-primary" onclick="app.mapManager.focusOnProperty(${property.lat}, ${property.lng})">
                        <i class="bi bi-geo-alt"></i> Ver no mapa
                    </button>
                </div>
            </div>
        </div>
    `;

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('propertyModal'));
    modal.show();
};

GeoImoveisApp.prototype.getOpportunityBadgeClass = function(opportunity) {
    switch(opportunity) {
        case 'high': return 'opportunity-high';
        case 'medium': return 'opportunity-medium';
        case 'low': return 'opportunity-low';
        default: return '';
    }
};

GeoImoveisApp.prototype.getOpportunityText = function(opportunity) {
    switch(opportunity) {
        case 'high': return '⭐ ALTA OPORTUNIDADE';
        case 'medium': return '💡 BOA OFERTA';
        case 'low': return '⚠️ ACIMA DA MÉDIA';
        default: return '💲 PREÇO EQUILIBRADO';
    }
};
