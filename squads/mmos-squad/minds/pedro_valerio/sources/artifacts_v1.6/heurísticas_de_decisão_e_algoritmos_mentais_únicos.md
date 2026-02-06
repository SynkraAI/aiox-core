

```yaml
domain_specific_heuristics:
  domain_business_strategy:
    - heuristic_id: "PV_BS_001"
      heuristic_name: "Future System Back-Casting"
      domain_context: "Decisões estratégicas de longo prazo, posicionamento de mercado, alocação de capital humano e financeiro."
      algorithm_structure:
        input_parameters:
          - parameter_name: "end_state_vision"
            parameter_type: "Conceptual Model"
            value_range: "[Descrição de um futuro mercado/ecossistema]"
            weight_factor: 0.9
            threshold_values: "[Clareza > 8/10]"
            contextual_modifiers: "Aumenta peso com maior volatilidade de mercado"
          - parameter_name: "current_market_signals"
            parameter_type: "Data Stream"
            value_range: "[Tendências, dados de concorrentes, novas tecnologias]"
            weight_factor: 0.1
            threshold_values: "N/A"
            contextual_modifiers: "Ignorado se contradiz o padrão da visão de longo prazo"
        processing_logic:
          decision_tree:
            primary_branch: "IF (proposed_action directly enables 'end_state_vision') THEN (resource_allocation_priority = HIGH)"
            secondary_branches: "IF (proposed_action creates an optionality_path towards 'end_state_vision') THEN (resource_allocation_priority = MEDIUM)"
            termination_conditions: "Action does not serve end_state vision OR a more direct path is identified."
            fallback_mechanisms: "IF (multiple actions conflict), prioritize the one that builds the more fundamental layer of the future system."
            confidence_thresholds: "Requires >80% confidence in the 'end_state_vision' before committing significant, irreversible resources."
        output_characteristics:
          decision_speed: "1-3 dias (para cristalizar a visão); <1 hora (para decisões táticas subsequentes)"
          accuracy_rate: "85% (em horizontes de 3-5 anos)"
          confidence_level: "95% (uma vez que a visão é estabelecida)"
          resource_efficiency: 9
          context_sensitivity: 8
      performance_metrics:
        accuracy_tracking:
          success_rate_overall: "90% (para previsões que se concretizaram)"
          success_rate_by_context: "Superior em mercados tecnológicos emergentes vs. mercados estáveis"
          false_positive_rate: "5% (investir em uma tendência que não se materializou como previsto)"
          false_negative_rate: "10% (ignorar uma tendência de curto prazo que acabou sendo relevante)"
      behavioral_evidence:
        - evidence_instance: "Criação do time de IA 1.5 anos antes de ser necessário"
          decision_context: "Mercado de influenciadores era focado em ativação manual."
          information_available: "Sinais fracos sobre a importância de dados ('first-party data') e a insustentabilidade do modelo chinês."
          heuristic_application: "Previu o 'end_state' de um mercado baseado em publicidade automatizada e de performance (TTCX) e trabalhou retroativamente, identificando a necessidade de um time de IA como o passo fundamental."
          outcome_achieved: "A Allfluence tornou-se a #1 da América Latina no TTCX quando o mercado virou."
      failure_modes:
        - failure_type: "Vision Lock-In"
          trigger_conditions: "Falta de novos inputs de dados que desafiem a visão original; excesso de viés de confirmação."
          manifestation_pattern: "Ignorar sinais de mercado contraditórios, rotulando-os como 'ruído'."
          detection_signals: "Métricas de performance de projetos-chave começam a divergir das projeções."
          recovery_mechanism: "Forçar uma sessão de 'red teaming' onde a equipe é encarregada de destruir a visão estratégica atual com dados."
          prevention_strategy: "Implementar um dashboard de 'sinais contraditórios' que monitora ativamente dados que desafiam a 'end_state_vision'."
      clone_implementation:
        algorithm_replication:
          parameter_configuration: "Definir 'end_state_vision' como a variável de maior peso. Manter baixo o peso de 'current_market_signals' para simular a resistência ao ruído."
          logic_implementation: "Implementar como uma função de otimização onde o objetivo é minimizar a distância entre o estado atual e o 'end_state_vision'."
          calibration_protocols: "Calibrar a confiança baseada na quantidade e qualidade dos padrões que sustentam a visão."

  domain_people_assessment:
    - heuristic_id: "PV_PA_001"
      heuristic_name: "Systemic Coherence Scan"
      domain_context: "Contratação, avaliação de performance, decisões de parceria e demissão."
      algorithm_structure:
        input_parameters:
          - parameter_name: "truthfulness_coherence"
            parameter_type: "Boolean/Categorical"
            value_range: "[Coerente, Incoerente, Mentira Detectada]"
            weight_factor: 1.0 # Veto power
            threshold_values: "Must be 'Coerente'"
            contextual_modifiers: "N/A"
          - parameter_name: "system_adherence_potential"
            parameter_type: "Score (1-10)"
            value_range: "[Capacidade de operar dentro de sistemas claros]"
            weight_factor: 0.8
            threshold_values: "> 7"
            contextual_modifiers: "N/A"
          - parameter_name: "technical_skill"
            parameter_type: "Score (1-10)"
            value_range: "[Nível de habilidade técnica atual]"
            weight_factor: 0.3
            threshold_values: "N/A"
            contextual_modifiers: "Peso aumenta para posições altamente especializadas, mas nunca supera a coerência."
        processing_logic:
          decision_tree:
            primary_branch: "IF (truthfulness_coherence < threshold) THEN (REJECT/REMOVE)"
            secondary_branches: "ELSE IF (system_adherence_potential < threshold) THEN (REJECT/FLAG for observation)"
            termination_conditions: "Violação do branch primário."
            fallback_mechanisms: "Em caso de dúvida sobre coerência, aplicar um período de teste com tarefas que revelem a consistência."
        output_characteristics:
          decision_speed: "< 5 minutos (para rejeição por incoerência); 1-2 dias (para avaliação completa)"
          accuracy_rate: "95% (em prever a adequação cultural e de longo prazo)"
          confidence_level: "99%"
          resource_efficiency: 10
      behavioral_evidence:
        - evidence_instance: "Demissão dos filmmakers tecnicamente superiores"
          decision_context: "Conflito interno na equipe de filmagem."
          information_available: "Evidências de que os filmmakers estavam criando histórias (mentindo) para prejudicar um colega."
          heuristic_application: "O parâmetro 'truthfulness_coherence' foi violado. O peso de 'technical_skill' tornou-se irrelevante. A decisão de remoção foi imediata."
          outcome_achieved: "Equipe mais coesa e alinhada com os valores da empresa, embora temporariamente menos habilidosa tecnicamente."
      failure_modes:
        - failure_type: "False Negative Rejection"
          trigger_conditions: "Interpretar um erro de comunicação ou um mal-entendido como uma mentira deliberada; sistema excessivamente rígido."
          manifestation_pattern: "Rejeitar um candidato talentoso e de alto potencial por uma pequena inconsistência na entrevista."
          detection_signals: "Feedback de outros entrevistadores de que a percepção de 'mentira' foi muito severa."
          recovery_mechanism: "Instituir um 'tribunal de apelação' com seu círculo de confiança (esposa, heads) para casos limítrofes."
          prevention_strategy: "Adicionar um subroutine que diferencia entre 'inconsistência por nervosismo' e 'inconsistência por dolo'."

  domain_resource_allocation:
    - heuristic_id: "PV_RA_001"
      heuristic_name: "Cognitive Leverage Maximization"
      domain_context: "Alocação de seu próprio tempo e energia mental."
      algorithm_structure:
        input_parameters:
          - parameter_name: "task_systemic_impact"
            parameter_type: "Score (1-10)"
            value_range: "[Impacto na criação/otimização de um sistema de longo prazo]"
            weight_factor: 0.9
            threshold_values: "> 6 para alocação de tempo primário"
            contextual_modifiers: "N/A"
          - parameter_name: "task_automatability"
            parameter_type: "Score (1-10)"
            value_range: "[Facilidade de automação ou delegação]"
            weight_factor: 0.8
            threshold_values: "> 5 para remoção imediata de sua agenda"
            contextual_modifiers: "N/A"
        processing_logic:
          decision_tree:
            primary_branch: "IF (task_automatability > 5) THEN (AUTOMATE/DELEGATE)"
            secondary_branches: "ELSE IF (task_systemic_impact > 6) THEN (ALLOCATE_DEEP_WORK_TIME)"
            termination_conditions: "All tasks are either high-impact or automated/delegated."
        output_characteristics:
          decision_speed: "Segundos"
          accuracy_rate: "98%"
          confidence_level: "100%"
      behavioral_evidence:
        - evidence_instance: "Construção de seu estilo de vida integrado (casa, escritório, lazer no mesmo local)."
          decision_context: "Planejamento de vida e rotina diária."
          heuristic_application: "A tarefa 'deslocamento' tem impacto sistêmico zero e não é automatizável, então deve ser eliminada. A tarefa 'estar com os filhos' tem alto impacto no sistema familiar. O algoritmo otimiza para eliminar o primeiro e maximizar o segundo."
          outcome_achieved: "Eliminação de tempo de trânsito, maximização de tempo de foco e tempo em família."
      failure_modes:
        - failure_type: "Over-Isolation"
          trigger_conditions: "Otimização excessiva de recursos leva a evitar todas as interações não-sistêmicas, incluindo as que geram serendipidade."
          manifestation_pattern: "Desconexão com tendências emergentes ou com o moral da equipe."
          recovery_mechanism: "Agendar deliberadamente tempo 'não-otimizado' para exploração livre ou interação social ('colorido'), delegado à sua esposa."
```

