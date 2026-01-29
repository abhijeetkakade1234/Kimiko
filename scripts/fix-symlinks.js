const fs = require('fs');
const path = require('path');

function fixSymlinks(dir) {
    if (!fs.existsSync(dir)) return;
    
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (err) {
        console.error(`[Fix] Could not read directory ${dir}: ${err.message}`);
        return;
    }
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        try {
            if (entry.isSymbolicLink()) {
                let targetPath;
                try {
                    targetPath = fs.readlinkSync(fullPath);
                } catch (e) {
                    console.warn(`[Fix] Could not read link ${fullPath}, skipping.`);
                    continue;
                }

                const absoluteTarget = path.resolve(dir, targetPath);
                
                if (!fs.existsSync(absoluteTarget)) {
                    console.log(`[Fix] Removing broken symlink: ${fullPath}`);
                    fs.unlinkSync(fullPath);
                    continue;
                }

                console.log(`[Fix] Replacing symlink ${fullPath} -> ${absoluteTarget}`);
                
                const stats = fs.statSync(absoluteTarget);
                fs.unlinkSync(fullPath);
                
                if (stats.isDirectory()) {
                    fs.cpSync(absoluteTarget, fullPath, { recursive: true, dereference: true });
                } else {
                    fs.copyFileSync(absoluteTarget, fullPath);
                }
            } else if (entry.isDirectory()) {
                fixSymlinks(fullPath);
            }
        } catch (err) {
            console.error(`[Fix] Error processing ${fullPath}: ${err.message}`);
            // If it still exists and is a link, try to remove it as a last resort to satisfy Cloudflare
            try { 
                if (fs.lstatSync(fullPath).isSymbolicLink()) fs.unlinkSync(fullPath); 
            } catch (e) {}
        }
    }
}

const buildDir = path.resolve(process.cwd(), '.open-next');
console.log(`[Fix] Scanning for symlinks in ${buildDir}...`);
fixSymlinks(buildDir);

// ENSURE CLOUDFLARE PAGES ROUTING
const workerPath = path.join(buildDir, 'worker.js');
const targetWorkerPath = path.join(buildDir, '_worker.js');

if (fs.existsSync(workerPath)) {
    console.log(`[Fix] Renaming worker.js to _worker.js for Pages compatibility...`);
    fs.renameSync(workerPath, targetWorkerPath);
} else if (!fs.existsSync(targetWorkerPath)) {
    console.error(`[Fix] CRITICAL: No worker entry point found in .open-next!`);
}

// Check for assets directory
const assetsDir = path.join(buildDir, 'assets');
if (fs.existsSync(assetsDir)) {
    console.log(`[Fix] Assets directory found.`);
    console.log(`[Fix] Contents of ${assetsDir}:`, fs.readdirSync(assetsDir));
    
    console.log(`[Fix] Flattening all assets to root...`);
    
    function moveDirRecursive(src, dest) {
        if (!fs.existsSync(src)) return;
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (entry.isDirectory()) {
                moveDirRecursive(srcPath, destPath);
            } else {
                // simple Copy instead of Rename to avoid potential locking/permission issues
                fs.copyFileSync(srcPath, destPath);
                // Try to remove source to verify move, but ignore errors
                try { fs.unlinkSync(srcPath); } catch (e) {}
            }
        }
    }
    
    moveDirRecursive(assetsDir, buildDir);
    console.log(`[Fix] Finished flattening assets.`);
} else {
    console.warn(`[Fix] WARNING: No assets directory found at ${assetsDir}`);
}

// Final Structure Check
console.log(`[Fix] Final root contents of .open-next:`, fs.readdirSync(buildDir));
if (fs.existsSync(path.join(buildDir, '_next'))) {
    console.log(`[Fix] SUCCESS: _next static directory found in root.`);
} else {
    console.error(`[Fix] CRITICAL: _next static directory MISSING from root!`);
}

console.log(`[Fix] Finished symbols check & routing preparation.`);
