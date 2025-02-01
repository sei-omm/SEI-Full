import Image from "next/image";
import Link from "next/link";
import jwt from "jsonwebtoken";
import Pay from "@/app/components/Pay";
import { notFound } from "next/navigation";

interface IProps {
  params: {
    slug: string;
  };
}

type JwtVerifyReturnType<D, E> = {
  data: D | null;
  error: E | null;
};

type PaymentDetails = {
  course_ids: string; // Comma-separated string of course IDs
  total_price: string; // Total price as a string
  minimum_to_pay: number; // Minimum amount to pay as a number
  batch_ids: string; // Comma-separated string of batch IDs
  student_id: string; // Student ID as a string
  payment_type: string; // Payment mode as a string
  order_id: string;
};

const verifyToken = <D, E = jwt.VerifyErrors | null>(token: string) => {
  const jwtPassword = process.env.JWT_PASSWORD || "";

  return new Promise((resolve: (value: JwtVerifyReturnType<D, E>) => void) => {
    jwt.verify(token, jwtPassword, (err, decoded) => {
      if (err) return resolve({ error: err as E, data: null });
      return resolve({ error: null, data: decoded as D });
    });
  });
};

export default async function PaymentPage({ params }: IProps) {
  const { data, error } = await verifyToken<PaymentDetails>(params.slug);
  if (error) return notFound();

  const amount =
    data?.payment_type === "Part-Payment"
      ? data.minimum_to_pay
      : parseInt(data?.total_price || "0");

  return (
    <div className="w-full">
      <div className="w-full h-[60vh] relative overflow-hidden">
        <Image
          className="size-full object-cover"
          src={"/images/Banners/pay_page_banner.jpg"}
          alt="Courses Banner"
          height={1200}
          width={1200}
        />

        <div className="absolute inset-0 size-full bg-[#000000bb]">
          <div className="main-layout size-full flex-center flex-col">
            <h1 className="tracking-wider text-gray-100 text-4xl font-semibold uppercase">
              Payment Page
            </h1>
            <span className="text-background">
              <Link href={"/"}>Home</Link>
              <span> / </span>
              <Link href={"/our-centers"}>Centers</Link>
            </span>
          </div>
        </div>
      </div>
      <Pay
        amount={amount * 100}
        razorpay_key={process.env.RAZORPAY_KEY_ID || ""}
        order_id={data?.order_id || ""}
        token={params.slug}
      />
    </div>
  );
}
