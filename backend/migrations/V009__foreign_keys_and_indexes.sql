CREATE INDEX "idx_offerings_course_id" ON "academic"."course_offerings" ("course_id");

CREATE INDEX "idx_offerings_faculty_id" ON "academic"."course_offerings" ("primary_faculty_id");

CREATE INDEX "idx_offerings_semester_dept" ON "academic"."course_offerings" ("semester_id","course_id");

CREATE INDEX "idx_offerings_semester_id" ON "academic"."course_offerings" ("semester_id");


CREATE INDEX "idx_courses_dept_id" ON "academic"."courses" ("department_id");

CREATE INDEX "idx_courses_prereq_id" ON "academic"."courses" ("prerequisite_id");



CREATE INDEX "idx_enrollments_offering_id" ON "academic"."enrollments" ("course_offering_id");

CREATE INDEX "idx_enrollments_status" ON "academic"."enrollments" ("student_id","enrollment_status","course_offering_id");

CREATE INDEX "idx_enrollments_student_id" ON "academic"."enrollments" ("student_id");


CREATE INDEX "idx_faculty_dept_id" ON "academic"."faculty" ("department_id");

CREATE INDEX "idx_faculty_empno" ON "academic"."faculty" ("employee_no");

CREATE INDEX "idx_faculty_user_id" ON "academic"."faculty" ("user_id");



CREATE INDEX "idx_programs_dept_id" ON "academic"."programs" ("department_id");




CREATE INDEX "idx_students_dept_id" ON "academic"."students" ("department_id");

CREATE INDEX "idx_students_lifecycle" ON "academic"."students" ("lifecycle_state");

CREATE INDEX "idx_students_no" ON "academic"."students" ("student_no");

CREATE INDEX "idx_students_program_id" ON "academic"."students" ("program_id");

CREATE INDEX "idx_students_user_id" ON "academic"."students" ("user_id");



CREATE INDEX "audit_logs_2024_01_changed_at_idx" ON "audit"."audit_logs_2024_01" USING brin ("changed_at");

CREATE INDEX "audit_logs_2024_01_table_name_record_pk_idx" ON "audit"."audit_logs_2024_01" ("table_name","record_pk");

CREATE INDEX "audit_logs_2024_02_changed_at_idx" ON "audit"."audit_logs_2024_02" USING brin ("changed_at");

CREATE INDEX "audit_logs_2024_02_table_name_record_pk_idx" ON "audit"."audit_logs_2024_02" ("table_name","record_pk");

CREATE INDEX "audit_logs_2024_03_changed_at_idx" ON "audit"."audit_logs_2024_03" USING brin ("changed_at");

CREATE INDEX "audit_logs_2024_03_table_name_record_pk_idx" ON "audit"."audit_logs_2024_03" ("table_name","record_pk");

CREATE INDEX "audit_logs_2024_04_changed_at_idx" ON "audit"."audit_logs_2024_04" USING brin ("changed_at");

CREATE INDEX "audit_logs_2024_04_table_name_record_pk_idx" ON "audit"."audit_logs_2024_04" ("table_name","record_pk");

CREATE INDEX "audit_logs_2024_05_changed_at_idx" ON "audit"."audit_logs_2024_05" USING brin ("changed_at");

CREATE INDEX "audit_logs_2024_05_table_name_record_pk_idx" ON "audit"."audit_logs_2024_05" ("table_name","record_pk");

CREATE INDEX "audit_logs_2024_06_changed_at_idx" ON "audit"."audit_logs_2024_06" USING brin ("changed_at");

CREATE INDEX "audit_logs_2024_06_table_name_record_pk_idx" ON "audit"."audit_logs_2024_06" ("table_name","record_pk");

CREATE INDEX "audit_logs_2024_07_changed_at_idx" ON "audit"."audit_logs_2024_07" USING brin ("changed_at");

CREATE INDEX "audit_logs_2024_07_table_name_record_pk_idx" ON "audit"."audit_logs_2024_07" ("table_name","record_pk");

CREATE INDEX "audit_logs_2024_08_changed_at_idx" ON "audit"."audit_logs_2024_08" USING brin ("changed_at");

CREATE INDEX "audit_logs_2024_08_table_name_record_pk_idx" ON "audit"."audit_logs_2024_08" ("table_name","record_pk");

