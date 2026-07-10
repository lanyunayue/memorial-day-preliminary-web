const fs = require('fs');
const path = require('path');

function localAsset(root, url) {
  const clean = url.split(/[?#]/)[0].replace(/^\.\//, '');
  const file = path.resolve(root, clean);
  if (!file.startsWith(path.resolve(root) + path.sep)) throw new Error(`asset escapes root: ${url}`);
  return file;
}

function loadShikeSource(root) {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const styles = [...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => fs.readFileSync(localAsset(root, match[1]), 'utf8'));
  const classicScripts = [...html.matchAll(/<script\b([^>]*)src=["']([^"']+)["'][^>]*><\/script>/gi)]
    .filter((match) => !/type=["']module["']/i.test(match[1]))
    .map((match) => fs.readFileSync(localAsset(root, match[2]), 'utf8'));
  return { html, style: styles.join('\n'), script: classicScripts.join('\n'), classicScripts };
}

module.exports = { loadShikeSource };
