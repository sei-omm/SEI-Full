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
    job_title VARCHAR(255),
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
    current_purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

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
    FOREIGN KEY (item_id) REFERENCES inventory_item_info(item_id) ON DELETE SET NULL,

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

CREATE TABLE notification (
    notification_id SERIAL PRIMARY KEY,
    notification_title VARCHAR(255),
    notification_description TEXT,
    from_id INTEGER,
    from_role VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification_to (
    notification_id INTEGER,
    FOREIGN KEY (notification_id) REFERENCES notification(notification_id) ON DELETE CASCADE,

    to_id INTEGER,
    to_role VARCHAR(255)
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