CREATE INDEX "audit_logs_2024_09_changed_at_idx" ON "audit"."audit_logs_2024_09" USING brin ("changed_at");

CREATE INDEX "audit_logs_2024_09_table_name_record_pk_idx" ON "audit"."audit_logs_2024_09" ("table_name","record_pk");

CREATE INDEX "audit_logs_2024_10_changed_at_idx" ON "audit"."audit_logs_2024_10" USING brin ("changed_at");

CREATE INDEX "audit_logs_2024_10_table_name_record_pk_idx" ON "audit"."audit_logs_2024_10" ("table_name","record_pk");

CREATE INDEX "audit_logs_2024_11_changed_at_idx" ON "audit"."audit_logs_2024_11" USING brin ("changed_at");

CREATE INDEX "audit_logs_2024_11_table_name_record_pk_idx" ON "audit"."audit_logs_2024_11" ("table_name","record_pk");

CREATE INDEX "audit_logs_2024_12_changed_at_idx" ON "audit"."audit_logs_2024_12" USING brin ("changed_at");

CREATE INDEX "audit_logs_2024_12_table_name_record_pk_idx" ON "audit"."audit_logs_2024_12" ("table_name","record_pk");

CREATE INDEX "audit_logs_2025_01_changed_at_idx" ON "audit"."audit_logs_2025_01" USING brin ("changed_at");

CREATE INDEX "audit_logs_2025_01_table_name_record_pk_idx" ON "audit"."audit_logs_2025_01" ("table_name","record_pk");

CREATE INDEX "audit_logs_2025_02_changed_at_idx" ON "audit"."audit_logs_2025_02" USING brin ("changed_at");

CREATE INDEX "audit_logs_2025_02_table_name_record_pk_idx" ON "audit"."audit_logs_2025_02" ("table_name","record_pk");

CREATE INDEX "audit_logs_2025_03_changed_at_idx" ON "audit"."audit_logs_2025_03" USING brin ("changed_at");

CREATE INDEX "audit_logs_2025_03_table_name_record_pk_idx" ON "audit"."audit_logs_2025_03" ("table_name","record_pk");

CREATE INDEX "audit_logs_2025_04_changed_at_idx" ON "audit"."audit_logs_2025_04" USING brin ("changed_at");

CREATE INDEX "audit_logs_2025_04_table_name_record_pk_idx" ON "audit"."audit_logs_2025_04" ("table_name","record_pk");

CREATE INDEX "audit_logs_2025_05_changed_at_idx" ON "audit"."audit_logs_2025_05" USING brin ("changed_at");

CREATE INDEX "audit_logs_2025_05_table_name_record_pk_idx" ON "audit"."audit_logs_2025_05" ("table_name","record_pk");

CREATE INDEX "audit_logs_2025_06_changed_at_idx" ON "audit"."audit_logs_2025_06" USING brin ("changed_at");

CREATE INDEX "audit_logs_2025_06_table_name_record_pk_idx" ON "audit"."audit_logs_2025_06" ("table_name","record_pk");

CREATE INDEX "audit_logs_2025_07_changed_at_idx" ON "audit"."audit_logs_2025_07" USING brin ("changed_at");

CREATE INDEX "audit_logs_2025_07_table_name_record_pk_idx" ON "audit"."audit_logs_2025_07" ("table_name","record_pk");

CREATE INDEX "audit_logs_2025_08_changed_at_idx" ON "audit"."audit_logs_2025_08" USING brin ("changed_at");

CREATE INDEX "audit_logs_2025_08_table_name_record_pk_idx" ON "audit"."audit_logs_2025_08" ("table_name","record_pk");

CREATE INDEX "audit_logs_2025_09_changed_at_idx" ON "audit"."audit_logs_2025_09" USING brin ("changed_at");

CREATE INDEX "audit_logs_2025_09_table_name_record_pk_idx" ON "audit"."audit_logs_2025_09" ("table_name","record_pk");

CREATE INDEX "audit_logs_2025_10_changed_at_idx" ON "audit"."audit_logs_2025_10" USING brin ("changed_at");

CREATE INDEX "audit_logs_2025_10_table_name_record_pk_idx" ON "audit"."audit_logs_2025_10" ("table_name","record_pk");

CREATE INDEX "audit_logs_2025_11_changed_at_idx" ON "audit"."audit_logs_2025_11" USING brin ("changed_at");

