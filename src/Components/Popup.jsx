import Close from '../assets/Cross(Light).svg';

export default function Popup({ 
  setOpen, 
  message = "Are you sure you want to Archive this Account?", 
  confirmText = "Confirm", 
  buttonColor = "#00A15D", 
  hoverColor = "#00874E" 
}) {
  return (
    <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black/40 z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-4 sm:p-5 md:p-6 relative flex flex-col items-center text-center">

        {/* Close Button */}
        <button 
          onClick={() => setOpen(false)} 
          className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-5 md:right-5 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <img 
            src={Close} 
            alt="Close Pop up" 
            className="cursor-pointer h-5 w-5 sm:h-6 sm:w-6" 
          />
        </button>

        {/* Dynamic Message */}
        <div className="text-[#465746] mb-4 sm:mb-5 md:mb-6 mt-6 sm:mt-7 md:mt-8 text-sm sm:text-base md:text-lg leading-relaxed px-2">
          {message}
        </div>

        {/* Confirm Button */}
        <button 
          className="text-white font-bold px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-md w-full sm:w-auto min-w-[100px] sm:min-w-[120px] h-10 sm:h-12 text-sm sm:text-base transition-colors duration-200 cursor-pointer"
          style={{ backgroundColor: buttonColor }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = hoverColor}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = buttonColor}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
}