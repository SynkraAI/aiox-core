# Setup — kaizen squad

## O que foi removido / sanitizado

Este ZIP passou por sanitização 360° para compartilhamento seguro.

### Mídia excluída
- Vídeos: `.mp4`, `.mov`, `.avi`, `.mkv`, `.webm`, `.m4v`
- Áudios: `.mp3`, `.wav`, `.flac`, `.aac`, `.ogg`, `.m4a`
- Fontes: `.ttf`, `.otf`, `.woff`, `.woff2`
- Design: `.psd`, `.ai`, `.sketch`, `.fig`

### Build & Sistema excluídos
- `node_modules/`, `dist/`, `build/`, `out/`, `.next/`, `.cache/`
- `.env`, `.env.*` (variáveis de ambiente)
- Lock files, logs, SQLite, arquivos temporários

### Dados pessoais sanitizados
Todos os arquivos de texto foram varridos. Placeholders usados:

| Dado original | Placeholder |
|---|---|
| Nome do autor | `{{YOUR_NAME}}` / `{{YOUR_FULL_NAME}}` |
| Handles sociais | `{{@YOUR_HANDLE}}` |
| Telefones | `{{YOUR_PHONE}}` |
| E-mails | `{{YOUR_EMAIL}}` |
| Domínios pessoais | `{{YOUR_DOMAIN}}` |
| URLs pessoais | `{{YOUR_URL}}` |
| IPs de servidor | `{{YOUR_SERVER_IP}}` |
| API keys / secrets | `YOUR_SECRET_HERE` |
| IDs hexadecimais | `YOUR_ID_HERE` |

### Estatísticas
- **112** arquivos exportados
- **8** arquivos sanitizados
- **8** substituições realizadas
- **0** arquivos de mídia excluídos

## Como restaurar

1. **Buscar e substituir** placeholders `{{YOUR_*}}` com seus dados reais
2. **Dependências**: `npm install` nos diretórios com `package.json`
3. **Config**: edite `config.yaml` com suas credenciais
4. **Mídia**: adicione seus assets nos diretórios com `.gitkeep`
5. **Env vars**: crie `.env` com as API keys necessárias
