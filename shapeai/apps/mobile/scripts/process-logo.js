const sharp = require('sharp')
const path = require('path')

const SRC = path.resolve('C:/Users/PICHAU/Downloads/ChatGPT Image 13 de mai. de 2026, 13_26_30.png')
const ASSETS = path.resolve(__dirname, '../assets')

async function run() {
  // Splash icon — logo com fundo transparente, 512x512
  await sharp(SRC)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(ASSETS, 'splash-icon.png'))
  console.log('✓ splash-icon.png')

  // App icon — logo centralizada em fundo #0A0A0A, 1024x1024
  const bg = await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: { r: 10, g: 10, b: 10, alpha: 1 } }
  }).png().toBuffer()

  const logo = await sharp(SRC)
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
