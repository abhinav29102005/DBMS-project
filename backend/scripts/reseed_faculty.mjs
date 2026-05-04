import pg from 'pg';

const { Client } = pg;

// Connection string from .dev.vars
const DATABASE_URL = "postgresql://neondb_owner:npg_0N3HuoSPJXpt@ep-flat-feather-anrnac1j-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function seed() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to DB');

    const usersRes = await client.query(`
      SELECT u.id, u.email 
      FROM auth.users u 
      JOIN auth.user_roles ur ON u.id = ur.user_id 
      JOIN auth.roles r ON ur.role_id = r.id 
      WHERE r.code = 'faculty' AND u.email ILIKE '%sushain%'
    `);

    if (usersRes.rows.length === 0) {
      console.log('No faculty user found.');
      return;
    }

    const semesterRes = await client.query('SELECT id FROM academic.semesters WHERE is_current = true LIMIT 1');
    const semesterId = semesterRes.rows[0].id;
    const courseRes = await client.query('SELECT id, course_code FROM academic.courses LIMIT 4');
    const studentRes = await client.query('SELECT id FROM academic.students LIMIT 200');
    const students = studentRes.rows;

    for (const user of usersRes.rows) {
      console.log('Syncing account: ' + user.email);

      // 1. Fresh Faculty Profile (Delete then Insert is safe if no other refs)
      await client.query('DELETE FROM academic.faculty WHERE user_id = $1', [user.id]);
      const empNo = 'EMP-' + user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + '-' + Math.floor(Math.random()*1000);
      await client.query(`
        INSERT INTO academic.faculty (user_id, employee_no, designation, department_id)
        VALUES ($1, $2, 'Professor', (SELECT id FROM academic.departments LIMIT 1))
      `, [user.id, empNo]);

      const facultyRes = await client.query('SELECT id FROM academic.faculty WHERE user_id = $1', [user.id]);
      const facultyId = facultyRes.rows[0].id;

      // Assign 2 courses to each Sushiain
      const myCourses = user.email.includes('_') ? courseRes.rows.slice(0, 2) : courseRes.rows.slice(2, 4);
      
      const offerings = [];
      for (const course of myCourses) {
        const sectionCode = 'A';
        
        // Manual Upsert
        const updateRes = await client.query(`
          UPDATE academic.course_offerings 
          SET primary_faculty_id = $1, status = 'ongoing'
          WHERE course_id = $2 AND semester_id = $3 AND section_code = $4
          RETURNING id
        `, [facultyId, course.id, semesterId, sectionCode]);

        if (updateRes.rows.length > 0) {
          offerings.push(updateRes.rows[0]);
        } else {
          const insertRes = await client.query(`
            INSERT INTO academic.course_offerings (course_id, semester_id, primary_faculty_id, section_code, status, capacity)
            VALUES ($1, $2, $3, $4, 'ongoing', 60)
            RETURNING id
          `, [course.id, semesterId, facultyId, sectionCode]);
          offerings.push(insertRes.rows[0]);
        }
      }

      // Enroll students
      console.log('Enrolling 50 students for ' + user.email + '...');
      const enrolledStudentIds = [];
      for (let i = 0; i < 50; i++) {
        const offering = offerings[i % offerings.length];
        const student = students[i + (user.email.includes('_') ? 0 : 50)];
        
        await client.query(`
          INSERT INTO academic.enrollments (student_id, course_offering_id, enrollment_status)
          VALUES ($1, $2, 'enrolled')
          ON CONFLICT ON CONSTRAINT "uq_enrollment" DO UPDATE SET enrollment_status = 'enrolled'
        `, [student.id, offering.id]);
        enrolledStudentIds.push(student.id);
      }

      // Advisor
      await client.query('UPDATE academic.students SET advisor_id = $1 WHERE id = ANY($2::uuid[])', [facultyId, enrolledStudentIds]);
    }

    console.log('\n✅ Success! All Sushain faculty accounts synced.');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

seed();
