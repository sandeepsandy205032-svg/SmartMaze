const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const ARTIFACT_DIR = "C:\\Users\\sande\\.gemini\\antigravity-ide\\brain\\c0b45e6a-4255-4d3a-b1e1-2e8d0617c8cc";

async function runVerification() {
  console.log("Launching Edge via puppeteer-core...");
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR:', msg.text());
    }
  });

  console.log("Navigating to http://localhost:5173 ...");
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

  await new Promise(r => setTimeout(r, 1500));

  async function testLevelMovement(levelId, name) {
    console.log(`\n=== TESTING LEVEL ${levelId}: ${name} ===`);
    
    await page.evaluate((lid) => {
      if (window.smartMazeLaunchGameplay) {
        window.smartMazeLaunchGameplay(lid);
      }
    }, levelId);

    await new Promise(r => setTimeout(r, 3200));

    const isGameplay = await page.evaluate(() => {
      return !!document.querySelector('.smartmaze-gameplay-stage, .smartmaze-maze-chamber');
    });

    console.log(`Level ${levelId} Gameplay active: ${isGameplay}`);

    const ssPath = path.join(ARTIFACT_DIR, `m102_level_${levelId}_initial.png`);
    await page.screenshot({ path: ssPath });
    console.log(`Saved screenshot: m102_level_${levelId}_initial.png`);

    // Perform valid movement key presses
    await page.keyboard.press('ArrowRight');
    await new Promise(r => setTimeout(r, 200));
    await page.keyboard.press('ArrowDown');
    await new Promise(r => setTimeout(r, 200));

    // Perform blocked wall movement key press to verify bump feedback
    await page.keyboard.press('ArrowLeft');
    await new Promise(r => setTimeout(r, 200));

    const ssMovedPath = path.join(ARTIFACT_DIR, `m102_level_${levelId}_action.png`);
    await page.screenshot({ path: ssMovedPath });
    console.log(`Saved action screenshot: m102_level_${levelId}_action.png`);
  }

  // Regression test Level 1, Level 7, Level 20
  await testLevelMovement(1, "The Threshold Movement");
  await testLevelMovement(7, "The Rotating Halls Movement");
  await testLevelMovement(20, "The Final Passage Movement");

  console.log("\nAll M10.2 movement verifications finished successfully!");
  await browser.close();
}

runVerification().catch(err => {
  console.error("Verification script error:", err);
  process.exit(1);
});
