# ⚡ Performance Optimization Workflow

## Objetivo

Otimizar performance técnica de vídeos (file size, loading speed, rendering quality) para maximizar distribuição e minimizar drop-off.

**Tempo:** 2-3 dias
**Output:** Vídeo otimizado -40% file size, loading 2x mais rápido, mesma qualidade visual

---

## Quando Usar

- Vídeos com alto inicial drop-off (primeiros 2s)
- Loading time alto (mobile data)
- File size grande (>50MB)
- Rendering issues (lag, stutter)
- Need cross-platform compatibility

---

## Performance Impact on Virality

```
Loading Time > 2s:
- 30% dos users abandonam
- Algoritmo detecta e penaliza
- Menos impressions = menos reach

Smooth Playback:
- +15% retention
- Melhor user experience
- Algoritmo favorece (quality signal)

File Size <20MB:
- Mobile-friendly
- Faster algorithm processing
- Wider distribution
```

---

## Agentes Envolvidos

**Lead:** @render-master (Rendering Optimization Expert)
**Core Team:**

- @remotion-architect (Remotion Architecture Expert)
- @metrics-guru (Viral Metrics Analyst)
- @algorithm-hacker (Instagram Algorithm Expert)
- @visual-impact (Visual Hook Designer)

**Supporting:**

- @effects-master, @retention-architect

---

## Fase 1: Performance Diagnosis (2-4 horas)

### 1.1 Technical Audit

**@render-master analisa:**

```markdown
CURRENT VIDEO SPECS:

File Properties:

- Format: MP4 (h264)
- Resolution: 1080x1920
- Frame Rate: 60fps
- Bitrate: 12 Mbps
- File Size: 85MB
- Duration: 60s
- Codec: h264 (baseline)

ISSUES IDENTIFIED:
❌ File size too large (>50MB)
❌ Bitrate unnecessarily high
❌ Codec não otimizado
⚠️ 60fps needed? (pode reduzir 30fps)
```

### 1.2 Loading Performance Test

**@metrics-guru:**

```markdown
LOADING ANALYSIS:

Connection Speed Test:

- WiFi (50 Mbps): 1.2s load ✅
- 4G (10 Mbps): 4.8s load ❌
- 3G (2 Mbps): 18.2s load ❌

Drop-off Correlation:

- <1s load: 5% drop
- 1-2s load: 10% drop
- 2-5s load: 30% drop ❌
- > 5s load: 60% drop ❌

DIAGNOSIS: 70% da audiência no mobile data
Need optimization para 4G/3G users
```

### 1.3 Visual Quality Analysis

**⚡ PONTO DE DEBATE OBRIGATÓRIO**

```
@visual-impact analisa:
"Qualidade visual é excelente, mas 80% dela é wasted
em screens pequenos (mobile)"

DEBATE:
@render-master: "Posso reduzir bitrate 40% sem perda perceptível"
@remotion-architect: "30fps suficiente, 60fps só para slow-mo"
@algorithm-hacker: "Instagram comprime anyway, perdemos quality upload"
@metrics-guru: "Balance: quality vs accessibility"

CONSENSUS:
Optimize para mobile-first:
- Bitrate: 12 Mbps → 5 Mbps
- Frame rate: 60fps → 30fps (sem slow-mo)
- Codec: h264 baseline → h264 high profile
- Target file size: <20MB
```

---

## Fase 2: Rendering Optimization (4-6 horas)

### 2.1 Remotion Config Optimization

**@remotion-architect + @render-master:**

```typescript
// remotion.config.ts - OPTIMIZED

import { Config } from "@remotion/cli/config";

// Video Settings
Config.setVideoImageFormat("jpeg"); // vs png (menor size)
Config.setOverwriteOutput(true);

// Quality Settings
Config.setQuality(85); // vs 100 (imperceptível difference)

// Performance Settings
Config.setConcurrency(4); // Parallel rendering
Config.setChromiumDisableWebSecurity(true); // Faster fetch

// Output Settings
Config.setCodec("h264"); // Universal compatibility
Config.setPixelFormat("yuv420p"); // Standard, compatible

// Custom render
export const renderOptimized = {
  codec: "h264",
  crf: 23, // Constant Rate Factor (lower = higher quality, 23 = sweet spot)
  pixelFormat: "yuv420p",
  proResProfile: undefined, // Don't use ProRes (huge files)
  x264Preset: "medium", // Balance speed vs compression
  enforceAudioTrack: true,
  muted: false,
  audioBitrate: "128k", // vs 320k (suficiente para voice)
  videoBitrate: "5000k", // 5 Mbps (sweet spot mobile)
  height: 1920,
  width: 1080,
  fps: 30, // vs 60 (30 suficiente)
};
```

