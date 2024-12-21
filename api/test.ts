const sqlForAdmissionReport = `
SELECT 
    row_number() OVER () AS sr_no,
    EC.created_at,
    C.course_name,
    CB.batch_fee AS course_batch_fee,
    (CB.batch_fee - SUM(PAY.paid_amount)) AS due_amount_for_course,
    -- C.course_fee,
    -- (C.course_fee - SUM(PAY.paid_amount)) AS due_amount_for_course,
    STU.name,
    STU.profile_image,
    C.course_type,
    STU.email,
    STU.mobile_number,
    SUM(PAY.paid_amount) AS paid_amount_for_course, -- it for total paid for course
    SUM(PAY.misc_payment) AS total_misc_amount,
    (SUM(PAY.paid_amount) + SUM(PAY.misc_payment)) AS total_paid
FROM enrolled_batches_courses AS EC
LEFT JOIN students AS STU
    ON EC.student_id = STU.student_id
LEFT JOIN courses AS C
    ON EC.course_id = C.course_id
LEFT JOIN payments AS PAY
    ON EC.course_id = PAY.course_id AND EC.student_id = PAY.student_id
LEFT JOIN course_batches AS CB
    ON CB.batch_id = EC.batch_id
WHERE C.institute = $1 AND DATE(EC.created_at) BETWEEN $2 AND $3
GROUP BY 
    EC.created_at,
    C.course_name,
    CB.batch_fee,
    -- C.course_fee,
    C.course_type,
    STU.student_id, 
    STU.name,
    STU.profile_image,
    STU.email,
    STU.mobile_number
`;