CREATE INDEX "audit_logs_2025_11_table_name_record_pk_idx" ON "audit"."audit_logs_2025_11" ("table_name","record_pk");

CREATE INDEX "audit_logs_2025_12_changed_at_idx" ON "audit"."audit_logs_2025_12" USING brin ("changed_at");

CREATE INDEX "audit_logs_2025_12_table_name_record_pk_idx" ON "audit"."audit_logs_2025_12" ("table_name","record_pk");

CREATE INDEX "audit_logs_2026_01_changed_at_idx" ON "audit"."audit_logs_2026_01" USING brin ("changed_at");

CREATE INDEX "audit_logs_2026_01_table_name_record_pk_idx" ON "audit"."audit_logs_2026_01" ("table_name","record_pk");

CREATE INDEX "audit_logs_2026_02_changed_at_idx" ON "audit"."audit_logs_2026_02" USING brin ("changed_at");

CREATE INDEX "audit_logs_2026_02_table_name_record_pk_idx" ON "audit"."audit_logs_2026_02" ("table_name","record_pk");

CREATE INDEX "audit_logs_2026_03_changed_at_idx" ON "audit"."audit_logs_2026_03" USING brin ("changed_at");

CREATE INDEX "audit_logs_2026_03_table_name_record_pk_idx" ON "audit"."audit_logs_2026_03" ("table_name","record_pk");

CREATE INDEX "audit_logs_2026_04_changed_at_idx" ON "audit"."audit_logs_2026_04" USING brin ("changed_at");

CREATE INDEX "audit_logs_2026_04_table_name_record_pk_idx" ON "audit"."audit_logs_2026_04" ("table_name","record_pk");

CREATE INDEX "audit_logs_2026_05_changed_at_idx" ON "audit"."audit_logs_2026_05" USING brin ("changed_at");

CREATE INDEX "audit_logs_2026_05_table_name_record_pk_idx" ON "audit"."audit_logs_2026_05" ("table_name","record_pk");

CREATE INDEX "audit_logs_2026_06_changed_at_idx" ON "audit"."audit_logs_2026_06" USING brin ("changed_at");

CREATE INDEX "audit_logs_2026_06_table_name_record_pk_idx" ON "audit"."audit_logs_2026_06" ("table_name","record_pk");

CREATE INDEX "audit_logs_2026_07_changed_at_idx" ON "audit"."audit_logs_2026_07" USING brin ("changed_at");

CREATE INDEX "audit_logs_2026_07_table_name_record_pk_idx" ON "audit"."audit_logs_2026_07" ("table_name","record_pk");

CREATE INDEX "audit_logs_2026_08_changed_at_idx" ON "audit"."audit_logs_2026_08" USING brin ("changed_at");

CREATE INDEX "audit_logs_2026_08_table_name_record_pk_idx" ON "audit"."audit_logs_2026_08" ("table_name","record_pk");

CREATE INDEX "audit_logs_2026_09_changed_at_idx" ON "audit"."audit_logs_2026_09" USING brin ("changed_at");

CREATE INDEX "audit_logs_2026_09_table_name_record_pk_idx" ON "audit"."audit_logs_2026_09" ("table_name","record_pk");

CREATE INDEX "audit_logs_2026_10_changed_at_idx" ON "audit"."audit_logs_2026_10" USING brin ("changed_at");

CREATE INDEX "audit_logs_2026_10_table_name_record_pk_idx" ON "audit"."audit_logs_2026_10" ("table_name","record_pk");

CREATE INDEX "audit_logs_2026_11_changed_at_idx" ON "audit"."audit_logs_2026_11" USING brin ("changed_at");

CREATE INDEX "audit_logs_2026_11_table_name_record_pk_idx" ON "audit"."audit_logs_2026_11" ("table_name","record_pk");

CREATE INDEX "audit_logs_2026_12_changed_at_idx" ON "audit"."audit_logs_2026_12" USING brin ("changed_at");

CREATE INDEX "audit_logs_2026_12_table_name_record_pk_idx" ON "audit"."audit_logs_2026_12" ("table_name","record_pk");

CREATE INDEX "idx_outbox_unpublished" ON "audit"."outbox" ("created_at");


