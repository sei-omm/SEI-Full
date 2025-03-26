-- Create Database
CREATE DATABASE sei_db;

-- Create Tables
CREATE TABLE department (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TYPE marital_status_enum AS ENUM ('Married', 'Un-Married');
CREATE TABLE employee (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    -- employee_id VARCHAR(7),
    joining_date DATE,
    -- job_title VARCHAR(255),
    -- department VARCHAR(255),
    department_id INTEGER,
    FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE SET NULL,

    rank VARCHAR(200) NOT NULL,
    fin_number VARCHAR(30) DEFAULT '0',
    indos_number VARCHAR(30) DEFAULT '0',
    cdc_number VARCHAR(30) DEFAULT '0',
    grade VARCHAR(10),
    qualification VARCHAR(200),
    additional_qualification VARCHAR(200),
    selling_experience VARCHAR(30),
    teaching_experience VARCHAR(30),
    
    contact_number VARCHAR(15),
    email_address VARCHAR(255),
    living_address TEXT,
    dob DATE,
    gender VARCHAR(6),
    marital_status marital_status_enum NOT NULL DEFAULT 'Married',
    bank_name VARCHAR(100),
    bank_account_no VARCHAR(20),
    account_holder_name VARCHAR(100),
    ifsc_code CHAR(11),
    profile_image VARCHAR(2083),
    -- resume VARCHAR(2083),
    -- pan_card VARCHAR(2083),
    -- aadhaar_card VARCHAR(2083),
    -- ten_pass_certificate VARCHAR(2083),
    -- twelve_pass_certificate VARCHAR(2083),
    -- graduation_certificate VARCHAR(2083),
    -- other_certificate TEXT,
    basic_salary DECIMAL(10, 2) DEFAULT 0.0,
    hra DECIMAL(10, 2) DEFAULT 0.0,
    other_allowances DECIMAL(10, 2) DEFAULT 0.0,
    provident_fund DECIMAL(10, 2) DEFAULT 0.0,
    professional_tax DECIMAL(10, 2) DEFAULT 0.0,
    esic DECIMAL(10, 2) DEFAULT 0.0,
    income_tax DECIMAL(10, 2) DEFAULT 0.0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    login_email VARCHAR(255),
    login_password VARCHAR(255),
    
    max_teaching_hrs_per_week VARCHAR(15),
    employee_type VARCHAR(50),
    faculty_attendance_type VARCHAR(50),
    employee_attendance_type VARCHAR(20) CHECK (employee_attendance_type IN ('Regular', 'Visiting')) DEFAULT 'Regular',
    institute VARCHAR(20), --Faridabad/Kolkata


    assign_course VARCHAR(100),

    employee_role VARCHAR(20) CHECK (employee_role IN ('Super_Admin', 'Accounts', 'Employee')) DEFAULT 'Employee'
);

CREATE TYPE leave_status_enum AS ENUM ('pending', 'success', 'decline');
CREATE TABLE leave (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    leave_from DATE NOT NULL,
    leave_to DATE NOT NULL,
    leave_reason TEXT NOT NULL,
    leave_status leave_status_enum NOT NULL DEFAULT 'pending',
    FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE
);

CREATE TABLE job (
    id SERIAL PRIMARY KEY,
    job_title VARCHAR(250) NOT NULL,
    address TEXT NOT NULL,
    exprience VARCHAR(100) NOT NULL,
    -- department VARCHAR(100) NOT NULL,
    department INTEGER,
    job_description TEXT,
    FOREIGN KEY (department) REFERENCES department(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE enum_application_status AS ENUM ('pending', 'success', 'decline');
--fro droping -> DROP TYPE enum_application_status;
CREATE TABLE candidate_job_application (
    id SERIAL PRIMARY KEY,
    application_id VARCHAR(50) NOT NULL,
    name VARCHAR(250) NOT NULL,
    email VARCHAR(200) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    dob DATE NOT NULL,
    work_experience VARCHAR(50),
    resume TEXT NOT NULL,
    application_status enum_application_status NOT NULL DEFAULT 'pending',
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_contact_number_format CHECK (contact_number ~* '^\+?[0-9]{10,15}$'),

    job_id INTEGER NOT NULL,
    FOREIGN KEY (job_id) REFERENCES job(id) ON DELETE CASCADE
);

CREATE EXTENSION IF NOT EXISTS tablefunc;
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  date DATE DEFAULT CURRENT_DATE, -- The date of attendance
  status VARCHAR(20) CHECK (status IN ('Present', 'Absent', 'Half Day', 'Sunday', 'Holiday')), -- Tracks the attendance status
  FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,
  UNIQUE (employee_id, date)
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- For Students
CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    name VARCHAR(250) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(15) NOT NULL,
    dob DATE NOT NULL,
    password TEXT NOT NULL,
    profile_image VARCHAR(2083),

    indos_number VARCHAR(255),
    rank VARCHAR(255),
    nationality VARCHAR(255),
    permanent_address TEXT,
    present_address TEXT,
    blood_group VARCHAR(10),
    allergic_or_medication VARCHAR(255),
    next_of_kin_name VARCHAR(255),
    relation_to_sel VARCHAR(255),
    emergency_number VARCHAR(15) NOT NULL DEFAULT 0,
    number_of_the_cert VARCHAR(255),
    issued_by_institute VARCHAR(255),
    issued_by_institute_indos_number VARCHAR(30) DEFAULT 0,

    id_proof TEXT,
    address_proof TEXT,
    academic_proof TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE fillup_form_seq_id START 1; -- For Delete -> DROP SEQUENCE test_form_id_seq;
CREATE TABLE fillup_forms (
    form_id TEXT PRIMARY KEY,

    student_id INT,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,

    form_status VARCHAR(20) CHECK (form_status IN ('Approve', 'Pending', 'Cancel')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- course table
CREATE TABLE courses (
  course_id SERIAL PRIMARY KEY,
  course_code VARCHAR(20) NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  institute VARCHAR(20) NOT NULL,
  course_type VARCHAR(20) NOT NULL,
  require_documents TEXT,
  subjects TEXT,
  course_showing_order SERIAL,
  course_duration VARCHAR(255) NOT NULL,
  course_fee DECIMAL(10, 2) DEFAULT 0.0,
  min_pay_percentage INTEGER DEFAULT 100,
  total_seats INTEGER DEFAULT 0,
  remain_seats INTEGER DEFAULT 0,
  course_visibility VARCHAR(20) CHECK (course_visibility IN ('Public', 'Private', 'Schedule')),
  course_update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  concern_marketing_executive_id INTEGER,
  FOREIGN KEY (concern_marketing_executive_id) REFERENCES employee(id) ON DELETE CASCADE,

  course_pdf TEXT
);

CREATE TABLE course_batches (
    batch_id SERIAL PRIMARY KEY,

    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    batch_fee INTEGER NOT NULL,
    min_pay_percentage INTEGER DEFAULT 100,
    batch_total_seats INTEGER NOT NULL,
    batch_reserved_seats INTEGER NOT NULL,
    visibility VARCHAR(20) CHECK (visibility IN ('Public', 'Private')),

    course_id INTEGER NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enrolled_batches_courses (
  enroll_id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL,
  batch_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
  FOREIGN KEY (batch_id) REFERENCES course_batches(batch_id) ON DELETE CASCADE,
--   form_id VARCHAR(255),
--   form_status VARCHAR(200),

   form_id TEXT,
   FOREIGN KEY (form_id) REFERENCES fillup_forms(form_id) ON DELETE CASCADE, 

  order_id VARCHAR(255), 
  -- UNIQUE (student_id, course_id),
--   UNIQUE (batch_id),
  enrollment_status VARCHAR(20) CHECK (enrollment_status IN ('Approve', 'Pending', 'Cancel')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE otps (
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(5) NOT NULL,
    UNIQUE (email),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (email)
);
CREATE INDEX email ON otps (email);

-- Course Payments 
CREATE TABLE payments (
    student_id INT,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,

    paid_amount DECIMAL(10, 2) DEFAULT 0.0,
    payment_id VARCHAR(255),

    remark TEXT,
    mode VARCHAR(200),
    order_id VARCHAR(255),

    misc_payment DECIMAL(10, 2) DEFAULT 0.0,
    misc_remark TEXT,

    course_id INT,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE, 

    batch_id INT,
    FOREIGN KEY (batch_id) REFERENCES course_batches(batch_id) ON DELETE CASCADE, 

    form_id TEXT,
    FOREIGN KEY (form_id) REFERENCES fillup_forms(form_id) ON DELETE CASCADE, 

    payment_type VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_docs (
    student_id INT,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,

    doc_id VARCHAR(255) NOT NULL,
    doc_uri TEXT,
    doc_name VARCHAR(255),
    UNIQUE (doc_id, student_id)
);

CREATE TABLE employee_docs (
    employee_id INT,
    FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,

    doc_id VARCHAR(255) NOT NULL,
    doc_uri TEXT,
    doc_name VARCHAR(255),
    UNIQUE (doc_id, employee_id)
);

CREATE TABLE library (
    library_id SERIAL PRIMARY KEY,

    library_file_name VARCHAR(255),
    library_file_type VARCHAR(20) CHECK (library_file_type IN ('pdf', 'doc', 'audio', 'image', 'link')),

    is_active BOOLEAN,
    library_resource_link TEXT,
    allow_download BOOLEAN,

    visibility VARCHAR(20) CHECK(visibility IN ('subject-specific', 'course-specific')),

    institute VARCHAR(20), --Faridabad/Kolkata

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subjects (
    subject_id SERIAL PRIMARY KEY,
    subject_name VARCHAR(255) NOT NULL
);

CREATE TABLE library_with_course (
    library_id INTEGER NOT NULL,
    FOREIGN KEY (library_id) REFERENCES library(library_id) ON DELETE CASCADE,

    course_id INTEGER DEFAULT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

CREATE TABLE library_with_subject (
    library_id INTEGER NOT NULL,
    FOREIGN KEY (library_id) REFERENCES library(library_id) ON DELETE CASCADE,

    subject_id INT DEFAULT NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE
);

-- For File and Folders compliance-record
CREATE TABLE folders (
    folder_id SERIAL PRIMARY KEY,
    folder_name VARCHAR(255),
    parent_folder_id INTEGER DEFAULT NULL
);

CREATE TABLE files (
    file_id SERIAL PRIMARY KEY,
    file_name VARCHAR(255),

    file_type VARCHAR(255),
    file_url TEXT,

    folder_id INT DEFAULT NULL,
    FOREIGN KEY (folder_id) REFERENCES folders(folder_id) ON DELETE CASCADE
);

-- Inventory Management

CREATE TABLE durable (
    durable_id SERIAL PRIMARY KEY,
    room_name VARCHAR(255),
    floor INTEGER,
    number_of_rows INTEGER,
    capasity INTEGER,
    available_items TEXT,
    is_available BOOLEAN,
    institute VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE consumable_category (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL
);

CREATE TABLE consumable (
    consumable_id SERIAL PRIMARY KEY,
    item_name VARCHAR(255),

    category_id INTEGER,
    FOREIGN KEY (category_id) REFERENCES consumable_category(category_id) ON DELETE SET NULL,

    quantity INTEGER,
    min_quantity INTEGER,

    last_purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    supplier_id INTEGER,

    cost_per_unit DECIMAL(10, 2),

    total_volume INTEGER,
    remark TEXT,

    institute VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vendor (
   vendor_id SERIAL PRIMARY KEY,
   vendor_name VARCHAR(255),
   institute VARCHAR(100),
   service_type VARCHAR(255),
   address TEXT,
   contact_details VARCHAR(255),
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_list (
    inventory_id SERIAL PRIMARY KEY,
    item_name VARCHAR(255),

    category INTEGER,
    sub_category INTEGER,

    description TEXT,
    where_to_use VARCHAR(255),
    used_by VARCHAR(255),

    opening_stock INTEGER,
    minimum_quantity INTEGER,
    item_consumed INTEGER,
    closing_stock INTEGER,

    item_status INTEGER,

    vendor_id INTEGER,
    FOREIGN KEY (vendor_id) REFERENCES vendor(vendor_id) ON DELETE SET NULL,

    cost_per_unit_current DECIMAL(10, 2),
    total_value DECIMAL(10, 2),
    remark TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_item_info (
    item_id SERIAL PRIMARY KEY,
    item_name VARCHAR(255),

    category INTEGER,
    sub_category INTEGER,
    
    where_to_use VARCHAR(255),
    used_by VARCHAR(255),
    description TEXT,

    minimum_quantity INTEGER,

    -- Additional For Not To Do Much Query For Reports
    current_status TEXT,
    
    current_vendor_id INTEGER,
    FOREIGN KEY (current_vendor_id) REFERENCES vendor(vendor_id) ON DELETE SET NULL,

    cost_per_unit_current DECIMAL(10, 2),
    cost_per_unit_previous DECIMAL(10, 2),
    current_purchase_date DATE DEFAULT CURRENT_DATE,

    institute VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_stock_info (
    stock_id SERIAL PRIMARY KEY,
    
    opening_stock INTEGER,
    item_consumed INTEGER,
    closing_stock INTEGER,

    status TEXT,

    vendor_id INTEGER,
    FOREIGN KEY (vendor_id) REFERENCES vendor(vendor_id) ON DELETE SET NULL,

    cost_per_unit_current DECIMAL(10, 2),
    total_value DECIMAL(10, 2),
    remark TEXT,

    item_id INTEGER,
    FOREIGN KEY (item_id) REFERENCES inventory_item_info(item_id) ON DELETE CASCADE,

    type VARCHAR(8) CHECK(type IN ('add', 'consumed')),

    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE maintence_record (
    record_id SERIAL PRIMARY KEY,

    item_id INTEGER,
    FOREIGN KEY (item_id) REFERENCES inventory_item_info(item_id) ON DELETE CASCADE,

    maintence_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    work_station VARCHAR(255),
    description_of_work TEXT,
    department VARCHAR(255),
    assigned_person VARCHAR(255),
    approved_by VARCHAR(255),
    cost VARCHAR(255),
    status VARCHAR(10),
    completed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remark TEXT,

    institute VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- New DBS -> 27 Dec 2024

-- Course Table
CREATE TABLE course_with_max_batch_per_month (
    course_id INTEGER,
    created_date DATE DEFAULT CURRENT_DATE,
    created_month DATE NOT NULL DEFAULT DATE_TRUNC('month', CURRENT_DATE),  -- This ensures we store first day of month
    max_batch INTEGER DEFAULT 0,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    UNIQUE (course_id, created_month)
);

CREATE TABLE faculty_with_course_subject (
    faculty_id INTEGER,
    FOREIGN KEY (faculty_id) REFERENCES employee(id) ON DELETE CASCADE,

    course_id INTEGER,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,

    subject TEXT,

    UNIQUE (faculty_id, course_id)
);

-- Planned Maintenance System
CREATE TABLE planned_maintenance_system (
    planned_maintenance_system_id SERIAL PRIMARY KEY,
    item_id INTEGER,
    FOREIGN KEY (item_id) REFERENCES inventory_item_info(item_id) ON DELETE CASCADE,
    frequency VARCHAR(255),
    last_done DATE,
    next_due DATE,
    description TEXT,
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- New DBS -> 28 Dec 2024

ALTER TABLE payments
ADD discount_amount DECIMAL(10, 2) DEFAULT 0.0,
ADD discount_remark TEXT;


-- New DBS -> 30 Dec 2024
CREATE TABLE refund_details (
    student_id INTEGER,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,

    course_id INTEGER,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,

    batch_id INTEGER,
    FOREIGN KEY (batch_id) REFERENCES course_batches(batch_id) ON DELETE CASCADE,

    refund_amount DECIMAL(10,2) DEFAULT 0.0,
    refund_reason TEXT,
    bank_details TEXT,

    executive_name VARCHAR(255),
    refund_id VARCHAR(255),

    mode VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE receipt_no_seq START 1;
ALTER TABLE payments
ADD receipt_no TEXT PRIMARY KEY DEFAULT 'KOL/2024/' || nextval('receipt_no_seq');

-- New DBS -> 06 Jan 2025
ALTER TABLE employee
ALTER COLUMN employee_role TYPE VARCHAR(20),
ALTER COLUMN employee_role SET DEFAULT 'Employee';

ALTER TABLE employee
DROP CONSTRAINT employee_employee_role_check;

-- New DBS -> 08 Jan 2025

-- CREATE TABLE appraisal (
--     appraisal_id SERIAL PRIMARY KEY,

--     employee_id INTEGER,
--     FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE SET NULL,

--     discipline TEXT,
--     duties TEXT,
--     targets TEXT,
--     achievements TEXT,

--     appraisal_options TEXT,

--     state_of_health TEXT,
--     integrity TEXT,

--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE appraisal_and_employee (
--     item_id SERIAL PRIMARY KEY,

--     appraisal_id INTEGER,
--     FOREIGN KEY (appraisal_id) REFERENCES appraisal(appraisal_id) ON DELETE CASCADE,

--     from_employee_id INTEGER,
--     FOREIGN KEY (from_employee_id) REFERENCES employee(id) ON DELETE SET NULL,

--     to_employee_id INTEGER,
--     FOREIGN KEY (to_employee_id) REFERENCES employee(id) ON DELETE SET NULL,

--     appraisal_status VARCHAR(255) CHECK (appraisal_status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
--     appraisal_remark TEXT,

--     UNIQUE(from_employee_id, to_employee_id)
-- );

ALTER TABLE department
ADD designation TEXT DEFAULT '';

ALTER TABLE employee
ADD designation VARCHAR(255),
ADD authority INTEGER DEFAULT 0; -- 0 Mean Employee


ALTER TABLE students
ADD cdc_num VARCHAR(255),
ADD passport_num VARCHAR(255);


-- 14 Jan 2025 New Dbs
-- CREATE TABLE new_inventory_list (
--     inventory_item_id SERIAL PRIMARY KEY,
--     item_name VARCHAR(255),
--     category INTEGER,
--     sub_category INTEGER,
--     description TEXT,
--     where_to_use VARCHAR(255),
--     used_by VARCHAR(255),

--     minimum_quantity INTEGER,
--     item_consumed INTEGER,
--     closing_stock INTEGER,

--     item_status INTEGER,

--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE new_inventory_stock (
--     inventory_item_id INTEGER,
--     FOREIGN KEY (inventory_item_id) REFERENCES new_inventory_list(inventory_item_id) ON DELETE SET NULL,

--     opening_stock INTEGER,

--     vendor_id INTEGER,
--     FOREIGN KEY (vendor_id) REFERENCES vendor(vendor_id) ON DELETE SET NULL,

--     purchsed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     remark TEXT,

--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

ALTER TABLE inventory_item_info
ALTER COLUMN current_purchase_date TYPE DATE;

ALTER TABLE inventory_item_info
ALTER COLUMN current_purchase_date SET DEFAULT CURRENT_DATE;


-- New DB 16 Jan 2025
ALTER TABLE students
ADD COLUMN coc_number VARCHAR(255),
ADD COLUMN cert_of_completency TEXT;

ALTER TABLE employee
ADD COLUMN gratuity DECIMAL(10, 2) DEFAULT 0.0,
ADD COLUMN permanent_address TEXT,
ADD emergency_contact_number VARCHAR(255),
ADD contact_person_name VARCHAR(255),
ADD contact_person_relation VARCHAR(255);


CREATE TABLE assign_assets_employee(
    assets_id SERIAL PRIMARY KEY,

    to_employee_id INTEGER,
    FOREIGN KEY (to_employee_id) REFERENCES employee(id) ON DELETE CASCADE,

    assets_name VARCHAR(255),
    issued_by VARCHAR(255)
);

CREATE TABLE payscale (
    item_id SERIAL PRIMARY KEY,
    item_type VARCHAR(255) CHECK (item_type IN ('Year', 'Payscale Label')) NOT NULL,
    item_value VARCHAR(255) NOT NULL
);

ALTER TABLE employee
ADD COLUMN payscale_label VARCHAR(255),
ADD COLUMN payscale_year INTEGER;

ALTER TABLE employee
DROP COLUMN rank;


-- New DB -> 23 Jan
CREATE TABLE batch_modified_by (
    employee_id INTEGER,
    FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,

    batch_id INTEGER,
    FOREIGN KEY (batch_id) REFERENCES course_batches(batch_id) ON DELETE CASCADE,

    UNIQUE (employee_id, batch_id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- NEW DB SETUP -> 27 Jan 2025
ALTER TABLE refund_details
ADD COLUMN status VARCHAR(50) CHECK (status IN ('Pending', 'Approved', 'Reject')) DEFAULT 'Pending';

ALTER TABLE refund_details
ADD CONSTRAINT refund_details_unique UNIQUE (student_id, course_id, batch_id);

ALTER TABLE refund_details
ADD COLUMN institute VARCHAR(50) DEFAULT 'Kolkata',
ADD COLUMN form_id TEXT,
ADD COLUMN payment_id VARCHAR(255);

ALTER TABLE refund_details
ADD CONSTRAINT refund_details_form_id_fk
FOREIGN KEY (form_id) REFERENCES fillup_forms(form_id) ON DELETE CASCADE;

ALTER TABLE students
ADD COLUMN institute VARCHAR(50) DEFAULT 'Kolkata';

ALTER TABLE students
ADD CONSTRAINT unique_email UNIQUE (email);

ALTER TABLE assign_assets_employee
ADD COLUMN issue_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN return_date DATE DEFAULT NULL;

-- DEFAULT FOLDER NAMES
DELETE FROM folders;
DELETE FROM files;

INSERT INTO folders (folder_name, institute) 
VALUES 
    ('Employee Personnel Files', 'Faridabad'),
    ('Recruitment Records Folder', 'Faridabad'),
    ('Training & Development Files', 'Faridabad'),
    ('Performance Management Folder', 'Faridabad'),
    ('Attendance & Leave Records Folder', 'Faridabad'),
    ('Payroll & Benefits Records Folder', 'Faridabad'),
    ('Disciplinary Actions Folder', 'Faridabad'),
    ('Exit Records Folder', 'Faridabad');

INSERT INTO folders (folder_name, institute) 
VALUES 
    ('Employee Personnel Files', 'Kolkata'),
    ('Recruitment Records Folder', 'Kolkata'),
    ('Training & Development Files', 'Kolkata'),
    ('Performance Management Folder', 'Kolkata'),
    ('Attendance & Leave Records Folder', 'Kolkata'),
    ('Payroll & Benefits Records Folder', 'Kolkata'),
    ('Disciplinary Actions Folder', 'Kolkata'),
    ('Exit Records Folder', 'Kolkata');

ALTER TABLE employee
ADD COLUMN next_to_kin VARCHAR(200),
ADD COLUMN relation_to_self VARCHAR(200);


CREATE TABLE holiday_management (
    holiday_id SERIAL PRIMARY KEY,
    holiday_name VARCHAR(255),
    holiday_date DATE,
    holiday_year VARCHAR(4)
);

ALTER TABLE job
ADD COLUMN vendors_email TEXT DEFAULT '';

-- NEW DB TABLE 01 Feb 2025

ALTER TABLE folders
ADD COLUMN institute VARCHAR(100) DEFAULT 'Kolkata';

ALTER TABLE files
ADD COLUMN institute VARCHAR(100) DEFAULT 'Kolkata';

DELETE FROM holiday_management;

ALTER TABLE holiday_management
ADD COLUMN institute VARCHAR(100);

-- RUN THIS QUERY IN POSTGRES MANUALLY TO STORE leave default details for existing employee
-- INSERT INTO employee_leave (employee_id, cl, sl, el, ml)
-- SELECT id, 10, 10, 0, 84  -- Default leave balance
-- FROM employee
-- WHERE id NOT IN (SELECT employee_id FROM employee_leave); 

-- INSERT INTO employee_leave (employee_id, cl, sl, el, ml, financial_year_date)
-- SELECT id, 10, 10, 0, 84, '2024-04-01'  -- Replace with your financial year start date
-- FROM employee
-- ON CONFLICT (employee_id, financial_year_date) DO NOTHING;

-- First, create a function to calculate the financial year start
CREATE OR REPLACE FUNCTION get_financial_year_start()
RETURNS DATE AS $$
DECLARE
  current_year INT := EXTRACT(YEAR FROM CURRENT_DATE);
  financial_month INT := 4; -- April (adjust this to your financial year start month)
BEGIN
  IF EXTRACT(MONTH FROM CURRENT_DATE) >= financial_month THEN
    RETURN TO_DATE(current_year || '-' || financial_month || '-01', 'YYYY-MM-DD');
  ELSE
    RETURN TO_DATE((current_year - 1) || '-' || financial_month || '-01', 'YYYY-MM-DD');
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE TABLE employee_leave (
    employee_id INTEGER REFERENCES employee(id) ON DELETE CASCADE,
    cl INT DEFAULT 10,
    sl INT DEFAULT 10,
    el INT DEFAULT 0,
    ml INT DEFAULT 84,
    financial_year_date DATE NOT NULL,
    UNIQUE (employee_id, financial_year_date)
);

-- Then alter the table to add a default
ALTER TABLE employee_leave 
ALTER COLUMN financial_year_date SET DEFAULT get_financial_year_start();

INSERT INTO employee_leave (employee_id, cl, sl, el, ml)
SELECT id, 10, 10, 0, 84 
FROM employee
ON CONFLICT (employee_id, financial_year_date) DO NOTHING;

-- NEW DB 03 Feb 2025
DELETE FROM leave;
DELETE FROM attendance;

ALTER TABLE leave
ADD COLUMN leave_type VARCHAR(5) NOT NULL;

-- NEW DB 06 Feb 2025
--not for all employee only for check in this month earned leave applied or not
CREATE TABLE earned_leave_history (
    month DATE DEFAULT DATE_TRUNC('month', NOW())
);

DELETE FROM attendance;
DELETE FROM leave;

ALTER TABLE leave
ADD CONSTRAINT leave_unique_key UNIQUE(employee_id, leave_from, leave_to);

-- NEW DB 07 Feb 2025
DELETE FROM inventory_item_info;

DROP TABLE inventory_stock_info;

CREATE TABLE inventory_stock_info (
    stock_id SERIAL PRIMARY KEY,
    
    opening_stock INTEGER,
    item_consumed INTEGER,
    closing_stock INTEGER,

    status TEXT,

    vendor_id INTEGER,
    FOREIGN KEY (vendor_id) REFERENCES vendor(vendor_id) ON DELETE SET NULL,

    cost_per_unit_current DECIMAL(10, 2),
    total_value DECIMAL(10, 2),
    remark TEXT,

    item_id INTEGER,
    FOREIGN KEY (item_id) REFERENCES inventory_item_info(item_id) ON DELETE CASCADE,

    type VARCHAR(8) CHECK(type IN ('add', 'consumed')),

    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tranning_requirement (
    employee_id INTEGER REFERENCES employee(id) ON DELETE CASCADE,

    it_generated_date DATE,
    it_completed_date DATE,

    se_generated_date DATE,
    se_completed_date DATE,

    tr_generated_date DATE,
    tr_completed_date DATE,

    it_form_data TEXT,
    se_form_data TEXT,
    tr_form_date TEXT,

    it_form_is_accepted BOOLEAN DEFAULT false,
    se_form_is_accepted BOOLEAN DEFAULT false,
    tr_form_is_accepted BOOLEAN DEFAULT false,

    created_at DATE DEFAULT CURRENT_DATE,

    UNIQUE (employee_id)
);

-- NEW DB 08 Feb 2025
ALTER TABLE payments
ADD COLUMN bank_transaction_id VARCHAR(255);

ALTER TABLE refund_details 
ADD COLUMN bank_transaction_id VARCHAR(255);

-- DROP TABLE pms_history;
DROP TABLE planned_maintenance_system;

CREATE TABLE planned_maintenance_system (
    planned_maintenance_system_id SERIAL PRIMARY KEY,

    item_id INTEGER,
    FOREIGN KEY (item_id) REFERENCES inventory_item_info(item_id) ON DELETE CASCADE,

    custom_item VARCHAR(255),

    institute VARCHAR(30) DEFAULT 'Kolkata',

    UNIQUE (item_id, institute)
);

CREATE TABLE pms_history (
    pms_history_id SERIAL PRIMARY KEY,

    planned_maintenance_system_id INTEGER,
    FOREIGN KEY (planned_maintenance_system_id) REFERENCES planned_maintenance_system(planned_maintenance_system_id) ON DELETE CASCADE,

    frequency VARCHAR(255),
    last_done DATE,
    next_due DATE,
    description TEXT,
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE inventory_item_info DROP COLUMN current_vendor_id;
ALTER TABLE inventory_item_info ADD COLUMN vendor_id INTEGER;

ALTER TABLE inventory_item_info 
DROP CONSTRAINT IF EXISTS inventory_item_info_vendor_id_fkey, 
ADD CONSTRAINT inventory_item_info_vendor_id_fkey 
FOREIGN KEY (vendor_id) REFERENCES vendor(vendor_id) ON DELETE SET NULL;

DELETE FROM inventory_item_info;

ALTER TABLE inventory_item_info DROP COLUMN cost_per_unit_current;
ALTER TABLE inventory_item_info DROP COLUMN cost_per_unit_previous;
ALTER TABLE inventory_item_info DROP COLUMN current_purchase_date;

ALTER TABLE inventory_item_info ADD COLUMN cost_per_unit_current DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE inventory_item_info ADD COLUMN cost_per_unit_previous DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE inventory_item_info ADD COLUMN current_purchase_date DATE;
ALTER TABLE inventory_item_info ADD COLUMN updated_date DATE DEFAULT CURRENT_DATE;

ALTER TABLE inventory_item_info ADD COLUMN closing_stock INTEGER DEFAULT 0;
ALTER TABLE inventory_item_info ADD COLUMN opening_stock INTEGER DEFAULT 0;
ALTER TABLE inventory_item_info ADD COLUMN item_consumed INTEGER DEFAULT 0;
ALTER TABLE inventory_item_info ADD COLUMN total_value DECIMAL(10, 2) DEFAULT 0.00;

ALTER TABLE inventory_stock_info DROP COLUMN item_consumed;
ALTER TABLE inventory_stock_info DROP COLUMN closing_stock;
ALTER TABLE inventory_stock_info DROP COLUMN opening_stock;
ALTER TABLE inventory_stock_info DROP COLUMN vendor_id;

ALTER TABLE inventory_stock_info DROP COLUMN cost_per_unit_current;
ALTER TABLE inventory_stock_info ADD COLUMN cost_per_unit DECIMAL(10, 2);

ALTER TABLE inventory_stock_info ADD COLUMN stock INT;

CREATE TABLE inventory_item_consume (
    item_id INTEGER,
    FOREIGN KEY (item_id) REFERENCES inventory_item_info(item_id) ON DELETE CASCADE,

    remark TEXT,
    consumed_date DATE DEFAULT CURRENT_DATE,

    consume_stock INTEGER
);

ALTER TABLE inventory_stock_info DROP COLUMN type;

CREATE TABLE notification (
    notification_id SERIAL PRIMARY KEY,
    notification_title VARCHAR(255),
    notification_description TEXT,
    link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification_sended (
    notification_sended_id SERIAL PRIMARY KEY,
    notification_id INTEGER,
    FOREIGN KEY (notification_id) REFERENCES notification(notification_id) ON DELETE CASCADE,

    employee_id INTEGER,
    employee_role VARCHAR(255), -- priority will be high
    is_readed BOOLEAN DEFAULT FALSE
);

DROP TABLE maintence_record;

CREATE TABLE maintence_record (
    record_id SERIAL PRIMARY KEY,

    item_id INTEGER,
    FOREIGN KEY (item_id) REFERENCES inventory_item_info(item_id) ON DELETE CASCADE,

    custom_item VARCHAR(255),

    maintence_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    work_station VARCHAR(255),
    description_of_work TEXT,
    department VARCHAR(255),
    assigned_person VARCHAR(255),
    approved_by VARCHAR(255),
    cost VARCHAR(255),
    status VARCHAR(10),
    completed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remark TEXT,

    institute VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (item_id, maintence_date),
    UNIQUE (custom_item, maintence_date)
);

DROP TABLE tranning_requirement;

CREATE TABLE tranning_requirement (
    record_id SERIAL PRIMARY KEY,
    tranning_name  VARCHAR(255), -- This will consider as tranning_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,

    employee_id INTEGER,
    FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,

    employee_visibility BOOLEAN DEFAULT TRUE,
    form_data TEXT
);

-- NEW DB 14 Feb 2025
ALTER TABLE employee ADD COLUMN faculty_current_working_hours INTEGER DEFAULT 0;

-- CREATE TABLE time_table (
--     date DATE,
--     info TEXT,
--     institute VARCHAR(100),
--     UNIQUE (date)
-- );

-- CREATE TABLE time_table (
--     date DATE,

--     course_id INTEGER,
--     FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,

--     employee_id INTEGER,
--     FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,

--     for_subject_name TEXT,

--     institute VARCHAR(100)
-- )

CREATE TABLE time_table (
    date DATE,

    time_table_data TEXT,
    
    institute VARCHAR(100)
);

-- NEW DB 18 Feb 2025
DELETE FROM employee_leave;
DELETE FROM earned_leave_history;

CREATE TABLE phy_lib_books (
    phy_lib_book_id SERIAL PRIMARY KEY,
    book_name VARCHAR(255),
    edition VARCHAR(255),
    author VARCHAR(255),
    row_number INTEGER,
    shelf VARCHAR(255),
    institute VARCHAR(100)
);

CREATE TABLE phy_lib_book_issue (
    phy_lib_book_issue_id SERIAL PRIMARY KEY,

    student_id BIGINT,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,

    course_id BIGINT,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE SET NULL,

    phy_lib_book_id BIGINT,
    FOREIGN KEY (phy_lib_book_id) REFERENCES phy_lib_books(phy_lib_book_id) ON DELETE CASCADE,

    issue_date DATE,
    return_date DATE,
    institute VARCHAR(100)
);

-- NEW DB 20 Feb 2025
CREATE TABLE time_table_draft (
    draft_id SERIAL PRIMARY KEY,
    info TEXT,
    date DATE,
    institute VARCHAR(100),

    UNIQUE (date, institute)
);

DELETE FROM time_table;

-- New Db 21 Feb 2025
DROP TABLE phy_lib_book_issue;

CREATE TABLE phy_lib_book_issue (
    phy_lib_book_issue_id SERIAL PRIMARY KEY,

    student_id BIGINT,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,

    employee_id BIGINT,
    FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,

    course_id BIGINT,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE SET NULL,

    phy_lib_book_id BIGINT,
    FOREIGN KEY (phy_lib_book_id) REFERENCES phy_lib_books(phy_lib_book_id) ON DELETE CASCADE,

    issue_date DATE,
    return_date DATE,
    institute VARCHAR(100)
);

CREATE TABLE generated_employee_each_day (
    id SERIAL PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE,
    count INTEGER
);

INSERT INTO generated_employee_each_day (count) VALUES(0);

ALTER TABLE planned_maintenance_system 
ADD CONSTRAINT unique_custom_item_institute UNIQUE (custom_item, institute);

-- NEW DB 25 Feb 2025

ALTER TABLE attendance DROP CONSTRAINT attendance_status_check;

ALTER TABLE attendance 
ADD CONSTRAINT attendance_status_check 
CHECK (status IN ('Present', 'Absent', 'Half Day', 'Sunday', 'Holiday', 'Leave'));

ALTER TABLE employee
DROP COLUMN authority;

ALTER TABLE employee
ADD authority VARCHAR(255);

DROP TABLE generated_employee_each_day;

CREATE TABLE generated_employee_each_day (
    id SERIAL PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE,
    count INTEGER,
    UNIQUE(date)
);


DROP TABLE appraisal_and_employee;
DROP TABLE appraisal;

CREATE TABLE appraisal (
    appraisal_id SERIAL PRIMARY KEY,

    employee_id INTEGER,
    FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE SET NULL,

    discipline TEXT,
    duties TEXT,
    targets TEXT,
    achievements TEXT,

    appraisal_options_hod TEXT,
    appraisal_options_employee TEXT,

    state_of_health TEXT,
    integrity TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appraisal_and_employee (
    item_id SERIAL PRIMARY KEY,

    appraisal_id INTEGER,
    FOREIGN KEY (appraisal_id) REFERENCES appraisal(appraisal_id) ON DELETE CASCADE,

    from_employee_id INTEGER,
    FOREIGN KEY (from_employee_id) REFERENCES employee(id) ON DELETE SET NULL,

    to_employee_id INTEGER,
    FOREIGN KEY (to_employee_id) REFERENCES employee(id) ON DELETE SET NULL,

    appraisal_status VARCHAR(255) CHECK (appraisal_status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
    appraisal_remark TEXT,

    UNIQUE(appraisal_id, from_employee_id, to_employee_id)
);

-- NEW DB 26 Feb 2025
ALTER TABLE appraisal_and_employee ADD COLUMN approve_date DATE;

DELETE FROM leave;

CREATE TABLE leave_and_employee (
    item_id SERIAL PRIMARY KEY,

    leave_id BIGINT,
    FOREIGN KEY (leave_id) REFERENCES leave(id) ON DELETE CASCADE,

    from_employee_id INTEGER,
    FOREIGN KEY (from_employee_id) REFERENCES employee(id) ON DELETE SET NULL,

    to_employee_id INTEGER,
    FOREIGN KEY (to_employee_id) REFERENCES employee(id) ON DELETE SET NULL,

    status leave_status_enum NOT NULL DEFAULT 'pending',

    action_date DATE,

    UNIQUE(leave_id, from_employee_id, to_employee_id)
);

ALTER TABLE leave ADD COLUMN created_at DATE DEFAULT CURRENT_DATE;

CREATE OR REPLACE FUNCTION get_financial_year_end()
RETURNS DATE AS $$
DECLARE
  current_year INT := EXTRACT(YEAR FROM CURRENT_DATE);
  financial_month INT := 3; -- March (end of financial year)
BEGIN
  IF EXTRACT(MONTH FROM CURRENT_DATE) >= 4 THEN
    RETURN TO_DATE((current_year + 1) || '-' || financial_month || '-31', 'YYYY-MM-DD');
  ELSE
    RETURN TO_DATE(current_year || '-' || financial_month || '-31', 'YYYY-MM-DD');
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- NEW DATABASE 28 Feb 2025

UPDATE employee SET employee_role = 'Super Admin', authority = 'SUPER ADMIN' WHERE name = 'Management';
INSERT INTO employee (name, joining_date, department_id, fin_number, indos_number, cdc_number, grade, qualification, additional_qualification, selling_experience, teaching_experience, contact_number, email_address, living_address, dob, gender, marital_status, bank_name, bank_account_no, account_holder_name, ifsc_code, profile_image, basic_salary, hra, other_allowances, provident_fund, professional_tax, esic, income_tax, is_active, login_email, login_password, max_teaching_hrs_per_week, institute, employee_role, employee_type, faculty_attendance_type, designation, gratuity, permanent_address, emergency_contact_number, contact_person_name, contact_person_relation, payscale_label, payscale_year, next_to_kin, relation_to_self, faculty_current_working_hours, authority) VALUES ('Management', '2025-02-28', '5', '0', '0', '0', NULL, NULL, NULL, NULL, NULL, '9382413005', 'testinggup@gmail.com', 'Sahapur, Asanpur, Purba Bardhaman', '2000-07-17', 'Male', 'Un-Married', 'SBI', '8.45785E+11', 'Somnath Gupta', '12345678945', 'https://wgli5hygbpaa0ifp.public.blob.vercel-storage.com/employee-profile/super_admin-BzvbRCgShn2AOfBmSZcODlwdF6hMSJ.jpg', '1400', '100', '0', '0', '0', '0', '0', 'TRUE', 'SEI28022501K', '$2b$10$p7qA5a.zRiJl5.kFmlnp3umyvC1QGiLeLLDDfqVsEZoOKAX0t3q3a', NULL, 'Kolkata', 'Super Admin', 'Office Staff', 'Regular', NULL, '0', 'Test Present Address', '8457845784', 'Testing Gupta', '', 'Payscale 2', '1925', '', '', '0', 'SUPER ADMIN');

-- NEW DATABASE 07 Mar 2025
ALTER TABLE courses
ADD COLUMN category VARCHAR(255) DEFAULT '';

DROP SEQUENCE IF EXISTS receipt_no_seq CASCADE;
ALTER TABLE payments DROP COLUMN IF EXISTS receipt_no;

CREATE SEQUENCE receipt_no_seq START 1;
ALTER TABLE payments ADD COLUMN receipt_no TEXT;

UPDATE payments SET receipt_no = 'KOL/2024/' || nextval('receipt_no_seq');

ALTER TABLE students DROP CONSTRAINT unique_email;
ALTER TABLE students ADD CONSTRAINT unique_mobile UNIQUE (mobile_number);

-- NEW TABLE 11 Mar 2025
CREATE TABLE notice (
    notice_id SERIAL PRIMARY KEY,
    heading VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at DATE DEFAULT CURRENT_DATE,
    visible BOOLEAN NOT NULL DEFAULT TRUE
)

-- NEW TABLE 12 Mar 2025

CREATE TABLE members (
    member_row_id SERIAL PRIMARY KEY,

    employee_id BIGINT NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,

    permissions TEXT NOT NULL,

    UNIQUE (employee_id)
)

INSERT INTO members (employee_id, permissions) VALUES (27, '{"1":true,"2":true,"3":true,"4":true,"5":true,"6":true,"7":true,"8":true,"9":true,"10":true,"1-1":true,"1-2":true,"1-3":true,"1-4":true,"1-5":true,"1-6":true,"1-7":true,"1-8":true,"1-9":true,"1-10":true,"7-1":true,"7-2":true,"7-3":true,"8-3":true,"3-1":true,"3-2":true,"9-1":true,"2-1":true,"2-2":true,"4-1":true,"4-2":true,"4-3":true,"4-4":true,"5-1":true,"5-2":true,"5-3":true,"5-4":true,"5-5":true,"5-6":true,"5-7":true,"5-8":true,"5-9":true,"5-11":true,"5-10":true,"10-1":true,"6-1":true}');

-- NEW TABLE 15 MAR 2023
CREATE TABLE blogs (
    blog_id SERIAL PRIMARY KEY,
    heading VARCHAR(255) NOT NULL,
    blog_content TEXT NOT NULL,
    thumbnail TEXT NOT NULL,

    meta_title VARCHAR(255) NOT NULL,
    meta_description TEXT NOT NULL,
    meta_keywords TEXT NOT NULL,
    meta_canonical_url VARCHAR(255) NOT NULL,

    created_at DATE DEFAULT CURRENT_DATE,

    visible BOOLEAN NOT NULL DEFAULT TRUE
);

DROP TABLE otps;

CREATE TABLE otps (
    mobile_number VARCHAR(15) NOT NULL,
    otp VARCHAR(5) NOT NULL,
    UNIQUE (mobile_number),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX mobile_number ON otps (mobile_number);


-- NEW TABLE 24 MAR 2024

DROP TABLE time_table_draft;

CREATE TABLE time_table_draft (
    draft_id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    institute VARCHAR(255),
    virtual_table TEXT NOT NULL,
    UNIQUE (date, institute)
)

DROP TABLE time_table;

CREATE TABLE time_table (
    date DATE,

    time_table_data TEXT,
    total_rows INTEGER NOT NULL,
    
    institute VARCHAR(100)
);


-- fro clering all table of db
-- DO $$ 
-- BEGIN
--     EXECUTE (
--         SELECT string_agg('DROP TABLE IF EXISTS "' || tablename || '" CASCADE;', ' ')
--         FROM pg_tables
--         WHERE schemaname = 'public'
--     );
-- END $$;