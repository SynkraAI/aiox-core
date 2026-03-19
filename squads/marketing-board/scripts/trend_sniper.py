#!/usr/bin/env python3
"""
OPES Marketing Arm — Trend Sniper v1.1
Monitors trending topics in Brazil via Google Trends (Apify),
filters by SVA relevance, and sends WhatsApp alerts.

Data source: Google Trends "Trending Now" (BR) — captures what people
are actively searching, not just tweeting. Broader reach, reliable data.

Usage:
  python3 trend_sniper.py              # Run once (check trends now)
  python3 trend_sniper.py --dry-run    # Show what would be alerted without sending
  python3 trend_sniper.py --force      # Run even outside 8h-22h BRT window
  python3 trend_sniper.py --history    # Show last 10 alerts

Designed to run via cron every 30 min between 08:00-22:00 BRT:
  */30 8-21 * * * cd /path/to/mmos && python3 .aios-core/expansion-packs/marketing-opes/scripts/trend_sniper.py
"""
import json
import os
import re
import sys
import time
import urllib.request
import urllib.parse
from datetime import datetime, timezone, timedelta

# ── Paths ────────────────────────────────────────────────────────────────────
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
CREDS_PATH = os.path.expanduser("~/.config/aios/credentials.yaml")
TRENDS_DIR = os.path.join(REPO_ROOT, "outputs", "hubs", "marketing", "trends")
TRENDS_LOG = os.path.join(TRENDS_DIR, "trend-sniper.jsonl")

# ── BRT timezone (UTC-3) ────────────────────────────────────────────────────
BRT = timezone(timedelta(hours=-3))

# ── Apify Config ─────────────────────────────────────────────────────────────
APIFY_BASE = "https://api.apify.com/v2"
GOOGLE_TRENDS_ACTOR = "early_kiosk/google-trends-scraper"

# ── Keyword Layers (CMO-approved) ────────────────────────────────────────────
# Matching is done against: trend query + all related queries
KEYWORDS = {
    "layer_1_direct": [
        "inteligência artificial", "inteligencia artificial",
        "chatgpt", "chat gpt", "openai", "open ai",
        "automação", "automacao", "agentes ia", "ai agents",
        "copilot", "machine learning",
        "deep learning", "llm", "deepseek",
        "midjourney", "stable diffusion", "dall-e",
    ],
    # Regex patterns (matched separately with word boundaries)
    "layer_1_regex": [
        r'\bia\b', r'\bgpt\b', r'\bclaude\b', r'\bgemini\b', r'\brobo\b', r'\brobô\b',
    ],
    "layer_2_business": [
        "empreendedor", "escalar", "equipe", "demiti", "demitiu",
        "demissão", "demissao", "sozinho", "solopreneur",
        "one-person", "startup", "faturamento", "faturar",
        "empresa", "negócio", "negocio", "receita", "lucro",
        "produtividade", "freelancer", "autônomo", "autonomo",
        "mei", "microempresa", "pj",
    ],
    "layer_3_contrast": [
        "curso de ia", "curso de inteligência", "curso de inteligencia",
        "agência de ia", "agencia de ia", "agência digital", "agencia digital",
        "equipe tech", "equipe de tecnologia", "time de tech",
        "bootcamp", "contratar dev", "contratar programador",
        "programador", "time de tecnologia", "terceirizar",
    ],
}

# ── Score → Action mapping ───────────────────────────────────────────────────
ALERT_THRESHOLD = 2


def load_credentials():
    """Load API tokens from credentials.yaml"""
    with open(CREDS_PATH) as f:
        content = f.read()
    creds = {}
    m = re.search(r'apify:.*?api_token:\s*[\'"](.+?)[\'"]', content, re.DOTALL)
    creds['apify_token'] = m.group(1) if m else None
    m = re.search(r'uazapi:.*?base_url:\s*[\'"](.+?)[\'"]', content, re.DOTALL)
    creds['wpp_url'] = m.group(1) if m else None
    m = re.search(r'uazapi:.*?(?:^|\n)\s+token:\s*[\'"](.+?)[\'"]', content, re.DOTALL)
    creds['wpp_token'] = m.group(1) if m else None
    m = re.search(r'notification_number:\s*[\'"](.+?)[\'"]', content)
    creds['wpp_number'] = m.group(1) if m else None
    return creds


