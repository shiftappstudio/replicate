import fs from 'fs';
import path from 'path';

function cleanPublicFolder(directory: string = 'public/uploads', exceptFiles: string[] = []): void {
  const publicPath = path.join(__dirname, directory);

  fs.readdir(publicPath, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      if (!exceptFiles.includes(file)) {
        fs.unlink(path.join(publicPath, file), err => {
          if (err) throw err;
          console.log(`Deleted file: ${file}`);
        });
      }
    }
  });
}

// Usage
// cleanPublicFolder();
// Or with exceptions:
// cleanPublicFolder('public', ['important.txt', 'keep-this-image.jpg']);

export { cleanPublicFolder };