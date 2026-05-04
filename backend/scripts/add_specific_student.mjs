import pg from 'pg';

const { Client } = pg;

const DATABASE_URL = "postgresql://neondb_owner:npg_0N3HuoSPJXpt@ep-flat-feather-anrnac1j-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function addStudent() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // 1. Get Faculty IDs (Both Sushiains)
    const facultyRes = await client.query(`
      SELECT id FROM academic.faculty 
      WHERE user_id IN (SELECT id FROM auth.users WHERE email ILIKE '%sushain%')
    `);
    
    if (facultyRes.rows.length === 0) {
      console.log('Faculty not found');
      return;
    }

    const studentEmail = 'asingh3_be24@thapar.edu';
    const studentName = 'Abhinav Kumar Singh';

    // 2. Ensure User exists
    let userRes = await client.query('SELECT id FROM auth.users WHERE email = $1', [studentEmail]);
    let userId;
    if (userRes.rows.length === 0) {
      const insertUser = await client.query(`
        INSERT INTO auth.users (email, password_hash, first_name, last_name) 
        VALUES ($1, $2, $3, $4) RETURNING id
      `, [studentEmail, 'hashed_pass', 'Abhinav Kumar', 'Singh']);
      userId = insertUser.rows[0].id;
      await client.query(`
        INSERT INTO auth.user_roles (user_id, role_id) 
        VALUES ($1, (SELECT id FROM auth.roles WHERE code = 'student'))
      `, [userId]);
    } else {
      userId = userRes.rows[0].id;
    }

    // 3. Link to ALL Sushiain accounts (underscore and dot)
    for (const faculty of facultyRes.rows) {
      const updateRes = await client.query(`
        UPDATE academic.students 
        SET advisor_id = $1, student_no = 'BE24-001'
        WHERE user_id = $2
        RETURNING id
      `, [faculty.id, userId]);

      if (updateRes.rows.length === 0) {
        await client.query(`
          INSERT INTO academic.students (user_id, student_no, advisor_id, department_id, program_id, current_semester) 
          VALUES ($1, 'BE24-001', $2, (SELECT id FROM academic.departments LIMIT 1), (SELECT id FROM academic.programs LIMIT 1), 2)
        `, [userId, faculty.id]);
      }
    }

    console.log('✅ ' + studentName + ' added and linked to all Sushain accounts!');

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

addStudent();
