import Link from "next/link";
import { IoEyeOutline } from "react-icons/io5";

interface InfoProps {
  title: string;
  value: any;
  isLink?: boolean;
  viewLink?: string;
}

const Info = ({ title, value, isLink, viewLink }: InfoProps) => {
  return (
    <div className="space-y-1 mb-4 relative">
      <h3 className="text-black text-sm font-semibold">{title}</h3>
      {isLink ? (
        <a
          href={value?.startsWith("http") ? value : `mailto:${value}`}
          className="text-blue-600 hover:underline"
        >
          {value}
        </a>
      ) : (
        <p className="font-medium">{value}</p>
      )}

      {viewLink && (
        <Link href={viewLink} target="_blank" className="absolute top-0 right-0 cursor-pointer">
          <IoEyeOutline className="text-blue-600" />
        </Link>
      )}
    </div>
  );
};

export default Info;