def is_within_schedule(force=False):
    """Check if current time is within 08:00-22:00 BRT"""
    if force:
        return True
    now_brt = datetime.now(BRT)
    return 8 <= now_brt.hour < 22


def fetch_trends(apify_token):
    """Fetch Brazil trending topics via Google Trends (Apify actor)"""
    actor_id = GOOGLE_TRENDS_ACTOR.replace("/", "~")
    url = f"{APIFY_BASE}/acts/{actor_id}/runs?token={apify_token}"
    payload = json.dumps({
        "geo": "BR",
        "language": "pt-BR",
        "timezone": -180,
        "maxResults": 50,
    }).encode()
    req = urllib.request.Request(url, data=payload, method='POST')
    req.add_header('Content-Type', 'application/json')

    print("[Sniper] Coletando Google Trends Brasil via Apify...")
    resp = urllib.request.urlopen(req, timeout=120)
    run_data = json.loads(resp.read())
    run_id = run_data['data']['id']
    dataset_id = run_data['data'].get('defaultDatasetId')
    print(f"[Sniper] Run: {run_id}")

    # Poll for completion (max 120s)
    for attempt in range(24):
        time.sleep(5)
        status_url = f"{APIFY_BASE}/actor-runs/{run_id}?token={apify_token}"
        resp = urllib.request.urlopen(status_url)
        status = json.loads(resp.read())
        run_status = status['data']['status']
        if run_status == 'SUCCEEDED':
            dataset_id = status['data']['defaultDatasetId']
            break
        if run_status in ('FAILED', 'ABORTED', 'TIMED-OUT'):
            raise Exception(f"Apify run failed: {run_status}")
        print(f"  Aguardando... ({attempt+1}/24) status={run_status}")

    # Fetch dataset items
    items_url = f"{APIFY_BASE}/datasets/{dataset_id}/items?token={apify_token}&format=json"
    resp = urllib.request.urlopen(items_url)
    items = json.loads(resp.read())
    print(f"[Sniper] {len(items)} trends coletados")
    return items


def build_searchable_text(trend):
    """Build a single searchable string from trend query + related queries"""
    parts = [trend.get('query', ''), trend.get('displayQuery', '')]
    related = trend.get('relatedQueries', [])
    if isinstance(related, list):
        parts.extend(related[:10])  # Top 10 related queries
    return ' '.join(parts).lower()


def score_trend(trend):
    """Score a trend against keyword layers using query + related queries.
    Returns (score, matched_layers)"""
    text = build_searchable_text(trend)
    matched = {}

    for layer_name, keywords in KEYWORDS.items():
        # Skip regex layer here (handled separately below)
        if layer_name.endswith('_regex'):
            continue
        for kw in keywords:
            if kw in text:
                matched.setdefault(layer_name, [])
                if kw not in matched[layer_name]:
                    matched[layer_name].append(kw)

    # Handle regex patterns (word boundary matching)
    for pattern_str in KEYWORDS.get('layer_1_regex', []):
        if re.search(pattern_str, text):
            matched.setdefault('layer_1_direct', [])
            clean = pattern_str.replace(r'\b', '')
            if clean not in matched['layer_1_direct']:
                matched['layer_1_direct'].append(clean)

    score = len(matched)
    return score, matched


