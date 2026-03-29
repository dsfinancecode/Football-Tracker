export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin shadow-sm">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}