### 2.2 Asset Optimization

**@remotion-architect otimiza assets:**

```markdown
ASSET OPTIMIZATION:

Images:
BEFORE:

- Format: PNG (lossless)
- Size: 2-5MB each
- Total: 45MB

AFTER:

- Format: WebP (lossy, 80% quality)
- Size: 200-400KB each
- Total: 8MB
- Saving: -82% ✅

Fonts:
BEFORE:

- Inter: Complete family (400KB)
- Source Serif: Complete (350KB)

AFTER:

- Inter: Only SemiBold 600 (80KB)
- Source Serif: Only Regular 400 (70KB)
- Saving: -80% ✅

Audio:
BEFORE:

- Format: WAV (uncompressed)
- Bitrate: 1411 kbps
- Size: 10.5MB

AFTER:

- Format: AAC (compressed)
- Bitrate: 128 kbps
- Size: 960KB
- Saving: -91% ✅
```

### 2.3 Code Optimization

**@remotion-architect refatora:**

```typescript
// BEFORE (slow, heavy)
const BadComponent = () => {
  // Re-renders every frame
  const expensiveCalc = complexOperation();

  return <div>{expensiveCalc}</div>;
};

// AFTER (fast, optimized)
const GoodComponent = () => {
  const frame = useCurrentFrame();

  // Memoize expensive calculations
  const expensiveCalc = useMemo(() => {
    return complexOperation();
  }, []); // Empty deps = calculate once

  // Optimize interpolations
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp", // Prevent unnecessary calculations
    easing: Easing.ease, // Use built-in easings (faster)
  });

  return (
    <div style={{ opacity }}>
      {expensiveCalc}
    </div>
  );
};

// Use React.memo for static components
export const StaticComponent = React.memo(() => {
  return <StaticContent />;
});
```

---

## Fase 3: Compression Strategy (2-3 horas)

### 3.1 Two-Pass Encoding

**@render-master:**

```bash
# Use ffmpeg para two-pass encoding (melhor compression)

# Pass 1: Analysis
ffmpeg -i input.mp4 -c:v libx264 -b:v 5000k -pass 1 -f mp4 /dev/null

# Pass 2: Optimized encoding
ffmpeg -i input.mp4 \
  -c:v libx264 \
  -b:v 5000k \
  -pass 2 \
  -c:a aac \
  -b:a 128k \
  -movflags +faststart \
  -pix_fmt yuv420p \
  -preset medium \
  -crf 23 \
  output_optimized.mp4

# Result:
# Input: 85MB → Output: 18MB (-78% size) ✅
# Quality: Visually identical
# Loading: 4.8s → 1.1s on 4G ✅
```

### 3.2 Instagram-Specific Optimization

**⚡ PONTO DE DEBATE**

```
@algorithm-hacker explica Instagram compression:

"Instagram re-compresses todos uploads. Se enviamos
super high quality, perdemos tempo e bandwidth.
Melhor: pre-optimize para Instagram specs"

DEBATE:
@visual-impact: "Worry about quality loss"
@render-master: "Instagram comprime anyway, pre-optimize = faster"
@metrics-guru: "Dados: pre-optimized = +20% faster processing"
@remotion-architect: "Can test A/B: high quality vs optimized"

VOTAÇÃO:
Consenso: Pre-optimize para Instagram specs

INSTAGRAM OPTIMAL SPECS:
- Resolution: 1080x1920 (Reels)
- Frame Rate: 30fps
- Codec: H.264
- Bitrate: 5-8 Mbps (video), 128 kbps (audio)
- Format: MP4
- Max Duration: 90s
- Recommended Size: <20MB
```

### 3.3 Quality Validation

**@visual-impact verifica:**

```markdown
QUALITY CHECK (side-by-side):

ORIGINAL (85MB):

- Visual quality: 10/10
- Details: Perfect
- Colors: Vibrant
- Motion: Butter smooth

OPTIMIZED (18MB):

- Visual quality: 9.5/10 ✅
- Details: 98% maintained ✅
- Colors: Identical ✅
- Motion: Smooth ✅

PERCEPTUAL DIFFERENCE:

- Desktop: Imperceptível
- Mobile: Literally identical ✅

VERDICT: Optimize approved
```