def classify_alert(score, matched_layers):
    """Classify alert type based on score and which layers matched"""
    if score >= 3:
        return "ALERTA_MAXIMO"
    if score == 2:
        has_l1 = "layer_1_direct" in matched_layers
        has_l3 = "layer_3_contrast" in matched_layers
        if has_l1 and has_l3:
            return "CONTRAST_ALERT"
        return "TREND_ALERT"
    if score == 1:
        return "MONITOR"
    return "IGNORE"


def suggest_angle(alert_type, trend_title, matched_layers):
    """Suggest tribal angle based on alert type"""
    angles = {
        "ALERTA_MAXIMO": (
            f'A prova de que "{trend_title}" confirma o modelo OPES. '
            'Jose ja faz isso — mostrar o sistema rodando como evidencia.'
        ),
        "TREND_ALERT": (
            f'Como Jose RESOLVEU "{trend_title}" com OPES. '
            'Bastidor real, nao teoria. Mostrar organograma de agentes em acao.'
        ),
        "CONTRAST_ALERT": (
            f'Por que "{trend_title}" e o caminho ERRADO — e o que fazer em vez disso. '
            'Anti-padrao: instalar > ensinar. OPES > curso.'
        ),
    }
    return angles.get(alert_type, "")


def format_volume(trend):
    """Format traffic volume from Google Trends data"""
    tv = trend.get('trafficValue', 0)
    if tv >= 1_000_000:
        return f"{tv / 1_000_000:.1f}M buscas"
    if tv >= 1_000:
        return f"{tv / 1_000:.0f}K buscas"
    if tv > 0:
        return f"{tv} buscas"
    return "N/A"


def generate_alert_md(trend, score, alert_type, matched_layers, angle):
    """Generate markdown alert brief"""
    now = datetime.now(BRT)
    title = trend.get('query', trend.get('displayQuery', 'Unknown'))
    volume = format_volume(trend)
    traffic_score = trend.get('score', 'N/A')

    # Related queries for context
    related = trend.get('relatedQueries', [])
    related_str = ', '.join(related[:8]) if related else 'N/A'

    # Format matched keywords
    match_lines = []
    for layer, kws in matched_layers.items():
        label = layer.replace("layer_1_direct", "Layer 1 (Direto)") \
                     .replace("layer_2_business", "Layer 2 (Negocio)") \
                     .replace("layer_3_contrast", "Layer 3 (Contraste)")
        match_lines.append(f"- {label}: {', '.join(kws)}")

    emoji = {"ALERTA_MAXIMO": "🔴", "TREND_ALERT": "🟡", "CONTRAST_ALERT": "🟡"}.get(alert_type, "⚪")

    md = f"""## {emoji} {alert_type}

**Trend:** {title}
**Score:** {score}/3 — {alert_type}
**Volume:** {volume} | **Google Score:** {traffic_score}
**Fonte:** Google Trends Brasil
**Detectado:** {now.strftime('%Y-%m-%d %H:%M')} BRT
**Janela estimada:** ~4-8h (trends BR duram em media 4-12h)

### Keywords Matchadas
{chr(10).join(match_lines)}

### Queries Relacionadas
{related_str}

### Angulo Tribal Sugerido
{angle}

### Acao Recomendada
- [ ] Aprovar para producao rapida (< 2h) → post texto simples
- [ ] Salvar para proximo post agendado
- [ ] Ignorar
"""
    return md


def save_alert(alert_md, trend_title):
    """Save alert as .md file in trends directory"""
    os.makedirs(TRENDS_DIR, exist_ok=True)
    now = datetime.now(BRT)
    slug = re.sub(r'[^a-z0-9]+', '-', trend_title.lower())[:40].strip('-')
    filename = f"{now.strftime('%Y-%m-%d-%H%M')}-{slug}.md"
    filepath = os.path.join(TRENDS_DIR, filename)
    with open(filepath, 'w') as f:
        f.write(alert_md)
    print(f"[Sniper] Alert salvo: {filepath}")
    return filepath


