// Configuração global
const CONFIG = {
    regions: {},
    properties: [],
    filteredProperties: [],
    currentRegion: 'porto_alegre',
    filters: {
        propertyType: 'all',
        priceRange: 'all',
        opportunity: 'all',
        source: 'all'
    }
};

// Inicialização da aplicação
class GeoImoveisApp {
    constructor() {
        this.map = null;
        this.markers = [];
        this.init();
    }

    async init() {
        try {
            // Carregar dados
            await this.loadData();
            
            // Inicializar componentes
            this.initMap();
            this.initEventListeners();
            this.applyFilters();
            
            console.log('Aplicação inicializada com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar aplicação:', error);
            this.showError('Erro ao carregar os dados da aplicação');
        }
    }

    async loadData() {
        try {
            // Carregar regiões
            const regionsResponse = await fetch('data/regions.json');
            CONFIG.regions = await regionsResponse.json();

            // Carregar propriedades
            const propertiesResponse = await fetch('data/properties.json');
            const propertiesData = await propertiesResponse.json();
            CONFIG.properties = propertiesData.properties;

            // Atualizar data da última atualização
            document.getElementById('last-update').textContent = propertiesData.last_updated;

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            throw new Error('Não foi possível carregar os dados do sistema');
        }
    }

    initEventListeners() {
        // Seletor de região
        document.querySelectorAll('#region-selector button').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('#region-selector button').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                
                CONFIG.currentRegion = e.target.dataset.region;
                this.applyFilters();
            });
        });

        // Botão aplicar filtros
        document.getElementById('apply-filters').addEventListener('click', () => {
            this.updateFilters();
            this.applyFilters();
        });

        // Botão resetar filtros
        document.getElementById('reset-filters').addEventListener('click', () => {
            this.resetFilters();
            this.applyFilters();
        });

        // Busca por endereço
        document.getElementById('search-btn').addEventListener('click', () => {
            this.searchAddress();
        });

        document.getElementById('address-search').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchAddress();
            }
        });

        // Filtros por change
        ['property-type', 'price-range', 'opportunity-level', 'data-source'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.updateFilters();
                this.applyFilters();
            });
        });
    }

    updateFilters() {
        CONFIG.filters = {
            propertyType: document.getElementById('property-type').value,
            priceRange: document.getElementById('price-range').value,
            opportunity: document.getElementById('opportunity-level').value,
            source: document.getElementById('data-source').value
        };
    }

    resetFilters() {
        document.getElementById('property-type').value = 'all';
        document.getElementById('price-range').value = 'all';
        document.getElementById('opportunity-level').value = 'all';
        document.getElementById('data-source').value = 'all';
        document.getElementById('address-search').value = '';
        
        this.updateFilters();
    }

    applyFilters() {
        const region = CONFIG.regions[CONFIG.currentRegion];
        const filters = CONFIG.filters;

        // Filtrar propriedades
        CONFIG.filteredProperties = CONFIG.properties.filter(property => {
            // Filtro por região
            if (!this.isPropertyInRegion(property, region)) {
                return false;
            }

            // Filtro por tipo
            if (filters.propertyType !== 'all' && property.type !== filters.propertyType) {
                return false;
            }

            // Filtro por preço
            if (filters.priceRange !== 'all') {
                const [min, max] = filters.priceRange.split('-').map(Number);
                if (max && (property.price < min || property.price > max)) return false;
                if (filters.priceRange.endsWith('+') && property.price < min) return false;
            }

            // Filtro por oportunidade
            if (filters.opportunity !== 'all' && property.opportunity !== filters.opportunity) {
                return false;
            }

            // Filtro por fonte
            if (filters.source !== 'all' && property.source !== filters.source) {
                return false;
            }

            return true;
        });

        // Ordenar por oportunidade (melhores primeiro)
        CONFIG.filteredProperties.sort((a, b) => {
            const opportunityOrder = { high: 3, medium: 2, low: 1 };
            return opportunityOrder[b.opportunity] - opportunityOrder[a.opportunity] || 
                   b.opportunity_score - a.opportunity_score;
        });

        // Atualizar interface
        this.updateMap();
        this.updatePropertyList();
        this.updateStatistics();
    }

    isPropertyInRegion(property, region) {
        const [sw, ne] = region.bounds;
        return property.lat >= sw[0] && property.lat <= ne[0] && 
               property.lng >= sw[1] && property.lng <= ne[1];
    }

    searchAddress() {
        const address = document.getElementById('address-search').value.trim();
        if (!address) return;

        // Usar Nominatim para geocodificação
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Brasil')}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const location = {
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon)
                    };
                    
                    // Mover mapa para a localização
                    this.map.setView([location.lat, location.lng], 15);
                    
                    // Adicionar marcador temporário
                    L.marker([location.lat, location.lng])
                        .addTo(this.map)
                        .bindPopup(`<b>Local buscado:</b><br>${address}`)
                        .openPopup();
                } else {
                    alert('Endereço não encontrado');
                }
            })
            .catch(error => {
                console.error('Erro na busca de endereço:', error);
                alert('Erro ao buscar endereço');
            });
    }

    updateStatistics() {
        const properties = CONFIG.filteredProperties;
        
        // Total de imóveis
        document.getElementById('total-properties').textContent = properties.length;
        
        // Alta oportunidade
        const highOpportunity = properties.filter(p => p.opportunity === 'high').length;
        document.getElementById('high-opportunity').textContent = highOpportunity;
        
        // Preço médio por m²
        const avgPriceM2 = properties.length > 0 ? 
            Math.round(properties.reduce((sum, p) => sum + p.value_per_m2, 0) / properties.length) : 0;
        document.getElementById('avg-price-m2').textContent = `R$ ${avgPriceM2.toLocaleString('pt-BR')}`;
        
        // Melhor oportunidade
        const bestOpportunity = properties.length > 0 ? 
            `${properties[0].value_per_m2.toLocaleString('pt-BR')}/m²` : '-';
        document.getElementById('best-opportunity').textContent = bestOpportunity;
    }

    showError(message) {
        const resultsList = document.getElementById('properties-list');
        resultsList.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-exclamation-triangle text-danger" style="font-size: 3rem;"></i>
                <p class="mt-3">${message}</p>
                <button class="btn btn-outline-primary" onclick="location.reload()">
                    <i class="bi bi-arrow-repeat"></i> Tentar novamente
                </button>
            </div>
        `;
    }
}

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.app = new GeoImoveisApp();
});
