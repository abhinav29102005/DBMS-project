"""
UIMS Technical Project Report – v3
- Each schema diagram: full content width, tall enough to be readable
- No two-column image squishing
- Platypus flowables: zero manual Y positioning = zero overlaps
- Target: ~12 pages
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, Image, PageBreak, KeepTogether, NextPageTemplate,
    Frame, BaseDocTemplate, PageTemplate
)

IMG_DIR  = os.path.expanduser("~/Projects/DBMS-project/docs/ER_Diagrams/")
OUT_FILE = os.path.expanduser("~/Projects/DBMS-project/docs/UIMS_TECHNICAL_MASTER_REPORT.pdf")


# ── Palette ────────────────────────────────────────────────────────────────────
NAVY  = colors.HexColor("#003366")
RED   = colors.HexColor("#B30000")
LGRAY = colors.HexColor("#EEF2F8")
MGRAY = colors.HexColor("#CBD5E0")
DGRAY = colors.HexColor("#4A5568")
BLACK = colors.HexColor("#1A202C")
WHITE = colors.white
LRED  = colors.HexColor("#FFF0F0")

W, H  = A4
ML = MR = 16*mm
MT = 26*mm   # space for header bar
MB = 18*mm
CW = W - ML - MR   # ≈ 163mm = 462 pt

# ── Paragraph styles ──────────────────────────────────────────────────────────
def PS(name, **kw):
    return ParagraphStyle(name, **kw)

sSecTitle = PS("sSecTitle",
    fontName="Helvetica-Bold", fontSize=12, textColor=WHITE,
    backColor=NAVY, leading=18, spaceBefore=10, spaceAfter=6,
    leftIndent=-2, rightIndent=-2, borderPad=6)

sSubTitle = PS("sSubTitle",
    fontName="Helvetica-Bold", fontSize=9.5, textColor=NAVY,
    backColor=LGRAY, leading=14, spaceBefore=6, spaceAfter=4,
    leftIndent=-2, rightIndent=-2, borderPad=4)

sBody = PS("sBody",
    fontName="Helvetica", fontSize=9.5, textColor=BLACK,
    leading=14, spaceAfter=5, alignment=TA_JUSTIFY)

sBullet = PS("sBullet",
    fontName="Helvetica", fontSize=9.5, textColor=BLACK,
    leading=13, spaceAfter=3, leftIndent=14, firstLineIndent=-10)

sCaption = PS("sCaption",
    fontName="Helvetica-Oblique", fontSize=8, textColor=DGRAY,
    alignment=TA_CENTER, spaceBefore=3, spaceAfter=8)

sCode = PS("sCode",
    fontName="Courier", fontSize=8, textColor=BLACK,
    leading=11, spaceBefore=4, spaceAfter=6,
    backColor=colors.HexColor("#F4F6FB"),
    leftIndent=6, rightIndent=6,
    borderColor=MGRAY, borderWidth=0.5, borderPad=6)

# Cover styles
sCovInst = PS("sCovInst",
    fontName="Helvetica-Bold", fontSize=15, textColor=WHITE,
    alignment=TA_CENTER, leading=20)
sCovSub  = PS("sCovSub",
    fontName="Helvetica", fontSize=9.5, textColor=colors.HexColor("#AACCEE"),
    alignment=TA_CENTER)
sCovTitle= PS("sCovTitle",
    fontName="Helvetica-Bold", fontSize=22, textColor=WHITE,
    alignment=TA_CENTER, leading=28)
sCovSubT = PS("sCovSubT",
    fontName="Helvetica", fontSize=10.5, textColor=colors.HexColor("#FFCCCC"),
    alignment=TA_CENTER)

# ── Flowable helpers ──────────────────────────────────────────────────────────
def SP(h=6):   return Spacer(1, h)
def HR():      return HRFlowable(width="100%", thickness=0.4, color=MGRAY, spaceAfter=4)

def sec(num, title):
    return [SP(4), Paragraph(f"<b>{num}.&nbsp; {title}</b>", sSecTitle), SP(4)]

def sub(title):
    return [Paragraph(f"<b>{title}</b>", sSubTitle), SP(2)]

def body(txt):
    return [Paragraph(txt, sBody)]

def bl(items):
    return [Paragraph(f"- &nbsp;{i}", sBullet) for i in items]

def full_img(filename, caption, max_h=340):
    """Full content-width image — the key fix for visibility."""
    fp = os.path.join(IMG_DIR, filename)
    if not os.path.exists(fp):
        return [Paragraph(f"[Image not found: {filename}]", sBody)]
    im = Image(fp)
    iw, ih = im.imageWidth, im.imageHeight
    # Scale to fill full content width, up to max_h tall
    scale = min(CW / iw, max_h / ih)
    im.drawWidth  = iw * scale
    im.drawHeight = ih * scale
    im.hAlign = "CENTER"
    return [SP(4), im, Paragraph(f"<i>Figure: {caption}</i>", sCaption)]

def make_tbl(headers, rows, col_w, font_sz=8.5):
    th_s = PS(f"th{id(headers)}", fontName="Helvetica-Bold", fontSize=font_sz,
              textColor=WHITE, leading=font_sz+3, spaceBefore=0, spaceAfter=0)
    td_s = PS(f"td{id(rows)}",   fontName="Helvetica",      fontSize=font_sz,
              textColor=BLACK, leading=font_sz+3, spaceBefore=0, spaceAfter=0)
    data = [[Paragraph(h, th_s) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), td_s) for c in row])
    t = Table(data, colWidths=col_w, hAlign="LEFT", repeatRows=1)
    style_cmds = [
        ("BACKGROUND",    (0,0), (-1,0),  NAVY),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING",   (0,0), (-1,-1), 5),
        ("RIGHTPADDING",  (0,0), (-1,-1), 5),
        ("TOPPADDING",    (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("GRID",          (0,0), (-1,-1), 0.3, MGRAY),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [colors.HexColor("#F0F4FA"), WHITE]),
    ]
    t.setStyle(TableStyle(style_cmds))
    return [SP(4), t, SP(6)]

# ── Custom doc with header/footer ─────────────────────────────────────────────
class UIDoc(SimpleDocTemplate):
    def afterPage(self):
        c   = self.canv
        pn  = c.getPageNumber()
        if pn == 1:
            return   # cover page: no header/footer
        # Header
        c.saveState()
        c.setFillColor(NAVY)
        c.rect(0, H - MT + 2, W, MT - 2, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica", 7.5)
        c.drawString(ML, H - MT/2 - 3,
                     "UIMS  –  University Integrated Management System  |  TIET, Patiala")
        c.drawRightString(W - MR, H - MT/2 - 3, f"Page {pn - 1}")
        # Footer
        c.setStrokeColor(MGRAY)
        c.setLineWidth(0.4)
        c.line(ML, MB - 1*mm, W - MR, MB - 1*mm)
        c.setFillColor(DGRAY)
        c.setFont("Helvetica", 7)
        c.drawCentredString(W/2, MB - 5*mm,
                            "UCS310 – Database Management Systems  |  B.Tech 2nd Year, CSED  |  TIET, Patiala")
        c.restoreState()

# ── Story ──────────────────────────────────────────────────────────────────────
story = []
students = [
    ("Sushain Sharma",      "1024030439"),
    ("Manan Kapoor",        "1024030467"),
    ("Abhinav Kumar Singh", "1024030440"),
]

# ══════════════════════════════════════════════════════════════════════════════
# COVER PAGE
# ══════════════════════════════════════════════════════════════════════════════
def cv_tbl(rows, bg, col_w):
    t = Table(rows, colWidths=[col_w], hAlign="CENTER")
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,-1), bg),
        ("TOPPADDING",    (0,0),(-1,-1), 10),
        ("BOTTOMPADDING", (0,0),(-1,-1), 10),
        ("LEFTPADDING",   (0,0),(-1,-1), 10),
        ("RIGHTPADDING",  (0,0),(-1,-1), 10),
    ]))
    return t

# Institution banner
story.append(cv_tbl([
    [Paragraph("THAPAR INSTITUTE OF ENGINEERING & TECHNOLOGY, PATIALA", sCovInst)],
    [Paragraph("UCS310 – Database Management Systems  |  B.Tech 2nd Year, CSED", sCovSub)],
], NAVY, CW))
story.append(SP(10))

# Title box
story.append(cv_tbl([
    [Paragraph("University Integrated Management System (UIMS)", sCovTitle)],
    [Paragraph("Technical Project Report  –  DBMS Lab", sCovSubT)],
], RED, CW))
story.append(SP(14))

# Student table
sn = PS("sn", fontName="Helvetica-Bold", fontSize=9.5, textColor=BLACK)
sr = PS("sr", fontName="Helvetica",      fontSize=9.5, textColor=DGRAY)
sh = PS("sh", fontName="Helvetica-Bold", fontSize=9.5, textColor=NAVY)

stud_rows = [[Paragraph("<b>Name</b>", sh), Paragraph("<b>Roll Number</b>", sh)]]
for name, roll in students:
    stud_rows.append([Paragraph(name, sn), Paragraph(roll, sr)])
stud_rows.append([Paragraph("<b>Lab Instructor</b>", sh), Paragraph("Dr. Abhishelly", sn)])

st = Table(stud_rows, colWidths=[CW*0.55, CW*0.45], hAlign="LEFT")
st.setStyle(TableStyle([
    ("BOX",          (0,0),(-1,-1), 0.8, NAVY),
    ("INNERGRID",    (0,0),(-1,-1), 0.3, MGRAY),
    ("BACKGROUND",   (0,0),(-1,0),  LGRAY),
    ("TOPPADDING",   (0,0),(-1,-1), 6),
    ("BOTTOMPADDING",(0,0),(-1,-1), 6),
    ("LEFTPADDING",  (0,0),(-1,-1), 8),
    ("RIGHTPADDING", (0,0),(-1,-1), 8),
]))
story.append(st)
story.append(SP(16))

# Cover ER diagram — full width on cover
story.extend(full_img("full_connectivity.png",
                       "Global UIMS Entity-Relationship Architecture", max_h=360))
story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
# SECTION 1 – INTRODUCTION
# ══════════════════════════════════════════════════════════════════════════════
story.extend(sec(1, "Introduction"))
story.extend(sub("System Deployment & Access"))
story.extend(bl([
    "<b>Frontend Portal:</b> <a href='https://uims.abhinavkumarsingh.tech/' color='blue'><u>https://uims.abhinavkumarsingh.tech/</u></a>",
    "<b>API Backend:</b> <a href='https://uims-backend.abhinavkumarsingh.tech' color='blue'><u>https://uims-backend.abhinavkumarsingh.tech</u></a>"
]))
story.extend(body(
    "Modern universities manage multiple operational systems — student records, hostel allocation, "
    "library management, and examination processing. Handling these through disconnected or manual "
    "processes leads to data redundancy, inconsistency, and security risks. This project proposes a "
    "centralized, database-driven <b>University Integrated Management System (UIMS)</b> built on "
    "PostgreSQL, consolidating all critical operations into a single, cohesive platform scalable to "
    "100,000+ students with strict transactional integrity and full auditability."
))
story.append(SP(4))
story.extend(bl([
    "Student Management &amp; Academic Lifecycle — enrollment, CGPA tracking, grade processing",
    "Hostel Management &amp; Resident Allotment — automated bed allocation with QR verification",
    "Library Inventory &amp; Circulation System — book tracking, borrowing, and fine enforcement",
    "Examination System &amp; Grading Engine — scheduling, invigilation, and result computation",
    "Role-Based Authentication — unified login, permission scoping, and immutable audit logging",
]))

# ══════════════════════════════════════════════════════════════════════════════
# SECTION 2 – PROBLEM STATEMENT
# ══════════════════════════════════════════════════════════════════════════════
story.extend(sec(2, "Problem Statement"))
story.extend(body(
    "Universities often handle student, hostel, exam, and library data through disconnected systems, "
    "creating severe operational challenges:"
))
story.extend(sub("Existing System Inefficiencies"))
story.extend(bl([
    "<b>Data Duplication:</b> Redundant entries across modules — e.g., address data stored separately in hostel and student records.",
    "<b>Inconsistency:</b> Mismatched records when a student updates details in one system but not another.",
    "<b>Resource Tracking:</b> Difficult manual tracking of room availability and library asset circulation.",
    "<b>Transaction Hazards:</b> Risk of double-allocating rooms or exam seats during peak registration windows.",
    "<b>Security Gaps:</b> No unified role-based access control — any staff member can access any module.",
]))
story.append(SP(4))
story.extend(sub("Proposed Solution"))
story.extend(body(
    "A centralized PostgreSQL database with strict 3NF/BCNF normalization, PL/SQL automation, "
    "immutable audit history, and role-scoped permissions for every critical workflow."
))

# ══════════════════════════════════════════════════════════════════════════════
# SECTION 3 – OBJECTIVES
# ══════════════════════════════════════════════════════════════════════════════
story.extend(sec(3, "Objectives"))
story.extend(bl([
    "Design a comprehensive ER model representing the full university operational ecosystem.",
    "Implement generalization using a USER super-type entity for unified authentication across all roles.",
    "Normalize the entire database to BCNF, eliminating all data redundancy and update anomalies.",
    "Implement PL/SQL Triggers and Stored Procedures for automated business rule enforcement.",
    "Enforce ACID-compliant transactions for high-stakes operations — room allotment, exam registration.",
    "Provide comprehensive audit logging capturing every mutation with actor identity and timestamp.",
]))

# ══════════════════════════════════════════════════════════════════════════════
# SECTION 4 – SCOPE
# ══════════════════════════════════════════════════════════════════════════════
story.extend(sec(4, "Scope of the Project"))
story.extend(sub("Functional Module Boundaries"))
story.extend(make_tbl(
    ["Module", "Core Responsibility", "Key Entities"],
    [
        ["Academic",  "Profiles, CGPA tracking, departmental branching",    "faculties, departments, courses, students, enrollments, grades"],
        ["Hostel",    "Automated room allotment and maintenance tracking",   "hostels, hostel_rooms, allocations, wardens, maintenance_requests"],
        ["Library",   "Inventory management, circulation, fine validation", "books, authors, members, borrow_records, fines"],
        ["Exam",      "Scheduling, invigilation, grading engine",           "exams, exam_schedules, exam_results, exam_invigilators, grading_policies"],
        ["Auth",      "Role-based access and session management",           "users, roles, permissions, user_roles, role_permissions, refresh_tokens"],
        ["Audit",     "Mutation forensics and login tracking",              "audit_logs, login_logs, system_events"],
        ["Admin",     "Staff, assets, events, announcements",              "departments, staff, leaves, assets, maintenance_logs, announcements"],
        ["Core",      "Geographic hierarchy and system settings",           "countries, states, cities, addresses, institutions, contacts, settings"],
    ],
    [58, 148, 256]
))
story.extend(sub("User Roles and Permissions"))
story.extend(make_tbl(
    ["Role", "Scope", "Key Capabilities"],
    [
        ["Admin",     "System-wide",      "Full oversight, reporting, configuration, staff management"],
        ["Student",   "Personal records", "View grades, register courses, access hostel and library"],
        ["Faculty",   "Academic domain",  "Enter marks, manage course rosters, view schedules"],
        ["Warden",    "Hostel domain",    "Room allotment, maintenance request management"],
        ["Librarian", "Library domain",   "Manage inventory, process issues and returns, enforce fines"],
    ],
    [65, 100, 297]
))

# ══════════════════════════════════════════════════════════════════════════════
# SECTION 5 – SYSTEM DESCRIPTION
# ══════════════════════════════════════════════════════════════════════════════
story.extend(sec(5, "Proposed System Description"))
story.extend(body(
    "UIMS integrates all university modules into a centralized relational database using a "
    "<b>database-first design philosophy</b>. PostgreSQL serves as the single system of record "
    "with explicit schema ownership per domain. Each module is isolated by its own tables, "
    "constraints, and PL/SQL routines — yet connected through shared foreign-key relationships "
    "and a unified authentication layer."
))
story.append(SP(4))
story.extend(sub("Technical Highlights"))
story.extend(bl([
    "<b>Atomic Resource Allocation:</b> Row-level locking (SELECT FOR UPDATE) ensures zero double-booking of hostel rooms and exam seats.",
    "<b>Library Fine Enforcement:</b> BEFORE INSERT trigger blocks book issues when a member's unpaid fines exceed Rs. 500.",
    "<b>Dynamic SGPA Calculation:</b> Stored function computes weighted average grade points per student per semester.",
    "<b>Immutable Audit Trail:</b> AFTER triggers on every table write JSON change_details to audit_logs for forensic reconstruction.",
    "<b>Token-Scoped Sessions:</b> Refresh tokens carry expiry and revocation timestamps — no active session survives a logout.",
    "<b>Soft Deletes:</b> No record is physically removed; deleted_at timestamps preserve full historical integrity.",
]))

# ══════════════════════════════════════════════════════════════════════════════
# SECTION 6 – AUTHENTICATION & AUDIT SCHEMA DIAGRAMS
# ══════════════════════════════════════════════════════════════════════════════
story.extend(sec(6, "Authentication & Audit Schema"))
story.extend(body(
    "The Auth schema implements a fully normalized role-based access control (RBAC) model. "
    "Users are assigned roles via a junction table; roles grant granular permissions per module. "
    "The Audit schema captures every data mutation and login event for compliance and forensics."
))
story.extend(full_img("auth.png",
    "Auth Schema: users, roles, permissions, user_roles, role_permissions, refresh_tokens",
    max_h=290))
story.extend(full_img("audit.png",
    "Audit Schema: audit_logs, login_logs, system_events",
    max_h=260))

# ══════════════════════════════════════════════════════════════════════════════
# SECTION 7 – ACADEMIC SCHEMA
# ══════════════════════════════════════════════════════════════════════════════
story.extend(sec(7, "Academic Schema"))
story.extend(body(
    "The Academic schema models the complete student lifecycle — from faculty and department "
    "hierarchy through course offerings, instructor assignments, semester-based enrollments, "
    "and final grade records. Students carry a current_semester_id foreign key that pins them "
    "to their active term."
))
story.extend(full_img("academic.png",
    "Academic Schema: faculties, departments, courses, instructors, students, enrollments, grades, semesters",
    max_h=440))

# ══════════════════════════════════════════════════════════════════════════════
# SECTION 8 – HOSTEL SCHEMA
# ══════════════════════════════════════════════════════════════════════════════
story.extend(sec(8, "Hostel Schema"))
story.extend(body(
    "The Hostel schema manages the full residential lifecycle. Hostels contain rooms; students "
    "are assigned to rooms via the allocations junction table. Wardens are linked to specific "
    "hostels. Maintenance requests are tied to individual rooms for targeted resolution tracking."
))
story.extend(full_img("hostel.png",
    "Hostel Schema: hostels, hostel_rooms, allocations, wardens, maintenance_requests, students",
    max_h=380))

# ══════════════════════════════════════════════════════════════════════════════
# SECTION 9 – LIBRARY SCHEMA
# ══════════════════════════════════════════════════════════════════════════════
story.extend(sec(9, "Library Schema"))
story.extend(body(
    "The Library schema tracks the full book lifecycle — from publishers and categories through "
    "individual book copies and multi-author attribution. Member borrowing events are logged in "
    "borrow_records; overdue returns automatically trigger fine creation via a stored procedure."
))
story.extend(full_img("library.png",
    "Library Schema: publishers, categories, books, authors, book_authors, members, borrow_records, fines",
    max_h=430))

# ══════════════════════════════════════════════════════════════════════════════
# SECTION 10 – EXAM SCHEMA
# ══════════════════════════════════════════════════════════════════════════════
story.extend(sec(10, "Examination Schema"))
story.extend(body(
    "The Exam schema handles complete examination management. Exams are linked to semesters and "
    "scheduled as exam_schedules with venue and timing. Invigilators are assigned per schedule. "
    "Results are stored in exam_results and evaluated against a grading_policies lookup table "
    "to derive letter grades and grade points."
))
story.extend(full_img("exam.png",
    "Exam Schema: exams, exam_schedules, exam_results, exam_invigilators, grading_policies",
    max_h=440))

# ══════════════════════════════════════════════════════════════════════════════
# SECTION 11 – ADMIN & CORE SCHEMAS
# ══════════════════════════════════════════════════════════════════════════════
story.extend(sec(11, "Admin & Core Schemas"))
story.extend(sub("Admin Schema"))
story.extend(body(
    "The Admin schema manages institutional staff, assets, events, and announcements. "
    "Staff belong to departments and can request leaves. Assets are tracked by category and "
    "status, with maintenance_logs recording every service event."
))
story.extend(full_img("admin.png",
    "Admin Schema: departments, staff, leaves, users, announcements, assets, maintenance_logs, events",
    max_h=340))
story.extend(sub("Core Schema"))
story.extend(body(
    "The Core schema provides the geographic and configuration foundation for the entire system. "
    "A strict hierarchy (countries → states → cities → addresses) anchors all address-bearing "
    "entities. The settings table provides key-value configuration accessible system-wide."
))
story.extend(full_img("core.png",
    "Core Schema: countries, states, cities, addresses, institutions, contacts, settings",
    max_h=430))

# ══════════════════════════════════════════════════════════════════════════════
# SECTION 12 – NORMALIZATION
# ══════════════════════════════════════════════════════════════════════════════
story.extend(sec(12, "Normalization & Schema Design"))
story.extend(make_tbl(
    ["Normal Form", "Condition Verified", "Action Taken"],
    [
        ["1NF",  "All attributes atomic; no repeating groups",
                 "Removed multi-valued contact strings; decomposed into addresses table (street, postal_code, city_id)"],
        ["2NF",  "No partial dependency on composite key",
                 "Isolated Room_Type-to-Fee into a lookup; enrollment PK is (student_id, course_id, semester_id)"],
        ["3NF",  "No transitive dependencies",
                 "Moved department details out of staff table; dean_name lives in faculties not departments"],
        ["BCNF", "Every determinant is a candidate key",
                 "Separated grading_policies to break the mark-range to letter_grade transitive path in exam_results"],
    ],
    [58, 168, 236]
))
story.extend(sub("Key Design Decisions"))
story.extend(bl([
    "<b>UUID primary keys</b> across all tables — avoids integer overflow at scale, enables distributed key generation.",
    "<b>UNIQUE constraints</b> on natural business keys: enrollment_code, isbn, employee_code, asset_tag, role code.",
    "<b>ON DELETE RESTRICT</b> on all foreign keys — prevents accidental cascade data loss.",
    "<b>Soft deletes</b> via deleted_at timestamp — no record is ever physically removed from the database.",
    "<b>JSON change_details</b> column in audit_logs captures the full before/after state of every UPDATE.",
]))
story.append(SP(6))

story.extend(sub("PL/SQL Components"))
story.extend(make_tbl(
    ["Component", "Type", "Business Rule Enforced"],
    [
        ["fine_block_trigger",    "BEFORE INSERT trigger",    "Blocks book issue if member has unpaid fines > Rs. 500"],
        ["hostel_allot()",        "Stored Procedure",         "Locks room row (SELECT FOR UPDATE); checks bed_count; inserts allocation atomically"],
        ["calculate_sgpa()",      "Stored Function",          "Returns credit-weighted average grade point for a student in a given semester"],
        ["audit_mutation()",      "AFTER trigger (all tables)","Writes old/new row diff as JSON to audit_logs on every INSERT, UPDATE, DELETE"],
        ["library_return_fine()", "Stored Procedure",         "Computes overdue days, calculates fine amount, inserts fines record on book return"],
    ],
    [130, 110, 222]
))
story.append(SP(6))

story.extend(sub("Transaction Management — Critical Scenarios"))
story.extend(make_tbl(
    ["Scenario", "Isolation Level", "Mechanism", "Guarantee"],
    [
        ["Hostel room allotment", "SERIALIZABLE",          "SELECT FOR UPDATE on hostel_rooms row",    "No two students assigned to same bed"],
        ["Exam seat registration","READ COMMITTED + lock",  "pg_advisory_xact_lock(exam_id)",           "Seat count never exceeds hall capacity"],
        ["Library book issue",    "READ COMMITTED",         "Decrement total_copies in same transaction","Available copy count stays non-negative"],
        ["Grade submission",      "READ COMMITTED",         "UPSERT (INSERT … ON CONFLICT DO UPDATE)",  "Re-submission updates; no duplicate row"],
    ],
    [118, 100, 150, 94]
))

# ══════════════════════════════════════════════════════════════════════════════
# DDL & CONCLUSION (flows after normalization section)
# ══════════════════════════════════════════════════════════════════════════════
story.extend(sub("Representative DDL — Auth Schema"))
story.extend(body(
    "All 35+ tables follow the same constraint pattern: UUID primary key, NOT NULL on every "
    "business-critical column, UNIQUE on natural keys, CHECK constraints on enumerable fields, "
    "and FOREIGN KEY with ON DELETE RESTRICT."
))
story.append(Paragraph(
    "CREATE TABLE users (\n"
    "  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),\n"
    "  email         TEXT        NOT NULL UNIQUE,\n"
    "  password_hash TEXT        NOT NULL,\n"
    "  status        TEXT        NOT NULL DEFAULT 'active'\n"
    "                            CHECK (status IN ('active','inactive','suspended')),\n"
    "  version       INTEGER     NOT NULL DEFAULT 1,\n"
    "  created_at    TIMESTAMPTZ DEFAULT now(),\n"
    "  deleted_at    TIMESTAMPTZ\n"
    ");\n\n"
    "CREATE TABLE roles (\n"
    "  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),\n"
    "  code        TEXT    NOT NULL UNIQUE,\n"
    "  scope_type  TEXT    NOT NULL,\n"
    "  is_system   BOOLEAN NOT NULL DEFAULT false\n"
    ");",
    sCode
))
story.append(SP(10))

story.extend(sub("Expected Outcomes"))
story.extend(bl([
    "Production-ready relational database ecosystem with zero redundancy and full referential integrity.",
    "Automated institutional workflows via PL/SQL — fine enforcement, SGPA calculation, audit logging.",
    "Role-based access control ensuring data is visible only to authorized users at the correct scope.",
    "Scalability to 100,000+ concurrent students via PostgreSQL connection pooling and strategic indexing.",
    "Comprehensive audit trail enabling forensic reconstruction of any data mutation event.",
]))
story.append(SP(8))

story.extend(sub("Conclusion"))
story.extend(body(
    "The Thapar University Integrated Management System (UIMS) directly addresses the fundamental "
    "shortcomings of fragmented university administration. By employing a centralized PostgreSQL "
    "database with strict BCNF normalization, comprehensive PL/SQL automation, immutable audit "
    "logging, and role-scoped access control across eight domain schemas and 35+ tables, the system "
    "delivers a reliable, scalable, and secure solution for modern institutional operations."
))
story.append(SP(12))

# Final team card
fn = PS("fn", fontName="Helvetica-Bold", fontSize=9.5, textColor=BLACK)
fr = PS("fr", fontName="Helvetica",      fontSize=9.5, textColor=DGRAY)
fh = PS("fh", fontName="Helvetica-Bold", fontSize=9.5, textColor=NAVY)

final_rows = [[Paragraph("<b>Project Team</b>", fh), Paragraph("<b>Roll Number</b>", fh)]]
for name, roll in students:
    final_rows.append([Paragraph(name, fn), Paragraph(roll, fr)])
final_rows.append([Paragraph("<b>Lab Instructor</b>", fh),
                   Paragraph("Dr. Abhishelly", fn)])
ft = Table(final_rows, colWidths=[CW*0.5, CW*0.5])
ft.setStyle(TableStyle([
    ("BOX",          (0,0),(-1,-1), 0.8, NAVY),
    ("INNERGRID",    (0,0),(-1,-1), 0.3, MGRAY),
    ("BACKGROUND",   (0,0),(-1,0),  LGRAY),
    ("TOPPADDING",   (0,0),(-1,-1), 6),
    ("BOTTOMPADDING",(0,0),(-1,-1), 6),
    ("LEFTPADDING",  (0,0),(-1,-1), 8),
    ("RIGHTPADDING", (0,0),(-1,-1), 8),
]))
story.append(ft)

# ── Build ──────────────────────────────────────────────────────────────────────
doc = UIDoc(
    OUT_FILE, pagesize=A4,
    leftMargin=ML, rightMargin=MR,
    topMargin=MT, bottomMargin=MB,
    title="UIMS Technical Project Report",
    author="Sushain Sharma, Manan Kapoor, Abhinav Kumar Singh"
)
doc.build(story)
sz = os.path.getsize(OUT_FILE)
print(f"Done: {OUT_FILE}  ({sz//1024} KB)")
