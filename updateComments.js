const fs = require('fs');
const path = require('path');

// Recursive function to get all .js files in directory
function getAllJsFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !filePath.includes('node_modules')) {
            fileList = getAllJsFiles(filePath, fileList);
        } else if (file.endsWith('.js')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

// Function to replace comments in a file
function replaceCommentsInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace single-line comments
        content = content.replace(/\/\/\s*(.*)/g, '// @guild');
        
        // Write the file back
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated comments in ${filePath}`);
    } catch (error) {
        console.error(`Error updating ${filePath}:`, error);
    }
}

// Main function
function main() {
    const rootDir = __dirname; // Current directory
    const jsFiles = getAllJsFiles(rootDir);
    
    console.log(`Found ${jsFiles.length} JavaScript files to process...`);
    
    // Process each file
    jsFiles.forEach(file => {
        if (file !== __filename) { // Skip this script
            replaceCommentsInFile(file);
        }
    });
    
    console.log('All comments have been updated to "// @guild"');
}

// Run the script
main(); 