CREATE INDEX "idx_refresh_tokens_user_active" ON "auth"."refresh_tokens" ("user_id");

CREATE INDEX "idx_refresh_tokens_user_id" ON "auth"."refresh_tokens" ("user_id");

CREATE INDEX "idx_role_permissions_perm_id" ON "auth"."role_permissions" ("permission_id");

CREATE INDEX "idx_role_permissions_role_id" ON "auth"."role_permissions" ("role_id");



CREATE INDEX "idx_user_roles_role_id" ON "auth"."user_roles" ("role_id");

CREATE INDEX "idx_user_roles_user_id" ON "auth"."user_roles" ("user_id");





CREATE INDEX "idx_exams_offering_id" ON "exam"."exams" ("course_offering_id");

CREATE INDEX "idx_exams_type_id" ON "exam"."exams" ("exam_type_id");

CREATE INDEX "idx_results_offering_id" ON "exam"."final_results" ("course_offering_id");

CREATE INDEX "idx_results_student_id" ON "exam"."final_results" ("student_id");

CREATE INDEX "idx_results_student_offering" ON "exam"."final_results" ("student_id","course_offering_id");


CREATE INDEX "idx_grade_scale_effective" ON "exam"."grade_scale" ("effective_from","effective_to");


CREATE INDEX "idx_marks_exam_id" ON "exam"."marks" ("exam_id");

CREATE INDEX "idx_marks_student_id" ON "exam"."marks" ("student_id");

CREATE INDEX "idx_allocations_bed_id" ON "hostel"."allocations" ("bed_id");

CREATE INDEX "idx_allocations_status" ON "hostel"."allocations" ("bed_id","status","allocated_to");

CREATE INDEX "idx_allocations_student_id" ON "hostel"."allocations" ("student_id");

CREATE INDEX "idx_allocations_student_status" ON "hostel"."allocations" ("student_id","status","allocated_to");




CREATE INDEX "idx_beds_room_id" ON "hostel"."beds" ("room_id");

CREATE INDEX "idx_hostel_beds_qr" ON "hostel"."beds" ("qr_code_id");


CREATE INDEX "idx_blocks_hostel_id" ON "hostel"."blocks" ("hostel_id");



CREATE INDEX "idx_hostel_rooms_qr" ON "hostel"."rooms" ("qr_code_id");

CREATE INDEX "idx_rooms_block_id" ON "hostel"."rooms" ("block_id");


CREATE INDEX "idx_waitlist_hostel_id" ON "hostel"."waitlist" ("hostel_id");

CREATE INDEX "idx_waitlist_status" ON "hostel"."waitlist" ("status","priority");

CREATE INDEX "idx_waitlist_student_id" ON "hostel"."waitlist" ("student_id");


CREATE INDEX "idx_book_copies_barcode" ON "library"."book_copies" ("barcode");

CREATE INDEX "idx_book_copies_book_id" ON "library"."book_copies" ("book_id");

CREATE INDEX "idx_book_copies_status" ON "library"."book_copies" ("book_id","status");

CREATE INDEX "idx_library_copies_qr" ON "library"."book_copies" ("qr_code_id");


CREATE INDEX "idx_books_fts" ON "library"."books" USING gin ("search_vector");

CREATE INDEX "idx_books_publisher_id" ON "library"."books" ("publisher_id");

CREATE INDEX "idx_books_subject_id" ON "library"."books" ("subject_id");

CREATE INDEX "idx_books_trgm" ON "library"."books" USING gin ("title" gin_trgm_ops);


CREATE INDEX "idx_fines_issue_id" ON "library"."fines" ("issue_id");

CREATE INDEX "idx_fines_member_id" ON "library"."fines" ("member_user_id");

CREATE INDEX "idx_fines_unsettled" ON "library"."fines" ("member_user_id");


CREATE INDEX "idx_issues_copy_id" ON "library"."issues" ("copy_id");

CREATE INDEX "idx_issues_copy_returned" ON "library"."issues" ("copy_id","returned_at");

CREATE INDEX "idx_issues_member_id" ON "library"."issues" ("member_user_id");

CREATE INDEX "idx_issues_member_overdue" ON "library"."issues" ("member_user_id","returned_at","due_at");


CREATE INDEX "idx_reservations_active" ON "library"."reservations" ("book_id","status","created_at");

