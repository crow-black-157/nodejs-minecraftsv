const http = require('http');
const mineflayer = require('mineflayer');

// Mở cổng web giả để Render giữ service hoạt động
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is running!');
}).listen(process.env.PORT || 3000);

const CONFIG = {
  host: 'cindermc.online',
  port: 25565,
  username: 'nguoingeogiauten',
  auth: 'offline',
  version: '1.20.4',
  physicsEnabled: false,
  brand: 'vanilla',
  hideErrors: true
};

const PASSWORD = 'khanh2k4';

let reconnectTimer = null;
let stopReconnect = false;

function createBot() {
  if (stopReconnect) return;
  console.log('Đang kết nối tới server...');
  const bot = mineflayer.createBot(CONFIG);
  let hasLoggedIn = false;

  const sendLogin = () => {
    if (hasLoggedIn) return;
    hasLoggedIn = true;
    console.log('-> Đang gửi lệnh /login...');
    bot.chat(`/login ${PASSWORD}`);
  };

  bot.once('spawn', () => {
    console.log(`[${new Date().toLocaleTimeString()}] Đã vào game tại tọa độ:`, bot.entity.position);
    setTimeout(sendLogin, 1500);
  });

  bot.on('resourcePack', () => {
    bot.acceptResourcePack();
  });

  bot.on('messagestr', (message) => {
    const msg = message.trim();
    if (!msg) return;
    console.log(`[CHAT] ${msg}`);

    const lower = msg.toLowerCase();
    if (lower.includes('session data has expired') || lower.includes('/login')) {
      setTimeout(sendLogin, 500);
    }
    if (lower.includes('wrong password') || lower.includes('sai mật khẩu')) {
      console.log('❌ Sai mật khẩu! Dừng bot.');
      stopReconnect = true;
      bot.quit();
    }
  });

  const scheduleReconnect = (reason) => {
    if (stopReconnect || reconnectTimer) return;
    console.log(`[${new Date().toLocaleTimeString()}] Mất kết nối (${reason}). Thử lại sau 15 giây...`);
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      createBot();
    }, 15000);
  };

  bot.on('kicked', (reason) => scheduleReconnect(typeof reason === 'object' ? JSON.stringify(reason) : reason));
  bot.on('end', (reason) => scheduleReconnect(reason));
  bot.on('error', (err) => console.log('Lỗi:', err.message));
}

createBot();
