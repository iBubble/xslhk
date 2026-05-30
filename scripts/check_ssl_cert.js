/**
 * 🔒 SSL 证书状态定时/手动检查脚本 (SSL Certificate Status Checker)
 * 
 * 用法：node scripts/check_ssl_cert.js
 * 
 * 功能：
 * 读取 Let's Encrypt 证书，解析其到期时间，计算剩余有效天数并报告状态。
 * 可以直接挂载至系统 crontab 中进行定时健康监控。
 */

const fs = require('fs');
const crypto = require('crypto');

function checkSslCertificate() {
  const certPath = '/etc/letsencrypt/live/www.ynxslhk.com/fullchain.pem';
  
  console.log('==================================================');
  console.log('🔒 开始对 www.ynxslhk.com 域名 SSL 证书进行状态检查...');
  console.log('==================================================');

  if (!fs.existsSync(certPath)) {
    console.error('❌ 错误：未在预期路径找到 Let\'s Encrypt 证书文件！');
    console.error(`   预期路径: ${certPath}`);
    console.log('==================================================');
    process.exit(1);
  }

  try {
    const certPem = fs.readFileSync(certPath, 'utf8');
    const cert = new crypto.X509Certificate(certPem);

    const validFrom = new Date(cert.validFrom);
    const validTo = new Date(cert.validTo);
    const now = new Date();

    const msDiff = validTo.getTime() - now.getTime();
    const daysLeft = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

    console.log(`📡 证书颁发机构 (Issuer): ${cert.issuer}`);
    console.log(`📌 证书使用者 (Subject): ${cert.subject}`);
    console.log(`📅 生效时间 (Valid From): ${validFrom.toLocaleString('zh-CN')}`);
    console.log(`📅 到期时间 (Valid To): ${validTo.toLocaleString('zh-CN')}`);
    
    if (daysLeft <= 0) {
      console.error(`🚨 [警告] SSL 证书已过期！已失效 ${Math.abs(daysLeft)} 天。请立刻运行 'certbot renew' 重新生成！`);
      console.log('==================================================');
      process.exit(1);
    } else if (daysLeft < 15) {
      console.warn(`⚠️ [警告] SSL 证书即将过期！仅剩最后 ${daysLeft} 天有效时间。系统近期将会尝试由 Certbot 定时器自动续期。`);
      console.log('==================================================');
      process.exit(0);
    } else {
      console.log(`✅ [状态正常] SSL 证书有效状态良好！剩余有效天数：${daysLeft} 天。`);
      console.log('==================================================');
      process.exit(0);
    }
  } catch (error) {
    console.error(`❌ 解析证书文件时发生异常：${error.message}`);
    console.log('==================================================');
    process.exit(1);
  }
}

checkSslCertificate();
