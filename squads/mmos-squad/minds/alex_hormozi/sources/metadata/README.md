# Metadata - Alex Hormozi

## 📊 Propósito

Esta pasta contém metadados, índices e arquivos de controle para rastrear a coleta de sources.

---

## 📁 Estrutura

### Arquivos de Índice
- **video_index.json** - Lista de todos os vídeos com URLs e metadados
- **podcast_index.json** - Lista de podcasts com episódios
- **social_index.json** - Lista de posts de redes sociais
- **book_index.json** - Informações sobre livros

### Arquivos de Status
- **collection_status.json** - Status geral da coleta
- **quality_metrics.json** - Métricas de qualidade do material
- **processing_log.json** - Log de processamento

### Listas de URLs
- **urls_to_collect.txt** - Lista de URLs pendentes
- **urls_collected.txt** - URLs já coletados
- **urls_failed.txt** - URLs que falharam

---

## 🗂️ Formatos

### video_index.json
```json
{
  "videos": [
    {
      "id": "youtube_video_id",
      "title": "Video Title",
      "url": "https://youtube.com/watch?v=...",
      "duration": "30:45",
      "views": 1000000,
      "published": "2024-01-01",
      "category": "frameworks",
      "priority": "P0",
      "status": "pending|collected|processed",
      "local_path": "videos/youtube_main/..."
    }
  ]
}
```

### collection_status.json
```json
{
  "last_updated": "2025-10-10",
  "total_sources": 500,
  "collected": 10,
  "processed": 5,
  "progress_pct": 2,
  "by_category": {
    "books": {"total": 3, "collected": 0},
    "podcasts": {"total": 50, "collected": 1},
    "videos": {"total": 200, "collected": 0},
    "social": {"total": 200, "collected": 0}
  }
}
```

---

## 🎯 Uso

### Inicializar Índices
```bash
*etl init-metadata --mind alex_hormozi
```

### Atualizar Status
```bash
*etl update-status --category videos --collected 5
```

### Gerar Relatório
```bash
*etl report-progress --mind alex_hormozi
```

---

*Última atualização: 2025-10-10*
