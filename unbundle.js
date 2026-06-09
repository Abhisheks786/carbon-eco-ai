const fs = require('fs');
const path = require('path');

const filesToProcess = [
  'frontend-core-setup.tsx',
  'dashboard-page.tsx',
  'calculator-page.tsx',
  'community-page.tsx',
  'carbon-twin-page.tsx',
  'auth-pages.tsx',
  'backend-server.js',
  'backend-middleware-utils.js',
  'schema.prisma',
  'tailwind-config.ts'
];

filesToProcess.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  let currentFile = null;
  let currentContent = [];
  
  const saveCurrentFile = () => {
    if (currentFile && currentContent.length > 0) {
      // Determine base directory
      let targetPath = currentFile;
      if (currentFile.startsWith('app/') || currentFile.startsWith('components/') || currentFile.startsWith('lib/') || currentFile.startsWith('styles/') || currentFile === 'tailwind.config.ts' || currentFile === 'postcss.config.js') {
        targetPath = path.join('frontend', currentFile);
      } else if (currentFile.startsWith('prisma/')) {
        targetPath = path.join('backend', currentFile);
      }
      // 'backend/' prefix already points to backend/ directory, just keep it
      
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(targetPath, currentContent.join('\n'));
      console.log(`Created ${targetPath}`);
    }
  };
  
  lines.forEach(line => {
    const trimmed = line.trim();
    // Match // path/to/file.ext or // filename.ext
    // Specifically looking for known prefixes or exact matches
    const isFileComment = trimmed.match(/^\/\/\s+((app|components|lib|styles|backend|prisma)\/[\w\-\./]+|tailwind\.config\.ts|postcss\.config\.js)$/);
    
    if (isFileComment) {
      saveCurrentFile();
      currentFile = isFileComment[1];
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  });
  
  saveCurrentFile();
});

// Also handle the static copies
fs.copyFileSync('frontend-package.json', 'frontend/package.json');
fs.copyFileSync('backend-package.json', 'backend/package.json');
fs.copyFileSync('frontend-env-example', 'frontend/.env.local');
fs.copyFileSync('backend-env-example', 'backend/.env');

console.log('Unbundling complete.');
