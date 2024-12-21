import Contacts from "@/components/Contacts";

interface IProps {
  searchParams: {
    type?: string;
  };
}

export default function page({searchParams} : IProps) {
  return <Contacts searchParams={searchParams}/>;
}
