const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Surgical patch for resvg.wasm on Windows.
 * Removes the ?module suffix from the compiled @vercel/og package in node_modules
 * to prevent Wrangler from failing on illegal Windows filenames.
 */
function patchResvg() {
    console.log('🔍 Searching for @vercel/og/index.edge.js...');
    
    // Find all index.edge.js files in @vercel/og
    const nodeModulesPath = path.resolve(process.cwd(), 'node_modules');
    
    try {
        // Use recursive search to find the file in .pnpm or direct node_modules
        const files = findFiles(nodeModulesPath, 'index.edge.js');
        const ogFiles = files.filter(f => f.includes('@vercel') && f.includes('og'));

        if (ogFiles.length === 0) {
            console.log('⚠️ No @vercel/og files found to patch.');
            return;
        }

        ogFiles.forEach(filePath => {
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('resvg.wasm?module')) {
                console.log(`✅ Patching: ${filePath}`);
                content = content.split('resvg.wasm?module').join('resvg.wasm');
                fs.writeFileSync(filePath, content);
            }
        });

        console.log('✨ Patching complete. Wrangler should now be able to deploy.');
    } catch (err) {
        console.error('❌ Patch failed:', err.message);
    }
}

function findFiles(dir, filename, results = [], depth = 0) {
    if (depth > 10) return results; // Prevent infinite recursion
    
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            try {
                const stat = fs.statSync(filePath);
                if (stat.isDirectory()) {
                    // Skip .bin and nested node_modules
                    if (file === '.bin') continue;
                    if (file === 'node_modules' && depth > 0) continue;
                    findFiles(filePath, filename, results, depth + 1);
                } else if (file === filename) {
                    results.push(filePath);
                }
            } catch (err) {
                // Skip files we can't access
                continue;
            }
        }
    } catch (err) {
        console.error(`⚠️ Cannot read directory: ${dir}`);
    }
    return results;
}

patchResvg();