def log_trend(trend, score, alert_type, matched_layers):
    """Append trend to JSONL log"""
    os.makedirs(TRENDS_DIR, exist_ok=True)
    title = trend.get('query', trend.get('displayQuery', ''))
    entry = {
        'ts': datetime.now(BRT).isoformat(),
        'source': 'google_trends',
        'title': title,
        'volume': trend.get('trafficValue', 0),
        'score': score,
        'alert_type': alert_type,
        'matched': {k: v for k, v in matched_layers.items()},
    }
    with open(TRENDS_LOG, 'a') as f:
        f.write(json.dumps(entry, ensure_ascii=False) + '\n')


def send_whatsapp(creds, message):
    """Send WhatsApp alert via UazAPI"""
    if not all([creds.get('wpp_url'), creds.get('wpp_token'), creds.get('wpp_number')]):
        print("[Sniper] WhatsApp nao configurado, pulando alerta")
        return
    url = f"{creds['wpp_url']}/send/text"
    payload = json.dumps({"number": creds['wpp_number'], "text": message}).encode()
    req = urllib.request.Request(url, data=payload, method='POST')
    req.add_header('Content-Type', 'application/json')
    req.add_header('token', creds['wpp_token'])
    try:
        urllib.request.urlopen(req)
        print("[Sniper] WhatsApp enviado")
    except Exception as e:
        print(f"[Sniper] Erro WhatsApp: {e}")


def format_whatsapp_alert(trend_title, score, alert_type, volume, angle):
    """Format WhatsApp message for trend alert"""
    emoji = {"ALERTA_MAXIMO": "🔴", "TREND_ALERT": "🟡", "CONTRAST_ALERT": "🟡"}.get(alert_type, "⚪")
    now = datetime.now(BRT)
    return (
        f"{emoji} *TREND SNIPER — {alert_type}*\n\n"
        f"*Trend:* {trend_title}\n"
        f"*Score:* {score}/3\n"
        f"*Volume:* {volume}\n"
        f"*Fonte:* Google Trends BR\n"
        f"*Detectado:* {now.strftime('%H:%M')} BRT\n\n"
        f"*Angulo sugerido:*\n{angle}\n\n"
        f"_Responda GO para produzir ou SKIP para ignorar._"
    )


def emit_event(agent, event_type, content, **kwargs):
    """Emit Big Brother event"""
    events_file = os.path.join(REPO_ROOT, "outputs", "hubs", "marketing", "pipeline-events.jsonl")
    event = {
        'ts': datetime.now(timezone.utc).isoformat(),
        'agent': agent,
        'type': event_type,
        'content': content,
        **kwargs,
    }
    os.makedirs(os.path.dirname(events_file), exist_ok=True)
    with open(events_file, 'a') as f:
        f.write(json.dumps(event, ensure_ascii=False) + '\n')


def load_recent_alerts():
    """Load recent alert titles to avoid duplicate alerts (6h window)"""
    if not os.path.exists(TRENDS_LOG):
        return set()
    recent = set()
    cutoff = datetime.now(BRT) - timedelta(hours=6)
    with open(TRENDS_LOG) as f:
        for line in f:
            try:
                entry = json.loads(line)
                ts = datetime.fromisoformat(entry['ts'])
                if ts > cutoff and entry.get('score', 0) >= ALERT_THRESHOLD:
                    recent.add(entry['title'].lower())
            except (json.JSONDecodeError, KeyError, ValueError):
                continue
    return recent


def show_history():
    """Show last 10 alerts from log"""
    if not os.path.exists(TRENDS_LOG):
        print("Nenhum historico encontrado.")
        return
    entries = []
    with open(TRENDS_LOG) as f:
        for line in f:
            try:
                entry = json.loads(line)
                if entry.get('score', 0) >= ALERT_THRESHOLD:
                    entries.append(entry)
            except (json.JSONDecodeError, KeyError):
                continue
    for e in entries[-10:]:
        emoji = {"ALERTA_MAXIMO": "🔴", "TREND_ALERT": "🟡", "CONTRAST_ALERT": "🟡"}.get(e.get('alert_type', ''), "⚪")
        print(f"  {emoji} [{e.get('ts', '?')[:16]}] {e.get('title', '?')} (score={e.get('score', '?')})")
    if not entries:
        print("Nenhum alerta com score >= 2 encontrado.")