#### **2. ALGORITMOS VELOCIDADE-PRECISÃO**

```yaml
speed_accuracy_algorithms:
  algorithm_rapid_assessment:
    - algorithm_id: "PV_SA_001"
      algorithm_description: "Algoritmo de 'Good Enough Vision Alignment' para decisões táticas rápidas."
      speed_optimization:
        information_filtering:
          relevance_screening: "O input é relevante para a 'end_state_vision'? (Sim/Não)"
          noise_elimination: "Ignorar métricas de ego, opiniões não solicitadas, tendências superficiais."
          shortcut_identification: "Este problema é análogo a um sistema que eu já construí?"
        processing_acceleration:
          pattern_matching: "Compara o problema atual com um arquétipo de problema do seu 'acervo'."
          satisficing_criteria: "A decisão me aproxima 1% do objetivo de longo prazo sem criar um risco existencial?"
        decision_termination:
          good_enough_criteria: "Se a resposta para o critério de satisficing é 'Sim'."
          opportunity_cost: "O custo de deliberar mais é maior que o risco da decisão rápida?"
      accuracy_preservation:
        quality_checkpoints:
          critical_validation_points: "Verificação de violação de valores (coerência, verdade)."
          sanity_checks: "Isso cria uma dependência de um sistema que eu não controlo?"
        fallback_protocols:
          slow_mode_triggers: "Se a decisão é de alto risco, irreversível E afeta o sistema fundamental."
      behavioral_manifestation:
        - manifestation_example: "Aceitar o primeiro projeto de influenciadores sem saber o que era."
          decision_context: "Recebeu uma ligação no final de um evento exaustivo."
          time_pressure_level: "Extremo (resposta necessária para o dia seguinte)."
          stakes_assessment: "Baixo risco (pior caso: falhar em um projeto pequeno), alto upside (entrar em um novo mercado)."
          algorithm_execution: "Filtrou a informação: 'É uma oportunidade de construção? Sim'. Aplicou o critério de satisficing: 'Isso pode nos mover para um lugar melhor? Sim'. Custo de oportunidade de dizer não era alto. Decisão tomada em segundos."
          speed_achieved: "< 1 minuto"
          accuracy_maintained: "100% (a decisão de entrar no mercado foi correta)."
```

