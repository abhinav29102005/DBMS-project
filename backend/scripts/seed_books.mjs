import pg from 'pg';
import { readFile } from 'node:fs/promises';

async function main() {
  const devVars = await readFile('.dev.vars', 'utf-8');
  const url = devVars.split('\n').find(l => l.startsWith('DATABASE_URL=')).split('=')[1];
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  
  try {
    await client.connect();
    console.log('Connected to DB');

    const books = [
      { isbn: '978-0132350884', title: 'Clean Code', author: 'Robert C. Martin', subject_code: 'CS', pdf_url: 'https://archive.org/download/CleanCode_201706/Clean_Code.pdf' },
      { isbn: '978-0262033848', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', subject_code: 'CS', pdf_url: 'https://mitpress.mit.edu/sites/default/files/sicp/full-text/book/book.pdf' },
      { isbn: '978-1593275846', title: 'Eloquent JavaScript', author: 'Marijn Haverbeke', subject_code: 'CS', pdf_url: 'https://eloquentjavascript.net/Eloquent_JavaScript.pdf' },
      { isbn: '978-1118063330', title: 'Advanced Engineering Mathematics', author: 'Erwin Kreyszig', subject_code: 'MATH', pdf_url: 'https://archive.org/download/AdvancedEngineeringMathematics10thEdition/Advanced_Engineering_Mathematics_10th_Edition.pdf' }
    ];

    for (const book of books) {
      // Get subject id
      const subRes = await client.query('SELECT id FROM library.subjects WHERE code = $1', [book.subject_code]);
      const subjectId = subRes.rows[0]?.id || null;

      console.log(`Seeding: ${book.title}`);
      const bookRes = await client.query(`
        INSERT INTO library.books (isbn, title, author, subject_id, pdf_url)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (isbn) DO UPDATE SET pdf_url = EXCLUDED.pdf_url
        RETURNING id
      `, [book.isbn, book.title, book.author, subjectId, book.pdf_url]);
      
      const bookId = bookRes.rows[0].id;

      // Create 5 available copies for each book if they don't exist
      for (let i = 1; i <= 5; i++) {
        const barcode = `${book.isbn}-C00${i}`;
        await client.query(`
          INSERT INTO library.book_copies (book_id, barcode, status)
          VALUES ($1, $2, 'available')
          ON CONFLICT (barcode) DO NOTHING
        `, [bookId, barcode]);
      }
    }

    console.log('Done seeding books!');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
