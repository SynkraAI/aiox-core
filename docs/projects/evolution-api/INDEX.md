# Evolution API — Project Index

## Estado Atual
- **Objetivo:** Automacao WhatsApp via Evolution API para Ensinio Prospector
- **Infraestrutura:** Hetzner Cloud VPS (Ashburn, VA) — CPX22 (2vCPU, 4GB RAM)
- **IP:** `178.156.242.82`
- **Status:** WhatsApp conectado via pairing code (instancia `ensinio3`)
- **Versao:** Evolution API v2.3.7 (buildada do source, rodando nativa via Node.js)
- **DB/Cache:** PostgreSQL 15 + Redis 7 (via Docker containers)

## Credenciais
- **API URL:** `http://178.156.242.82:8080`
- **API Key:** `evo-fosc-2026-xK9mP`
- **Instancia:** `ensinio3`
- **SSH:** `ssh root@178.156.242.82`
- **DB Password:** `Evo2026SecureDB`
- **Numero WhatsApp:** `+5531992499958`

## Arquitetura no Servidor

```
/opt/evolution-api/docker-compose.yml  -> PostgreSQL (porta 5433) + Redis (porta 6380)
/opt/evo-build/                        -> Evolution API v2.3.7 source (Node.js nativo)
/opt/evo-build/.env                    -> Configuracao da API
```

A API roda via `npm run start:prod` (nao Docker) porque a imagem Docker oficial
so tem v2.2.3 que tem um bug de QR Code loop infinito (issue #2365).

## Problemas Conhecidos
1. **Docker Hub desatualizado:** Imagem oficial parada na v2.2.3 (bug QR loop). Fix em v2.3.7 (source only).
2. **Sem systemd service:** A API roda via nohup. Se o servidor reiniciar, precisa iniciar manualmente.
3. **Sem SSL/dominio:** Acesso via IP:porta (http, nao https). Adequado para testes.
4. **4GB swap adicionado:** Necessario para buildar o source (esbuild consome muita RAM).

## Proximos Passos
1. Criar systemd service para Evolution API iniciar automaticamente
2. Configurar dominio + SSL (Traefik ou Nginx + Let's Encrypt)
3. Integrar com Ensinio Prospector v5.0 (Phase 8: Sheets, Phase 9: GHL Sync)
4. Testar envio/recebimento de mensagens via API

## Ultima Sessao (2026-03-13 — LATEST)
- Instalacao completa da Evolution API em Hetzner VPS
- Resolvido bug QR Code (v2.2.3 -> v2.3.7 source build)
- WhatsApp conectado via pairing code
- Ver: `docs/projects/evolution-api/sessions/2026-03-13.md`

## Documentacao
- [Evolution API — Docker Install](https://doc.evolution-api.com/v2/en/install/docker)
- [GitHub — EvolutionAPI/evolution-api](https://github.com/EvolutionAPI/evolution-api)
- [Bug QR Loop — PR #2365](https://github.com/EvolutionAPI/evolution-api/pull/2365)

## Historico
| Data | Acao |
|------|------|
| 2026-03-13 | Setup completo: Hetzner VPS + Evolution API v2.3.7 + WhatsApp conectado |