CREATE INDEX "idx_reservations_book_id" ON "library"."reservations" ("book_id");

CREATE INDEX "idx_reservations_member_id" ON "library"."reservations" ("member_user_id");


ALTER TABLE "academic"."course_offerings" ADD CONSTRAINT "course_offerings_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "academic"."courses"("id") ON DELETE RESTRICT;

ALTER TABLE "academic"."course_offerings" ADD CONSTRAINT "course_offerings_primary_faculty_id_fkey" FOREIGN KEY ("primary_faculty_id") REFERENCES "academic"."faculty"("id") ON DELETE SET NULL;

ALTER TABLE "academic"."course_offerings" ADD CONSTRAINT "course_offerings_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "academic"."semesters"("id") ON DELETE RESTRICT;

ALTER TABLE "academic"."courses" ADD CONSTRAINT "courses_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "academic"."departments"("id") ON DELETE RESTRICT;

ALTER TABLE "academic"."courses" ADD CONSTRAINT "courses_prerequisite_id_fkey" FOREIGN KEY ("prerequisite_id") REFERENCES "academic"."courses"("id") ON DELETE SET NULL;

ALTER TABLE "academic"."departments" ADD CONSTRAINT "fk_dept_head_faculty" FOREIGN KEY ("head_faculty_id") REFERENCES "academic"."faculty"("id") ON DELETE SET NULL;

ALTER TABLE "academic"."enrollments" ADD CONSTRAINT "enrollments_course_offering_id_fkey" FOREIGN KEY ("course_offering_id") REFERENCES "academic"."course_offerings"("id") ON DELETE RESTRICT;

ALTER TABLE "academic"."enrollments" ADD CONSTRAINT "enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "academic"."students"("id") ON DELETE RESTRICT;

ALTER TABLE "academic"."faculty" ADD CONSTRAINT "faculty_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "academic"."departments"("id") ON DELETE RESTRICT;

ALTER TABLE "academic"."faculty" ADD CONSTRAINT "faculty_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT;

ALTER TABLE "academic"."programs" ADD CONSTRAINT "programs_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "academic"."departments"("id") ON DELETE RESTRICT;

ALTER TABLE "academic"."students" ADD CONSTRAINT "fk_student_advisor" FOREIGN KEY ("advisor_id") REFERENCES "academic"."faculty"("id") ON DELETE SET NULL;

ALTER TABLE "academic"."students" ADD CONSTRAINT "students_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "academic"."departments"("id") ON DELETE RESTRICT;

ALTER TABLE "academic"."students" ADD CONSTRAINT "students_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "academic"."programs"("id") ON DELETE RESTRICT;

ALTER TABLE "academic"."students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT;

CREATE UNIQUE INDEX "uq_alloc_bed_active" ON "hostel"."allocations" ("bed_id") WHERE status = 'active';

ALTER TABLE "auth"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE "auth"."role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "auth"."permissions"("id") ON DELETE CASCADE;

ALTER TABLE "auth"."role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "auth"."roles"("id") ON DELETE CASCADE;

ALTER TABLE "auth"."user_roles" ADD CONSTRAINT "user_roles_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;

ALTER TABLE "auth"."user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "auth"."roles"("id") ON DELETE CASCADE;

ALTER TABLE "auth"."user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE "exam"."exams" ADD CONSTRAINT "exams_course_offering_id_fkey" FOREIGN KEY ("course_offering_id") REFERENCES "academic"."course_offerings"("id") ON DELETE RESTRICT;

ALTER TABLE "exam"."exams" ADD CONSTRAINT "exams_exam_type_id_fkey" FOREIGN KEY ("exam_type_id") REFERENCES "exam"."exam_types"("id") ON DELETE RESTRICT;

ALTER TABLE "exam"."final_results" ADD CONSTRAINT "final_results_course_offering_id_fkey" FOREIGN KEY ("course_offering_id") REFERENCES "academic"."course_offerings"("id") ON DELETE RESTRICT;

ALTER TABLE "exam"."final_results" ADD CONSTRAINT "final_results_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "academic"."students"("id") ON DELETE RESTRICT;

ALTER TABLE "exam"."marks" ADD CONSTRAINT "marks_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exam"."exams"("id") ON DELETE RESTRICT;