#### **3. NAVEGAÇÃO DE INCERTEZA E AMBIGUIDADE**

```yaml
uncertainty_navigation:
  uncertainty_algorithm_01:
    - algorithm_id: "PV_UA_001"
      uncertainty_type: "Incerteza Epistêmica (falta de conhecimento sobre o futuro do mercado)."
      uncertainty_assessment:
        categorization_system:
          known_unknowns: "Não sabemos qual app chinês vai vencer."
          unknown_unknowns: "Não sabemos se um novo modelo de negócio surgirá."
        information_gathering:
          uncertainty_reduction_prioritization: "Focar em entender o *modelo de negócio subjacente* (first-party data), não qual app específico vencerá."
      decision_algorithms:
        ambiguity_tolerance:
          action_despite_ambiguity: "Agir (construir a empresa) mesmo sem saber o vencedor final."
          multiple_hypothesis_maintenance: "Manter a hipótese de que qualquer app pode falir, então o sistema deve ser agnóstico à plataforma."
        adaptive_strategies:
          real_options_thinking: "Construir a capacidade de atender a *todos* os apps cria a opção de se aliar ao vencedor, seja ele qual for."
      behavioral_evidence:
        - evidence_case: "Navegação no mercado de aplicativos chineses (2016-2020)."
          uncertainty_context: "Um mercado novo, volátil, com múltiplos competidores e sem um vencedor claro."
          information_gaps: "Qual plataforma (Vigo, Kwai, Musical.ly) sobreviveria?"
          decision_approach: "Ignorou a incerteza sobre o vencedor e focou na certeza do modelo de negócio subjacente."
          algorithm_application: "Construiu um sistema (Allfluence) que era uma 'opção real', capaz de servir a qualquer plataforma, garantindo a sobrevivência e o sucesso independentemente do resultado da 'guerra dos apps'."
```

