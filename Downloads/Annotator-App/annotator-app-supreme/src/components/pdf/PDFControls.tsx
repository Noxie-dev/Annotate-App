import { useDocumentStore } from '@/stores/document-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Grid3X3
} from 'lucide-react';

export function PDFControls() {
  const {
    currentPage,
    totalPages,
    setCurrentPage
  } = useDocumentStore();

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPrevPage = () => setCurrentPage(Math.max(1, currentPage - 1));
  const goToNextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1));

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
      <div className="bg-[#1a1f2e] rounded-lg border border-gray-700 p-2 flex items-center space-x-2 shadow-lg">
        {/* First Page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={goToFirstPage}
          disabled={currentPage <= 1}
          className="text-gray-400 hover:text-gray-200"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrevPage}
          disabled={currentPage <= 1}
          className="text-gray-400 hover:text-gray-200"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Page Input */}
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={handlePageInput}
            className="w-16 h-8 text-center bg-[#0f1419] border-gray-600 text-gray-200"
          />
          <span className="text-sm text-gray-400">of {totalPages}</span>
        </div>

        {/* Next Page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNextPage}
          disabled={currentPage >= totalPages}
          className="text-gray-400 hover:text-gray-200"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Last Page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={goToLastPage}
          disabled={currentPage >= totalPages}
          className="text-gray-400 hover:text-gray-200"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>

        <div className="h-4 w-px bg-gray-700" />

        {/* Thumbnail View */}
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-gray-200"
        >
          <Grid3X3 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
