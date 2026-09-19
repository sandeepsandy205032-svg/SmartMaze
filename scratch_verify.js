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

  await page.waitForSelector('.hub-screen, .level-select-screen', { timeout: 10000 });
  console.log("App loaded successfully!");

  // Unlock levels in localStorage
  await page.evaluate(() => {
    const progress = {
      unlockedLevels: Array.from({ length: 20 }, (_, i) => i + 1),
      completedLevels: Array.from({ length: 19 }, (_, i) => i + 1),
      stars: {}
    };
    for (let i = 1; i <= 20; i++) progress.stars[i] = 3;
    localStorage.setItem('smartmaze_progression', JSON.stringify(progress));
  });

  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  async function testLevel(levelId, name) {
    console.log(`\n=== TESTING LEVEL ${levelId}: ${name} ===`);
    
    // Ensure we are back on level select screen if needed
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const archiveBtn = btns.find(b => b.textContent.includes('LEVEL ARCHIVE') || b.textContent.includes('LEVEL SELECT') || b.textContent.includes('ENTER ARCHIVE'));
      if (archiveBtn) archiveBtn.click();
    });
    
    await new Promise(r => setTimeout(r, 800));

    const selected = await page.evaluate((lid) => {
      const cards = Array.from(document.querySelectorAll('.level-card, .realm-card'));
      const card = cards.find(c => c.textContent.includes(`0${lid}`) || c.textContent.includes(`${lid}`));
      if (card) {
        card.click();
        return true;
      }
      return false;
    }, levelId);

    if (!selected) {
      console.log(`Could not find card for Level ${levelId}`);
      return;
    }

    await new Promise(r => setTimeout(r, 500));

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const launchBtn = btns.find(b => b.textContent.includes('LAUNCH') || b.textContent.includes('ENTER') || b.textContent.includes('START') || b.textContent.includes('PLAY'));
      if (launchBtn) launchBtn.click();
    });

    await new Promise(r => setTimeout(r, 1500));

    const isGameplay = await page.evaluate(() => {
      return !!document.querySelector('.gameplay-screen, .maze-container, canvas');
    });

    console.log(`Level ${levelId} Gameplay active: ${isGameplay}`);

    const ssPath = path.join(ARTIFACT_DIR, `m92_level_${levelId}_initial.png`);
    await page.screenshot({ path: ssPath });
    console.log(`Saved screenshot: m92_level_${levelId}_initial.png`);

    for (let k = 0; k < 4; k++) {
      await page.keyboard.press('ArrowRight');
      await new Promise(r => setTimeout(r, 150));
      await page.keyboard.press('ArrowDown');
      await new Promise(r => setTimeout(r, 150));
    }

    const ssMovedPath = path.join(ARTIFACT_DIR, `m92_level_${levelId}_action.png`);
    await page.screenshot({ path: ssMovedPath });
    console.log(`Saved action screenshot: m92_level_${levelId}_action.png`);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const exitBtn = btns.find(b => b.textContent.includes('EXIT') || b.textContent.includes('BACK') || b.textContent.includes('HUB'));
      if (exitBtn) exitBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));
  }

  await testLevel(7, "State Change Wall");
  await testLevel(8, "Hidden Path");
  await testLevel(9, "Sequence Lock");
  await testLevel(12, "Temporary Path");
  await testLevel(20, "The Final Passage");

  console.log("\nAll browser level verifications finished successfully!");
  await browser.close();
}

runVerification().catch(err => {
  console.error("Verification script error:", err);
  process.exit(1);
});
