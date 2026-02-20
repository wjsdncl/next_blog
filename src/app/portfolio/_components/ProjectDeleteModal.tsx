import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePortfolio, PORTFOLIO_KEYS } from "@/services/portfolio.api";
import { revalidatePortfolios } from "@/services/server.action";
import toast from "@/utils/Toast";

export default function DeleteConfirmationModal({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const queryClient = useQueryClient();

  const { mutateAsync: deletePortfolioMutation } = useMutation({
    mutationFn: deletePortfolio,
    onSuccess: async () => {
      toast.success("포트폴리오가 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.all() });
      await revalidatePortfolios();
    },
    onError: () => {
      toast.error("포트폴리오 삭제에 실패하였습니다.");
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="pb-8 pt-6 text-center text-2xl font-semibold">정말로 삭제하시겠습니까?</p>
      <div className="flex gap-4">
        <button
          onClick={() => deletePortfolioMutation(projectId).then(onClose)}
          className="grow rounded bg-brand-primary px-4 py-2 text-text-primary hover:bg-brand-secondary dark:hover:bg-brand_dark-secondary"
        >
          삭제
        </button>
        <button onClick={onClose} className="grow rounded bg-gray-300 px-4 py-2 text-text-primary hover:bg-gray-400">
          취소
        </button>
      </div>
    </div>
  );
}
