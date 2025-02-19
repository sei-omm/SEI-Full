export default function Loading() {
  return (
    <div className="text-center min-h-screen flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-yellow-500 mx-auto"></div>
      <p className="text-zinc-600 dark:text-zinc-400">
        Loading...
      </p>
    </div>
  );
}