ALTER TABLE "exam"."marks" ADD CONSTRAINT "marks_graded_by_fkey" FOREIGN KEY ("graded_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;

ALTER TABLE "exam"."marks" ADD CONSTRAINT "marks_moderated_by_fkey" FOREIGN KEY ("moderated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;

ALTER TABLE "exam"."marks" ADD CONSTRAINT "marks_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "academic"."students"("id") ON DELETE RESTRICT;

ALTER TABLE "hostel"."allocations" ADD CONSTRAINT "allocations_allocated_by_fkey" FOREIGN KEY ("allocated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;

ALTER TABLE "hostel"."allocations" ADD CONSTRAINT "allocations_bed_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "hostel"."beds"("id") ON DELETE RESTRICT;

ALTER TABLE "hostel"."allocations" ADD CONSTRAINT "allocations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "academic"."students"("id") ON DELETE RESTRICT;

ALTER TABLE "hostel"."allocations" ADD CONSTRAINT "allocations_vacated_by_fkey" FOREIGN KEY ("vacated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;

ALTER TABLE "hostel"."beds" ADD CONSTRAINT "beds_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "hostel"."rooms"("id") ON DELETE CASCADE;

ALTER TABLE "hostel"."blocks" ADD CONSTRAINT "blocks_hostel_id_fkey" FOREIGN KEY ("hostel_id") REFERENCES "hostel"."hostels"("id") ON DELETE CASCADE;

ALTER TABLE "hostel"."hostels" ADD CONSTRAINT "hostels_warden_user_id_fkey" FOREIGN KEY ("warden_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;

ALTER TABLE "hostel"."rooms" ADD CONSTRAINT "rooms_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "hostel"."blocks"("id") ON DELETE CASCADE;

ALTER TABLE "hostel"."waitlist" ADD CONSTRAINT "waitlist_hostel_id_fkey" FOREIGN KEY ("hostel_id") REFERENCES "hostel"."hostels"("id") ON DELETE CASCADE;

ALTER TABLE "hostel"."waitlist" ADD CONSTRAINT "waitlist_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "academic"."students"("id") ON DELETE CASCADE;

ALTER TABLE "library"."book_authors" ADD CONSTRAINT "book_authors_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "library"."authors"("id") ON DELETE CASCADE;

ALTER TABLE "library"."book_authors" ADD CONSTRAINT "book_authors_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "library"."books"("id") ON DELETE CASCADE;

ALTER TABLE "library"."book_copies" ADD CONSTRAINT "book_copies_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "library"."books"("id") ON DELETE RESTRICT;

ALTER TABLE "library"."books" ADD CONSTRAINT "books_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "library"."publishers"("id") ON DELETE SET NULL;

ALTER TABLE "library"."books" ADD CONSTRAINT "books_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "library"."subjects"("id") ON DELETE SET NULL;

ALTER TABLE "library"."fines" ADD CONSTRAINT "fines_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "library"."issues"("id") ON DELETE RESTRICT;

ALTER TABLE "library"."fines" ADD CONSTRAINT "fines_member_user_id_fkey" FOREIGN KEY ("member_user_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT;

ALTER TABLE "library"."fines" ADD CONSTRAINT "fines_settled_by_fkey" FOREIGN KEY ("settled_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;

ALTER TABLE "library"."issues" ADD CONSTRAINT "issues_copy_id_fkey" FOREIGN KEY ("copy_id") REFERENCES "library"."book_copies"("id") ON DELETE RESTRICT;

ALTER TABLE "library"."issues" ADD CONSTRAINT "issues_issued_by_fkey" FOREIGN KEY ("issued_by") REFERENCES "auth"."users"("id") ON DELETE RESTRICT;

ALTER TABLE "library"."issues" ADD CONSTRAINT "issues_member_user_id_fkey" FOREIGN KEY ("member_user_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT;

ALTER TABLE "library"."issues" ADD CONSTRAINT "issues_return_received_by_fkey" FOREIGN KEY ("return_received_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;

ALTER TABLE "library"."reservations" ADD CONSTRAINT "reservations_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "library"."books"("id") ON DELETE CASCADE;

ALTER TABLE "library"."reservations" ADD CONSTRAINT "reservations_member_user_id_fkey" FOREIGN KEY ("member_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE "library"."subjects" ADD CONSTRAINT "subjects_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "library"."subjects"("id") ON DELETE SET NULL;