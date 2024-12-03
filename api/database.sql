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
    resume VARCHAR(2083),
    pan_card VARCHAR(2083),
    aadhaar_card VARCHAR(2083),
    ten_pass_certificate VARCHAR(2083),
    twelve_pass_certificate VARCHAR(2083),
    graduation_certificate VARCHAR(2083),
    other_certificate TEXT,
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
  status VARCHAR(20) CHECK (status IN ('Present', 'Absent', 'Leave')), -- Tracks the attendance status
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
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE

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