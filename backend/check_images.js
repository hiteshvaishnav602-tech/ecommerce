import fs from 'fs';
import https from 'https';

const seedContent = fs.readFileSync('seed.js', 'utf8');
const urlRegex = /https:\/\/images\.unsplash\.com\/[^'"]+/g;
const urls = [...new Set(seedContent.match(urlRegex))];

console.log(`Found ${urls.length} unique Unsplash URLs in seed.js. Validating...`);

let checked = 0;
let broken = 0;

urls.forEach((url) => {
  https.get(url, (res) => {
    if (res.statusCode >= 400) {
      console.log(`❌ BROKEN (${res.statusCode}): ${url}`);
      broken++;
    } else {
      console.log(`✅ OK (${res.statusCode}): ${url}`);
    }
    checked++;
    if (checked === urls.length) {
      console.log(`\nValidation complete. Found ${broken} broken URLs.`);
    }
  }).on('error', (e) => {
    console.log(`❌ ERROR: ${url} - ${e.message}`);
    broken++;
    checked++;
    if (checked === urls.length) {
      console.log(`\nValidation complete. Found ${broken} broken URLs.`);
    }
  });
});
