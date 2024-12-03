import JobForm from "@/components/JobForm";

interface IProps {
  params: {
    slug: string;
  };
}

export default function page({ params }: IProps) {
  return <JobForm action={params.slug} />;
}
