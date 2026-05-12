/**
 * UI Module - Core User Interface Components
 *
 * Story 11.6: Projeto Bob - Painel de Observabilidade CLI
 *
 * Provides CLI UI components for AIOX:
 * - ObservabilityPanel: Real-time status display during Bob orchestration
 * - PanelRenderer: Low-level terminal rendering utilities
 *
 * @module core/ui
 * @version 1.0.0
 */

'use strict';

const {
  ObservabilityPanel,
  createPanel,
  PanelMode,
  PipelineStage,
  createDefaultState,
} = require('./observability-panel');

const {
  PanelRenderer,
  BOX,
  STATUS,
} = require('./panel-renderer');

module.exports = {
  // Main panel
  ObservabilityPanel,
  createPanel,
  PanelMode,
  PipelineStage,
  createDefaultState,

  // Renderer utilities
  PanelRenderer,
  BOX,
  STATUS,
};
