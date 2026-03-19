#!/usr/bin/env python3
"""
Hormozi Squad — Antipattern Validator
Runs antipattern screening checklist and returns violations.

Usage:
  python validate-antipattern.py <offer_audit.yaml>
  python validate-antipattern.py --interactive

Returns:
  PASS - No antipatterns detected
  FAIL - Violations listed with remediation

Exit codes:
  0 = PASS
  1 = FAIL (has violations)
"""

import sys
import yaml
from pathlib import Path

ANTIPATTERNS = [
    {
        "id": "AP_001",
        "name": "Churn Estrutural",
        "field": "churn_estrutural",
        "question": "O mercado-alvo tem alta taxa de falencia/desistencia inerente?",
        "red_flags": [
            "Clientes sao iniciantes em algo",
            "Setor com mortalidade > 20%/ano",
            "Clientes temporarios por natureza",
        ],
        "veto_if": True,
        "antidote": "Pivotar para segmento mais estavel",
    },
    {
        "id": "AP_002",
        "name": "Exploracao de Vulneraveis",
        "field": "exploracao_vulneraveis",
        "question": "O modelo explora populacoes vulneraveis?",
        "red_flags": [
            "Publico com baixa educacao financeira",
            "Publico em estado emocional extremo",
            "Promessas que sei que maioria nao conseguira",
        ],
        "veto_if": True,
        "antidote": "VETO ABSOLUTO - Violacao etica fundamental",
    },
    {
        "id": "AP_003",
        "name": "Margem Insuficiente",
        "field": "margem_baixa",
        "question": "Margem bruta < 60%?",
        "red_flags": [
            "Margem < 60% para servicos",
            "Sem oxigenio para investir em entrega",
        ],
        "veto_if": True,
        "antidote": "Aumentar preco ou reduzir custo de entrega",
    },
    {
        "id": "AP_004",
        "name": "CAC > Receita Inicial",
        "field": "cac_maior_fecc",
        "question": "O negocio exige PERDER dinheiro para adquirir cliente?",
        "red_flags": [
            "CAC > FECC (Front End Cash Collected)",
            "Ciclo de caixa negativo",
        ],
        "veto_if": True,
        "antidote": "Criar oferta front-end que liquida CAC",
    },
    {
        "id": "AP_005",
        "name": "Key Man Risk",
        "field": "key_man_risk",
        "question": "O negocio depende CRITICAMENTE do fundador?",
        "red_flags": [
            "So fundador fecha vendas",
            "So fundador entrega servico core",
            "Fundador e o 'produto'",
        ],
        "veto_if": True,
        "antidote": "Documentar processos, treinar equipe",
    },
    {
        "id": "AP_006",
        "name": "Comoditizacao",
        "field": "comoditizado",
        "question": "A oferta e facilmente comparavel por PRECO?",
        "red_flags": [
            "Cliente pergunta preco antes de valor",
            "Competidor oferece 'mesma coisa' mais barato",
            "Sem diferenciador claro",
        ],
        "veto_if": False,  # MODIFY, not VETO
        "antidote": "Engenharia de Grand Slam Offer",
    },
    {
        "id": "AP_007",
        "name": "Escassez Falsa",
        "field": "escassez_falsa",
        "question": "Escassez/urgencia NAO e genuina?",
        "red_flags": [
            "Contador que reseta",
            "Vagas 'limitadas' infinitas",
            "Deadline que estende automaticamente",
        ],
        "veto_if": True,
        "antidote": "Remover ou tornar genuina",
    },
    {
        "id": "AP_008",
        "name": "Promessa sem Prova",
        "field": "sem_prova",
        "question": "Ha promessas sem mecanismo de prova?",
        "red_flags": [
            "Claims sem dados",
            "Depoimentos nao verificaveis",
            "Sem demonstracao do mecanismo",
        ],
        "veto_if": False,  # MODIFY
        "antidote": "Adicionar prova ou reduzir promessa",
    },
    {
        "id": "AP_009",
        "name": "Valor < 10x Preco",
        "field": "baixo_valor_percebido",
        "question": "Valor percebido empilhado < 10x preco?",
        "red_flags": [
            "Stack soma menos que 3x o preco",
            "Ancoragem fraca",
        ],
        "veto_if": False,  # MODIFY
        "antidote": "Aumentar stack ou reduzir preco",
    },
    {
        "id": "AP_010",
        "name": "Mercado Fraco",
        "field": "mercado_fraco",
        "question": "Algum dos 4 indicadores de mercado < 7/10?",
        "red_flags": [
            "Dor Massiva < 7",
            "Poder de Compra < 7",
            "Facil de Atingir < 7",
            "Crescendo < 7",
        ],
        "veto_if": True,
        "antidote": "Repensar mercado antes de lancar",
    },
    {
        "id": "AP_011",
        "name": "Oferta Inchada",
        "field": "oferta_inchada",
        "question": "A oferta tem TANTOS componentes que confunde?",
        "red_flags": [
            "Mais de 10 bonus listados",
            "Cliente nao consegue explicar o que esta comprando",
            "Paralisia de analise reportada",
        ],
        "veto_if": False,  # MODIFY
        "antidote": "Simplificar para 3-5 componentes core",
    },
]


