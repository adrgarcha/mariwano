const fs = require('fs');
const path = require('path');

module.exports = (directory, folersOnly = false) => {
    let fileNames = [];

    const files = fs.readdirSync(directory, { withFileTypes: true });

    for (const file of files) {
        const filePath = path.join(directory, file.name);

        if(folersOnly){
            if(file.isDirectory()){
                fileNames.push(filePath);
            }
        } else {
            if(file.isFile()){
                fileNames.push(filePath);
            }
        }
    }
    return fileNames;
}