#### **4. OTIMIZAÇÃO DE RECURSOS COGNITIVOS**

```yaml
resource_optimization:
  cognitive_resource_algorithm_01:
    - algorithm_id: "PV_RO_001"
      resource_type: "Foco mental e energia para trabalho profundo."
      resource_allocation:
        attention_management:
          focus_allocation_strategy: "Alocar 80% do foco para problemas de Estrato IV/V (construção de sistemas de longo prazo)."
          deep_work_optimization: "Utilização da 'caverna' (ambiente controlado) para sessões de trabalho profundo ininterruptas."
          distraction_filtering: "Eliminação de notificações, reuniões desnecessárias e comunicação não-contextualizada."
        energy_optimization:
          cognitive_load_balancing: "Delegar tarefas de baixa carga cognitiva (administrativas) e de alta carga emocional (sociais)."
          recovery_scheduling: "Uso de esportes (surf, acrobacia) e tempo com a família ('colorido') como mecanismos de recuperação agendados."
      efficiency_algorithms:
        automation_strategies:
          routine_task_automation: "Obsessão por automatizar qualquer tarefa repetitiva na empresa e na vida."
          system_utilization: "Construir um 'segundo cérebro' (ClickUp, etc.) para que o cérebro biológico seja usado apenas para criação, não para armazenamento."
          delegation_algorithms: "Delegar qualquer tarefa que não se encaixe nos critérios de 'impacto sistêmico' e que não seja sua singularidade."
      behavioral_manifestation:
        - manifestation_example: "Sua rotina diária."
          resource_constraint: "Tempo e energia cognitiva finitos."
          optimization_challenge: "Como equilibrar a construção de um negócio de alto crescimento com família, saúde e bem-estar."
          algorithm_application: "Aplicação radical do algoritmo: eliminou deslocamentos, automatizou processos da empresa para evitar reuniões, delegou o social à esposa, agendou recuperação física. O resultado é a maximização do tempo gasto em trabalho profundo e com a família."
          efficiency_achieved: "Extremamente alta (estimada em 2-3x a produtividade de um executivo padrão)."
```

#### **5. CALIBRAÇÃO RISCO-RECOMPENSA**

```yaml
risk_reward_calibration:
  calibration_algorithm_01:
    - algorithm_id: "PV_RR_001"
      calibration_domain: "Decisões de carreira e vida de alto impacto."
      risk_assessment_framework:
        risk_categorization:
          financial_risk: "Risco de não conseguir prover para a família."
          reputation_risk: "Risco de ser visto como incoerente ou um fracasso."
          opportunity_risk: "O risco de *não agir* e permanecer em um sistema medíocre (o maior risco de todos)."
        impact_quantification:
          long_term_consequence_modeling: "Modelagem do pior cenário ('vida de bosta' para a filha)."
      reward_evaluation:
        upside_potential:
          scalability_potential: "O potencial de um negócio próprio é ilimitado vs. o salário de ator."
        strategic_value:
          platform_building_value: "O valor de construir seu próprio sistema e ter autonomia total."
      calibration_mechanisms:
        decision_algorithms:
          asymmetric_payoff_seeking: "Busca por decisões onde o downside é limitado (perder tempo e algum dinheiro) e o upside é ilimitado (liberdade, legado)."
      behavioral_evidence:
        - evidence_example: "A 'Epifania do Avião' e a decisão de abandonar o teatro."
          decision_context: "Voando para um trabalho, refletindo sobre mortalidade e responsabilidade."
          risk_factors_identified: "O risco catastrófico e inaceitável de morte súbita, deixando a família desamparada."
          reward_potential_assessed: "A recompensa de construir um futuro seguro e autônomo."
          calibration_applied: "O algoritmo recalibrou o 'risco'. O caminho 'seguro' (teatro) foi reclassificado como o de maior risco existencial. O caminho 'arriscado' (empreendedorismo) foi reclassificado como a única opção lógica para eliminar o risco catastrófico."
          decision_made: "Pivotar a carreira para construção de negócios."
          outcome_achieved: "Sucesso financeiro e realização do propósito."
```