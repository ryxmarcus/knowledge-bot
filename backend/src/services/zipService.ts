import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

export class ZipService {
  static async createHandoverZip(markdown: string, outputPath: string) {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    return new Promise((resolve, reject) => {
      output.on('close', () => resolve(true));
      archive.on('error', (err) => reject(err));

      archive.pipe(output);

      // Split markdown by sections if possible, or just create one main file
      // For now, let's create a main Handover.md and potentially split it
      archive.append(markdown, { name: 'Handover_Documentation.md' });

      // If we want to split by sections (e.g., looking for ## headers)
      const sections = markdown.split(/\n(?=## )/);
      sections.forEach(section => {
        const match = section.match(/## (.*)/);
        if (match) {
          const fileName = `${match[1].trim().replace(/\s+/g, '_')}.md`;
          archive.append(section, { name: `details/${fileName}` });
        }
      });

      archive.finalize();
    });
  }
}
