const sharp = require('sharp')
const path = require('path')

const SRC = path.resolve('C:/Users/PICHAU/Downloads/ChatGPT Image 13 de mai. de 2026, 13_26_30.png')
const ASSETS = path.resolve(__dirname, '../assets')

async function run() {
  // Splash icon — logo completa (com texto), trimada, 512x512 transparente
  await sharp(SRC)
    .trim()
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(ASSETS, 'splash-icon.png'))
  console.log('✓ splash-icon.png')

  // Corta só o símbolo (top 62%) para o ícone do app
  const trimmed = await sharp(SRC).trim().toBuffer({ resolveWithObject: true })
  const symbolHeight = Math.round(trimmed.info.height * 0.62)
  const symbolOnly = await sharp(trimmed.data)
    .extract({ left: 0, top: 0, width: trimmed.info.width, height: symbolHeight })
    .toBuffer()

  // App icon — símbolo centralizado em fundo #0A0A0A, 1024x1024
  const bg = await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: { r: 10, g: 10, b: 10, alpha: 1 } }
  }).png().toBuffer()

  const logo = await sharp(symbolOnly)
    .resize(720, 720, { fit: 'contain', background: { r: 10, g: 10, b: 10, alpha: 0 } })
    .png()
    .toBuffer()

  await sharp(bg)
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(path.join(ASSETS, 'icon.png'))
  console.log('✓ icon.png')

  // Android adaptive icon — logo centralizada em fundo #0A0A0A, 1024x1024
  await sharp(bg)
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(path.join(ASSETS, 'adaptive-icon.png'))
  console.log('✓ adaptive-icon.png')
}

run().catch(console.error)