def validate_from_file(filepath: str) -> tuple[bool, list[dict], list[dict]]:
    """Validate antipatterns from YAML file."""
    with open(filepath, "r") as f:
        data = yaml.safe_load(f)

    violations = []
    passed = []

    for ap in ANTIPATTERNS:
        field = ap["field"]
        # Check if field exists and is True (violation)
        is_violation = data.get(field, False) == True

        if is_violation:
            violations.append(ap)
        else:
            passed.append(ap)

    return len(violations) == 0, passed, violations


def interactive_check() -> tuple[bool, list[dict], list[dict]]:
    """Interactive antipattern check via prompts."""
    violations = []
    passed = []

    print("=" * 60)
    print("ANTIPATTERN SCREENING - INTERACTIVE")
    print("Responda Y (sim) ou N (nao) para cada pergunta.")
    print("=" * 60)
    print()

    for ap in ANTIPATTERNS:
        print(f"[{ap['id']}] {ap['name']}")
        print(f"  Pergunta: {ap['question']}")
        print(f"  Red flags:")
        for rf in ap["red_flags"]:
            print(f"    - {rf}")

        while True:
            answer = input("  Este antipattern esta presente? (Y/N): ").strip().upper()
            if answer in ["Y", "N"]:
                break
            print("  Por favor, responda Y ou N.")

        if answer == "Y":
            violations.append(ap)
        else:
            passed.append(ap)
        print()

    return len(violations) == 0, passed, violations


def main():
    if len(sys.argv) < 2:
        print("Usage: python validate-antipattern.py <offer_audit.yaml>")
        print("       python validate-antipattern.py --interactive")
        sys.exit(1)

    if sys.argv[1] == "--interactive":
        is_valid, passed, violations = interactive_check()
    else:
        filepath = sys.argv[1]
        if not Path(filepath).exists():
            print(f"Error: File not found: {filepath}")
            sys.exit(1)
        is_valid, passed, violations = validate_from_file(filepath)

    # Output
    print()
    print("=" * 60)
    print("ANTIPATTERN VALIDATION REPORT")
    print("=" * 60)
    print()

    veto_violations = [v for v in violations if v["veto_if"]]
    modify_violations = [v for v in violations if not v["veto_if"]]

    print(f"Status: {'PASS' if is_valid else 'FAIL'}")
    print(f"Passed: {len(passed)}/{len(ANTIPATTERNS)}")
    print(f"Violations: {len(violations)} ({len(veto_violations)} VETO, {len(modify_violations)} MODIFY)")
    print()

    if violations:
        if veto_violations:
            print("VETO VIOLATIONS (bloqueiam lancamento):")
            for v in veto_violations:
                print(f"  [{v['id']}] {v['name']}")
                print(f"       Antidoto: {v['antidote']}")
            print()

        if modify_violations:
            print("MODIFY VIOLATIONS (ajustar antes de lancar):")
            for v in modify_violations:
                print(f"  [{v['id']}] {v['name']}")
                print(f"       Antidoto: {v['antidote']}")
            print()

    print("=" * 60)

    if is_valid:
        print("RESULT: PASS - Nenhum antipattern critico detectado.")
    elif veto_violations:
        print("RESULT: VETO - Corrigir violacoes antes de lancar.")
        print()
        print("Veto VT1-008: Antipattern detectado. Workflow bloqueado.")
    else:
        print("RESULT: MODIFY - Ajustar violacoes, pode prosseguir com cuidado.")

    print("=" * 60)

    # Exit with 1 only if VETO violations exist
    sys.exit(0 if (is_valid or not veto_violations) else 1)


if __name__ == "__main__":
    main()

# Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10