---

## Fase 4: Cross-Platform Testing (1 dia)

### 4.1 Device Matrix Testing

**@metrics-guru + @algorithm-hacker:**

```markdown
TEST MATRIX:

Devices:

- iPhone 13 (iOS 17)
- Samsung Galaxy S23 (Android 14)
- iPhone X (iOS 16 - older)
- Xiaomi Redmi (Android 12 - budget)

Networks:

- WiFi (50 Mbps)
- 4G (10 Mbps)
- 3G (2 Mbps)

Metrics Tracked:

- Load time
- First frame time
- Playback smoothness (FPS)
- Battery drain
- Data usage
```

**Results:**

| Device/Network | Load Time | FPS | Battery | Data |
| -------------- | --------- | --- | ------- | ---- |
| iPhone 13/WiFi | 0.8s      | 30  | Low     | 18MB |
| iPhone 13/4G   | 1.1s      | 30  | Low     | 18MB |
| Galaxy S23/4G  | 1.0s      | 30  | Low     | 18MB |
| iPhone X/3G    | 3.2s      | 30  | Medium  | 18MB |
| Redmi/3G       | 3.8s      | 30  | Medium  | 18MB |

**All devices:** ✅ Playback smooth, no stuttering

### 4.2 Instagram Upload Test

**@algorithm-hacker testa:**

```markdown
UPLOAD TEST:

Direct Upload (Instagram API):

- Upload time: 12s (vs 28s original)
- Processing time: 8s (vs 18s original)
- Final Instagram size: 19MB (vs 42MB)
- Quality after IG compression: Identical ✅

Story Upload:

- Upload time: 8s
- Processing: 5s
- Quality: Perfect ✅

Feed Upload (1:1 crop):

- Upload time: 7s
- Quality: Perfect ✅

RESULT: 2.5x faster upload + process
```

---

## Fase 5: Automated Pipeline (2-3 horas)

### 5.1 Build Optimization Script

**@remotion-architect cria:**

```typescript
// optimize-render.ts

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

async function optimizedRender(compositionId: string) {
  // Step 1: Bundle
  const bundled = await bundle({
    entryPoint: "src/index.ts",
    webpackOverride: (config) => {
      // Optimize webpack
      config.optimization = {
        ...config.optimization,
        minimize: true,
        usedExports: true,
      };
      return config;
    },
  });

  // Step 2: Select composition
  const composition = await selectComposition({
    serveUrl: bundled,
    id: compositionId,
  });

  // Step 3: Render optimized
  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: "h264",
    crf: 23,
    pixelFormat: "yuv420p",
    videoBitrate: "5000k",
    audioBitrate: "128k",
    outputLocation: `out/${compositionId}.mp4`,
    frameRange: [0, composition.durationInFrames - 1],
  });

  // Step 4: Post-process using ffmpeg CLI
  // (Run ffmpeg with -movflags +faststart for streaming optimization)

  console.log("✅ Optimized render complete!");
}
```

### 5.2 Quality Control Automation

**@render-master:**

```typescript
// quality-check.ts

async function validateOutput(videoPath: string) {
  const checks = {
    fileSize: false,
    resolution: false,
    frameRate: false,
    codec: false,
    bitrate: false,
  };

  // Check file size (<20MB)
  const stats = fs.statSync(videoPath);
  checks.fileSize = stats.size < 20 * 1024 * 1024;

  // Use ffprobe CLI tool to check specs
  // (ffprobe -v quiet -print_format json -show_format -show_streams)

  // Validate:
  // - Resolution: 1080x1920
  // - Frame rate: 30fps
  // - Codec: h264
  // - Bitrate: <6 Mbps

  const allPassed = Object.values(checks).every((c) => c);

  if (allPassed) {
    console.log("✅ All quality checks passed!");
  } else {
    console.error("❌ Quality checks failed:", checks);
  }

  return allPassed;
}
```

---

## Fase 6: Performance Monitoring (ongoing)

### 6.1 Metrics Tracking

**@metrics-guru setup dashboard:**

```markdown
PERFORMANCE DASHBOARD:

Technical Metrics:

- File size (target: <20MB)
- Load time (target: <2s on 4G)
- FPS consistency (target: 30fps solid)
- Upload time (target: <15s)

User Impact Metrics:

- Drop-off @0-2s (target: <10%)
- Playback issues reported (target: <1%)
- Retention @3s (target: >75%)
- Completion rate (target: >40%)

Algorithm Signals:

- Impressions velocity
- Reach rate
- Distribution efficiency
```

