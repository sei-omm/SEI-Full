export type DialogSliceType = {
  type: "OPEN" | "CLOSE";
  dialogKey: string;
  extraValue?: any;
};

export type TabMenuType = {
  text: string;
  slug: string;
  isSelected: boolean;
};

export type TCourseBatches = {
  batch_id: number;
  course_id: number;
  start_date: string;
  batch_fee: number;
  batch_total_seats: number;
  batch_reserved_seats: number;
  end_date: string;
  visibility: string;
};

export type CourseType = {
  course_id: number;
  course_code: string;
  course_name: string;
  institute: string;
  course_type: string;
  require_documents?: string;
  course_duration: string;
  course_fee: number;
  min_pay_percentage: number;
  total_seats: number;
  remain_seats: number;
  course_visibility: string;
  course_update_time: string;
  created_at: string;
  course_pdf?: string;
  enrolled_batch_date?: string;
  enrollment_status?: string;
  enrolled_batch_id: number;
  due_amount: number;
  batches: TCourseBatches[];
};

export type TMultipleCoursePrice = {
  course_id: number;
  course_name: string;
  total_price: number;
  minimum_to_pay: number;
};

export interface IResponse<D = null> {
  data: D;
  message: string;
  statusCode: number;
  success: false;
}

export interface IStudent {
  student_id: number;
  name: string;
  email: string;
  mobile_number: string;
  dob: string;
  profile_image: string;
  courses: CourseType[];
  indos_number: string | null;
}

export type TCourseCart = {
  course_id: number;
  batch_id: number;
  course_name: string;
  batch_start_date: string;
  batch_end_date: string;
  course_price: number;
  institute: string;
  isInWaitingList: boolean;
};

export type RazorpaySuccesshandlerTypes = {
  razorpay_signature: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
};

export type TLoginSuccess = {
  token: string;
  profile_image: string;
  enrolled_courses: {
    batch_id: number;
    course_id: number;
  }[];
};

export type OptionsType = { text: string; value: any };

export interface IDepartment {
  id: number;
  name: string;
}

export interface IJob {
  id: number;
  job_title: string;
  address: string;
  exprience: string;
  department: number;
  department_name: string;
  created_at: string;
  job_description: string;
}

export type TMyLibrarySearchParams = {
  tab?: string;
  course_id?: string;
  library_file_type?: string;
};