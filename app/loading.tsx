export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gm-bg">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gm-text-secondary text-sm">Loading your day...</p>
      </div>
    </div>
  );
}