### 6.2 A/B Test Results

**@ab-test-master:**

```markdown
A/B TEST: Original vs Optimized

Original (85MB, 12 Mbps):

- Views: 820K
- Drop-off @2s: 28%
- Retention @3s: 71%
- Avg load time: 4.2s
- Impressions: 2.1M

Optimized (18MB, 5 Mbps):

- Views: 1.05M (+28%) ✅
- Drop-off @2s: 9% (-68%) ✅
- Retention @3s: 79% (+8pp) ✅
- Avg load time: 1.1s (-74%) ✅
- Impressions: 2.9M (+38%) ✅

WINNER: Optimized version
Algorithm boost: +38% impressions
```

---

## Sistema de Debate

### Pontos de Debate Obrigatórios

1. ✅ **Quality vs file size trade-off** (crítico)
2. ✅ **Instagram pre-optimization** (strategy)
3. **Frame rate 60fps vs 30fps** (technical)
4. **Automation level** (efficiency)

### Regras de Consenso

- **Quality:** Unanimidade (impacta brand)
- **Technical specs:** @render-master veto power
- **Algorithm:** @algorithm-hacker has final say
- **Rollout:** Maioria >60%

---

## Checklist Final

### Diagnosis Phase

- [ ] Technical audit completo
- [ ] Loading performance tested
- [ ] Visual quality baseline
- [ ] Device matrix defined

### Optimization Phase

- [ ] Remotion config optimized
- [ ] Assets compressed (images, audio, fonts)
- [ ] Code refatorado (memoization)
- [ ] Two-pass encoding executed
- [ ] Instagram specs met

### Testing Phase

- [ ] Cross-device testing (4+ devices)
- [ ] Cross-network testing (WiFi, 4G, 3G)
- [ ] Instagram upload tested
- [ ] Quality validated (side-by-side)
- [ ] A/B test executed

### Automation Phase

- [ ] Build pipeline automated
- [ ] Quality checks automated
- [ ] Monitoring dashboard setup

---

## Benchmarks de Sucesso

### Technical Metrics

| Métrica         | Before | After | Improvement |
| --------------- | ------ | ----- | ----------- |
| File Size       | 85MB   | 18MB  | -78%        |
| Bitrate         | 12Mbps | 5Mbps | -58%        |
| Load Time (4G)  | 4.8s   | 1.1s  | -77%        |
| Upload Time     | 28s    | 12s   | -57%        |
| Processing Time | 18s    | 8s    | -55%        |

### User Impact Metrics

| Métrica       | Before | After | Improvement |
| ------------- | ------ | ----- | ----------- |
| Drop-off @2s  | 28%    | 9%    | -68%        |
| Retention @3s | 71%    | 79%   | +8pp        |
| Views         | 820K   | 1.05M | +28%        |
| Impressions   | 2.1M   | 2.9M  | +38%        |

---

## Tempo Total: 2-3 dias

**Breakdown:**

- Diagnosis: 2-4 horas
- Optimization: 4-6 horas
- Compression: 2-3 horas
- Testing: 1 dia
- Automation: 2-3 horas

---

## Pro Tips

### Do's ✅

- Always test on real devices (não só desktop)
- Optimize para mobile-first (70%+ da audiência)
- Use two-pass encoding (melhor compression)
- Automate quality checks (consistency)
- Monitor performance metrics (continuous)

### Don'ts ❌

- Não sacrifique quality visível (brand impact)
- Não ignore Instagram compression (pre-optimize)
- Não use 60fps unless slow-mo needed
- Não skip cross-platform testing
- Não envie uncompressed assets

---

## Technical Spec Cheat Sheet

### Optimal Instagram Specs

```
Resolution: 1080x1920 (Reels)
Frame Rate: 30fps
Codec: H.264 (high profile)
Pixel Format: yuv420p
Video Bitrate: 5-8 Mbps
Audio Bitrate: 128 kbps
Audio Codec: AAC
Container: MP4
Max File Size: 20MB
CRF: 23 (sweet spot)
```

### Remotion Optimization

```typescript
{
  codec: 'h264',
  crf: 23,
  videoBitrate: '5000k',
  audioBitrate: '128k',
  fps: 30,
  quality: 85,
  imageFormat: 'jpeg',
  pixelFormat: 'yuv420p'
}
```

---

**Este workflow garante performance técnica impecável sem sacrificar qualidade visual.** ⚡🚀
