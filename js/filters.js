// Gerenciamento da lista de propriedades
GeoImoveisApp.prototype.updatePropertyList = function() {
    const propertiesList = document.getElementById('properties-list');
    const resultsCount = document.getElementById('results-count');
    const resultsTitle = document.getElementById('results-title');

    const properties = CONFIG.filteredProperties;
    const region = CONFIG.regions[CONFIG.currentRegion];

    // Atualizar contador e título
    resultsCount.textContent = `(${properties.length} imóveis)`;
    resultsTitle.textContent = `Melhores Oportunidades - ${region.name}`;

    if (properties.length === 0) {
        propertiesList.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-exclamation-circle text-muted" style="font-size: 3rem;"></i>
                <p class="mt-3">Nenhum imóvel encontrado com os filtros atuais</p>
                <button class="btn btn-outline-primary" onclick="app.resetFilters()">
                    <i class="bi bi-arrow-counterclockwise"></i> Limpar filtros
                </button>
            </div>
        `;
        return;
    }

    // Gerar lista de propriedades
    propertiesList.innerHTML = properties.map(property => `
        <div class="property-card p-3 border-bottom" id="property-${property.id}">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="mb-0 flex-grow-1">${property.title}</h6>
                <span class="price-tag">R$ ${property.price.toLocaleString('pt-BR')}</span>
            </div>
            
            <p class="text-muted small mb-2">
                <i class="bi bi-geo-alt"></i> ${property.address}
            </p>
            
            <div class="d-flex flex-wrap gap-1 mb-2">
                <span class="badge bg-light text-dark">
                    <i class="bi bi-arrows-fullscreen"></i> ${property.area}m²
                </span>
                <span class="badge bg-light text-dark">
                    <i class="bi bi-currency-dollar"></i> R$ ${property.value_per_m2.toLocaleString('pt-BR')}/m²
                </span>
                <span class="badge ${this.getOpportunityBadgeClass(property.opportunity)}">
                    ${this.getOpportunityText(property.opportunity)}
                </span>
                <span class="badge bg-info text-dark">
                    <i class="bi bi-tag"></i> ${property.source.toUpperCase()}
                </span>
            </div>

            <div class="property-features small text-muted mb-2">
                ${property.bedrooms > 0 ? `<i class="bi bi-door-closed"></i> ${property.bedrooms} quartos` : ''}
                ${property.bathrooms > 0 ? `<i class="bi bi-droplet"></i> ${property.bathrooms} banheiros` : ''}
                ${property.parking_spaces > 0 ? `<i class="bi bi-car-front"></i> ${property.parking_spaces} vagas` : ''}
            </div>

            <p class="small text-muted mb-3">${property.description.substring(0, 100)}...</p>

            <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-primary flex-fill" onclick="app.showPropertyDetails('${property.id}')">
                    <i class="bi bi-eye"></i> Detalhes
                </button>
                <button class="btn btn-sm btn-outline-secondary" onclick="app.mapManager.focusOnProperty(${property.lat}, ${property.lng})">
                    <i class="bi bi-geo-alt"></i>
                </button>
            </div>
        </div>
    `).join('');
};
