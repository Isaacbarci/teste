const fs = require('fs');
const commitHash = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev';
const template = fs.readFileSync('service-worker.template.js', 'utf8');
const final = template.replace('{{COMMIT_HASH}}', commitHash);
fs.writeFileSync('service-worker.js', final);
console.log('Service Worker gerado com hash:', commitHash);