def main():
    args = sys.argv[1:]
    dry_run = '--dry-run' in args
    force = '--force' in args

    if '--history' in args:
        show_history()
        return

    if not is_within_schedule(force):
        now_brt = datetime.now(BRT)
        print(f"[Sniper] Fora do horario ({now_brt.strftime('%H:%M')} BRT). Use --force para ignorar.")
        return

    print(f"=== TREND SNIPER v1.1 — {datetime.now(BRT).strftime('%Y-%m-%d %H:%M')} BRT ===")
    print(f"    Fonte: Google Trends Brasil\n")

    creds = load_credentials()
    if not creds.get('apify_token'):
        print("ERRO: Apify token nao encontrado em credentials.yaml")
        sys.exit(1)

    emit_event('sniper', 'start', 'Trend Sniper v1.1 — Google Trends Brasil')

    # Fetch trends
    try:
        trends = fetch_trends(creds['apify_token'])
    except Exception as e:
        print(f"ERRO ao buscar trends: {e}")
        emit_event('sniper', 'error', f'Falha: {e}')
        sys.exit(1)

    if not trends:
        print("[Sniper] Nenhum trend retornado.")
        emit_event('sniper', 'complete', 'Nenhum trend retornado')
        return

    recent_alerts = load_recent_alerts()

    # Score and filter
    alerts = []
    monitored = 0
    ignored = 0

    for trend in trends:
        title = trend.get('query', trend.get('displayQuery', ''))
        if not title:
            continue

        score, matched = score_trend(trend)
        alert_type = classify_alert(score, matched)

        if score >= 1:
            log_trend(trend, score, alert_type, matched)

        if score >= ALERT_THRESHOLD:
            if title.lower() in recent_alerts:
                print(f"  [SKIP] {title} (ja alertado)")
                continue
            alerts.append((trend, score, alert_type, matched))
        elif score == 1:
            monitored += 1
        else:
            ignored += 1

    print(f"\n[Resultado] {len(alerts)} alertas | {monitored} monitorados | {ignored} ignorados\n")

    # Process alerts
    for trend, score, alert_type, matched in alerts:
        title = trend.get('query', trend.get('displayQuery', ''))
        volume = format_volume(trend)
        angle = suggest_angle(alert_type, title, matched)

        alert_md = generate_alert_md(trend, score, alert_type, matched, angle)
        save_alert(alert_md, title)
        log_trend(trend, score, alert_type, matched)

        emoji = {"ALERTA_MAXIMO": "🔴", "TREND_ALERT": "🟡", "CONTRAST_ALERT": "🟡"}.get(alert_type, "⚪")
        print(f"{emoji} {alert_type}: {title} (score={score})")
        print(f"   Volume: {volume}")
        print(f"   Keywords: {matched}")
        print(f"   Angulo: {angle[:80]}...")

        emit_event('sniper', 'alert', f'{alert_type}: {title}',
                    score=str(score), volume=volume)

        if not dry_run:
            wpp_msg = format_whatsapp_alert(title, score, alert_type, volume, angle)
            send_whatsapp(creds, wpp_msg)
        else:
            print(f"   [DRY RUN] WhatsApp nao enviado")
        print()

    emit_event('sniper', 'complete',
               f'Scan: {len(alerts)} alertas, {monitored} monitorados, {ignored} ignorados')

    if not alerts:
        print("[Sniper] Nenhum trend relevante nesta varredura.")

    print(f"=== Done — proximo scan em ~30min ===")


if __name__ == '__main__':
    main()
