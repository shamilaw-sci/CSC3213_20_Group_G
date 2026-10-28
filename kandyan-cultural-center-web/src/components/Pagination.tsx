'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPagination = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4">
      {/* Desktop Left side text */}
      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:block">
        Page {currentPage} of {totalPages}
      </span>
      
      {/* Controls */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
        >
          Prev
        </button>
        
        {/* Desktop Page Numbers */}
        <div className="hidden sm:flex items-center gap-1.5">
          {getPagination().map((page, idx) => (
            page === '...' ? (
              <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-400 font-bold text-sm">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer shadow-sm text-sm ${
                  currentPage === page
                    ? 'border-amber-400 text-white font-black bg-amber-500 shadow-[0_4px_10px_rgba(217,119,6,0.3)]'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 font-bold'
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Mobile Page Numbers */}
        <span className="sm:hidden text-slate-500 font-bold text-sm bg-white/50 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
        >
          Next
        </button>
      </div>
    </div>
  );
}