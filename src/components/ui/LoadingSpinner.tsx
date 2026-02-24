export default function LoadingSpinner({ className = 'border-blue-600' }: { className?: string }) {
  return (
    <div className={`w-8 h-8 border-4 ${className} border-t-transparent rounded-full animate-spin`} />
  );
}
