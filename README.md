# GeoImóveis RS/SC - Sistema de Oportunidades Imobiliárias

Sistema web para análise de oportunidades imobiliárias nas regiões metropolitana de Porto Alegre, litoral norte do RS e litoral sul de SC.

## Funcionalidades

- 🗺️ Visualização geográfica dos imóveis
- 🔍 Filtros avançados por tipo, preço, oportunidade e fonte
- 📊 Estatísticas em tempo real
- 📱 Design responsivo
- 💰 Identificação automática de oportunidades
- 📈 Dados massivos pré-carregados

## Estrutura de Dados

### Atualização Semanal

Para atualizar os dados do sistema:

1. **Edite o arquivo `data/properties.json`**
2. Atualize o campo `last_updated` com a data atual
3. Adicione/remova propriedades no array `properties`
4. Mantenha a estrutura dos objetos de propriedade

### Estrutura de uma Propriedade

```json
{
  "id": "identificador-unico",
  "title": "Título do imóvel",
  "type": "house|apartment|land|commercial",
  "price": 450000,
  "area": 120,
  "lat": -30.0311,
  "lng": -51.2287,
  "address": "Endereço completo",
  "neighborhood": "Bairro",
  "city": "Cidade",
  "bedrooms": 3,
  "bathrooms": 2,
  "parking_spaces": 2,
  "value_per_m2": 3750,
  "market_avg_m2": 4200,
  "opportunity": "high|medium|low",
  "opportunity_score": 12.5,
  "source": "zap|viva|olx|leilao",
  "description": "Descrição detalhada",
  "photos": ["url1", "url2"],
  "features": ["Piscina", "Churrasqueira"],
  "contact": {
    "phone": "(51) 99999-9999",
    "email": "corretor@exemplo.com"
  },
  "url": "https://link-original.com",
  "created_at": "2024-01-10",
  "updated_at": "2024-01-15"
}
