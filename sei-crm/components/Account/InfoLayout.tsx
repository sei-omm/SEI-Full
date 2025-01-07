export const InfoLayout = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={`w-[60%] border card-shdow rounded-3xl p-10 relative ${className}`}>
      {children}
    </div>
  );
};
