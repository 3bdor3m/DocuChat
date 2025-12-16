const Loading = () => {
  return (
    <div className="w-full min-h-screen bg-black text-white flex items-center justify-center overflow-hidden relative">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#2873ec]/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1a5bb8]/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-[#2873ec]/10 rounded-full blur-[100px] animate-blob animation-delay-4000" />
      </div>

      {/* Simple Circle Loader */}
      <div className="relative z-10">
        <div className="w-16 h-16 rounded-full border-4 border-[#2873ec]/20 border-t-[#2873ec] animate-spin"></div>
      </div>
    </div>
  );
};

export default Loading;
