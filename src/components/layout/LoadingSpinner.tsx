const LoadingSpinner = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#13B67F]"></div>
    </div>
  );
};

export default LoadingSpinner;