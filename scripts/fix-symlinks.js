const fs = require('fs');
const path = require('path');

function fixSymlinks(dir) {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isSymbolicLink()) {
            const targetPath = fs.readlinkSync(fullPath);
            const absoluteTarget = path.resolve(dir, targetPath);
            
            console.log(`[Fix] Replacing symlink ${fullPath} -> ${absoluteTarget}`);
            
            // Remove the link
            fs.unlinkSync(fullPath);
            
            // Copy the actual file or directory
            if (fs.statSync(absoluteTarget).isDirectory()) {
                fs.cpSync(absoluteTarget, fullPath, { recursive: true });
            } else {
                fs.copyFileSync(absoluteTarget, fullPath);
            }
        } else if (entry.isDirectory()) {
            fixSymlinks(fullPath);
        }
    }
}

const buildDir = path.resolve(process.cwd(), '.open-next');
console.log(`[Fix] Scanning for symlinks in ${buildDir}...`);
fixSymlinks(buildDir);
console.log(`[Fix] Finished symbols check.`);
