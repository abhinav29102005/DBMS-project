import pg from 'pg';

const { Client } = pg;

const DATABASE_URL = "postgresql://neondb_owner:npg_0N3HuoSPJXpt@ep-flat-feather-anrnac1j-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function diagnose() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    const userRes = await client.query('SELECT id, email FROM auth.users WHERE email = $1', ['sushain_sharma@gtu.edu']);
    if (userRes.rows.length === 0) {
      console.log('User not found');
      return;
    }
    const user = userRes.rows[0];
    
    const facultyRes = await client.query('SELECT * FROM academic.faculty WHERE user_id = $1', [user.id]);
    if (facultyRes.rows.length === 0) {
      console.log('Faculty profile not found for user: ' + user.id);
      return;
    }
    const faculty = facultyRes.rows[0];
    
    const offeringsRes = await client.query('SELECT id, section_code, course_id FROM academic.course_offerings WHERE primary_faculty_id = $1', [faculty.id]);
    
    const enrollmentRes = await client.query(`
      SELECT COUNT(*) 
      FROM academic.enrollments 
      WHERE course_offering_id IN (
        SELECT id FROM academic.course_offerings WHERE primary_faculty_id = $1
      ) AND enrollment_status = 'enrolled'
    `, [faculty.id]);

    console.log(JSON.stringify({
      user,
      faculty,
      offerings: offeringsRes.rows,
      enrollmentCount: enrollmentRes.rows[0].count
    }, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

diagnose();
