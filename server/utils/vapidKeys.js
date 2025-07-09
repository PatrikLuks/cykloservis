// Generování a správa VAPID klíčů pro web push notifikace
// Pokud klíče neexistují, vygenerují se a uloží do souboru

const fs = require('fs');
const path = require('path');
const webpush = require('web-push');

const vapidKeysPath = path.join(__dirname, 'vapid-keys.json');

function generateVapidKeys() {
  const vapidKeys = webpush.generateVAPIDKeys();
  fs.writeFileSync(vapidKeysPath, JSON.stringify(vapidKeys, null, 2));
  return vapidKeys;
}

function getVapidKeys() {
  if (fs.existsSync(vapidKeysPath)) {
    return JSON.parse(fs.readFileSync(vapidKeysPath));
  }
  return generateVapidKeys();
}

module.exports = { getVapidKeys };
