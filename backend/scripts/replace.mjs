import fs from 'fs';
import path from 'path';

const migrationsDir = 'migrations';
const newDir = path.join(migrationsDir, 'new');

const files = fs.readdirSync(migrationsDir);
for (const file of files) {
    if (file.startsWith('V') && file.endsWith('.sql')) {
        fs.unlinkSync(path.join(migrationsDir, file));
    }
}

const newFiles = fs.readdirSync(newDir);
for (const file of newFiles) {
    fs.renameSync(path.join(newDir, file), path.join(migrationsDir, file));
}

fs.rmdirSync(newDir);
console.log('Successfully replaced migrations');
