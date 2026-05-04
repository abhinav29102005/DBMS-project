import pg from 'pg';
import { readFile } from 'node:fs/promises';

async function main() {
  const devVars = await readFile('.dev.vars', 'utf-8');
  const url = devVars.split('\n').find(l => l.startsWith('DATABASE_URL=')).split('=')[1];
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  
  try {
    await client.connect();
    console.log('Connected to DB');

    // 1. Seed Exam Types
    const examTypes = [
      { code: 'MID', name: 'Mid-Term Examination', description: 'Internal assessment conducted mid-semester' },
      { code: 'END', name: 'End-Term Examination', description: 'Final assessment conducted at the end of semester' },
      { code: 'QUIZ', name: 'Class Quiz', description: 'Short assessments throughout the term' }
    ];

    for (const type of examTypes) {
      await client.query(`
        INSERT INTO exam.exam_types (code, name, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (code) DO NOTHING
      `, [type.code, type.name, type.description]);
    }

    // 2. Get some course offerings
    const offeringRes = await client.query('SELECT id FROM academic.course_offerings LIMIT 10');
    const offerings = offeringRes.rows;
    console.log(`Found ${offerings.length} course offerings to seed exams for.`);

    if (offerings.length === 0) {
      console.warn('No course offerings found! Please seed courses first.');
      return;
    }

    const midTypeRes = await client.query("SELECT id FROM exam.exam_types WHERE code = 'MID'");
    const endTypeRes = await client.query("SELECT id FROM exam.exam_types WHERE code = 'END'");
    const midTypeId = midTypeRes.rows[0].id;
    const endTypeId = endTypeRes.rows[0].id;

    console.log('Exam types identified. Starting loop...');

    // 3. Create Exams for each offering
    for (const offering of offerings) {
      console.log(`\n--- Processing Offering: ${offering.id} ---`);
      
      const courseRes = await client.query('SELECT course_code FROM academic.courses WHERE id = (SELECT course_id FROM academic.course_offerings WHERE id = $1)', [offering.id]);
      const courseCode = courseRes.rows[0].course_code;

      // Create Mid-Term and End-Term slots
      const midRes = await client.query(`
        INSERT INTO exam.exams (course_offering_id, exam_type_id, name, max_marks, weightage_percent, scheduled_at, duration_minutes, status, venue, room_no)
        VALUES ($1, $2, $3, 100, 30, $4, 90, 'completed', 'Science Block', 'Room 101')
        ON CONFLICT DO NOTHING RETURNING id
      `, [offering.id, midTypeId, 'Mid-Semester Examination', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()]);

      const endRes = await client.query(`
        INSERT INTO exam.exams (course_offering_id, exam_type_id, name, max_marks, weightage_percent, scheduled_at, duration_minutes, status, venue, room_no)
        VALUES ($1, $2, $3, 100, 70, $4, 180, 'scheduled', 'Examination Hall-A', 'Floor 2')
        ON CONFLICT DO NOTHING RETURNING id
      `, [offering.id, endTypeId, 'End-Semester Examination', new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()]);

      if (midRes.rows.length === 0 || endRes.rows.length === 0) {
        console.log('Exams already exist for this offering, skipping details seeding.');
        continue;
      }

      const midExamId = midRes.rows[0].id;
      const endExamId = endRes.rows[0].id;

      // 4. Get students and prepare bulk data
      const studentRes = await client.query(`
        SELECT student_id FROM academic.enrollments WHERE course_offering_id = $1
      `, [offering.id]);
      
      const students = studentRes.rows;
      console.log(`Found ${students.length} students. Generating details...`);

      if (students.length > 0) {
        console.log(`Bulk inserting details for ${students.length} students...`);
        
        // Split into batches of 100 to avoid query size limits
        const batchSize = 100;
        for (let i = 0; i < students.length; i += batchSize) {
          const batch = students.slice(i, i + batchSize);
          
          const seatValues = [];
          const markValues = [];
          const endSeatValues = [];

          batch.forEach((student, index) => {
            const studentIdx = i + index + 1;
            const seatNo = `${courseCode}-S${studentIdx.toString().padStart(4, '0')}`;
            const marks = Math.floor(Math.random() * 40) + 60;

            seatValues.push(`('${midExamId}', '${student.student_id}', '${seatNo}', 'present')`);
            endSeatValues.push(`('${endExamId}', '${student.student_id}', '${seatNo}', 'absent')`);
            markValues.push(`('${midExamId}', '${student.student_id}', ${marks}, 'Bulk Seeded')`);
          });

          await client.query(`INSERT INTO exam.student_exam_details (exam_id, student_id, seat_no, attendance_status) VALUES ${seatValues.join(',')}`);
          await client.query(`INSERT INTO exam.student_exam_details (exam_id, student_id, seat_no, attendance_status) VALUES ${endSeatValues.join(',')}`);
          await client.query(`INSERT INTO exam.marks (exam_id, student_id, marks_obtained, remarks) VALUES ${markValues.join(',')}`);
          
          console.log(`  - Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(students.length/batchSize)}`);
        }
        console.log(`Successfully completed ${courseCode}`);
      }
    }

    console.log('Done seeding exams and marks!');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
