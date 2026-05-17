const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = "sk_pmBF6hTFDV0UFDFGHRsTHTlPG4GYP9ej";
const PUBLIC_DIR = path.join(__dirname, 'public');

const imagesToGenerate = [
  // About Page
  { name: 'about_hero.png', prompt: 'Cinematic wide shot of a modern high-tech corporate headquarters with glass facade, dark moody lighting, drone flying in the sky', w: 1920, h: 600 },
  { name: 'about_lab.png', prompt: 'A futuristic drone development laboratory with engineers working, dark cinematic lighting', w: 600, h: 600 },
  // Services
  { name: 'services_hero.png', prompt: 'Multiple advanced commercial drones flying in formation, dark stormy sky, cinematic', w: 1920, h: 600 },
  { name: 'services_payload.png', prompt: 'Micro photography of a highly detailed futuristic drone payload system, dark background, blue accents', w: 800, h: 500 },
  { name: 'services_agri.png', prompt: 'Industrial drone spraying crops at night, beam lights shining down, cinematic composition', w: 800, h: 500 },
  { name: 'services_map.png', prompt: '3D topographic wireframe map being scanned by a drone laser, dark sci-fi environment', w: 800, h: 500 },
  // Training
  { name: 'training_hero.png', prompt: 'A group of people in a modern outdoor training field learning to fly drones, cinematic, dramatic sky', w: 1920, h: 600 },
  { name: 'training_remote.png', prompt: 'Person holding a highly detailed quadcopter drone remote control, close up, outdoor', w: 600, h: 400 },
  { name: 'training_fixed.png', prompt: 'Fixed wing drone taking off, cinematic, dramatic lighting', w: 600, h: 400 },
  { name: 'training_instructor.png', prompt: 'Silhouette of a drone instructor pointing at a screen in a dark control room', w: 600, h: 400 },
  // Repair
  { name: 'repair_hero.png', prompt: 'Close up of a drone motherboard being repaired with a soldering iron glowing, dark sci-fi lighting', w: 1920, h: 600 },
  { name: 'repair_bench.png', prompt: 'A futuristic clean repair room with drone parts nicely organized on a table, blue led lights', w: 600, h: 800 },
  // News
  { name: 'news_hero.png', prompt: 'A futuristic digital news hologram floating over a cityscape, cinematic dark', w: 1920, h: 600 },
  { name: 'news_1.png', prompt: 'A dramatic shot of a drone flying over a lush green mountain orchard at sunset', w: 400, h: 300 },
  { name: 'news_2.png', prompt: 'Group of professional pilots standing proudly in front of a drone fleet, dark moody', w: 400, h: 300 },
  { name: 'news_3.png', prompt: 'A futuristic high-tech repair center signage with drone silhouettes, neon lights', w: 400, h: 300 },
  // Cases
  { name: 'cases_hero.png', prompt: 'Gallery of drone photographs floating in a high-tech dark room, holographic', w: 1920, h: 600 },
  { name: 'cases_1.png', prompt: 'Cinematic drone shot over high altitude pine forest mountains at dawn, dark moody', w: 600, h: 400 },
  { name: 'cases_2.png', prompt: 'A massive suspension bridge being scanned by a drone with neon laser grid, cyberpunk vibe', w: 600, h: 400 },
  { name: 'cases_3.png', prompt: 'Night vision thermal camera view from a drone over a dense jungle, rescue lights', w: 600, h: 400 },
  { name: 'cases_4.png', prompt: 'High voltage power lines close up with a futuristic drone inspecting them, dramatic stormy sky', w: 600, h: 400 },
  { name: 'cases_5.png', prompt: 'A heavy duty tactical police drone in a wind tunnel test chamber, dark lighting', w: 600, h: 400 },
  { name: 'cases_6.png', prompt: 'Drone spraying mist over beautiful terraced rice fields in the evening, cinematic', w: 600, h: 400 },
];

function downloadImage({ name, prompt, w, h }) {
  return new Promise((resolve, reject) => {
    const encodedPrompt = encodeURIComponent(prompt);
    // Pollinations URL format
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${w}&height=${h}&nologo=true&seed=${Math.floor(Math.random()*1000)}`;
    const dest = path.join(PUBLIC_DIR, name);
    
    // Check if exists
    if(fs.existsSync(dest)) {
      console.log(`[SKIP] ${name} already exists.`);
      return resolve();
    }
    
    const options = {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    };
    
    console.log(`[DOWNLOADING] ${name}...`);
    https.get(url, options, (res) => {
      if (res.statusCode !== 200) {
        if(res.statusCode === 301 || res.statusCode === 302) {
           https.get(res.headers.location, (res2) => {
              const file = fs.createWriteStream(dest);
              res2.pipe(file);
              file.on('finish', () => { file.close(); resolve(); });
           }).on('error', reject);
           return;
        }
        return reject(new Error(`Failed to download ${name}, status: ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function start() {
  console.log(`Starting to generate and download ${imagesToGenerate.length} images using Pollinations AI sequentially...`);
  
  for (let i = 0; i < imagesToGenerate.length; i++) {
    const img = imagesToGenerate[i];
    try {
      await downloadImage(img);
      console.log(`[SUCCESS] Downloaded ${img.name}`);
      // Wait 1.5 seconds between requests to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (err) {
      console.error(`[ERROR] Failed on ${img.name}:`, err.message);
    }
  }
  console.log('Finished processing all images.');
}

start();
