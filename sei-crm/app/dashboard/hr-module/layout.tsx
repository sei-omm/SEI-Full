interface IProps {
  children: React.ReactNode;
}

export default function layout({ children }: IProps) {
  return (
    <main className="p-8">
      {/* <BreadCrumb /> */}
      {children}
    </main>
  );
}
