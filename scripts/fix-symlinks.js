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
console.log(`[Fix] Finished symbols check.`);
