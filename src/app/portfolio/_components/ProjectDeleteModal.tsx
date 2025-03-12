import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProject, PROJECT_TAG } from "@/services/Project.api";
import toast from "@/utils/Toast";

const DeleteConfirmationModal = ({ projectId, onClose }: { projectId: number; onClose: () => void }) => {
  const queryClient = useQueryClient();

  const { mutateAsync: deleteProjectMutation } = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      toast.success("프로젝트가 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: PROJECT_TAG.ALL() });
    },
    onError: () => {
      toast.error("프로젝트 삭제에 실패하였습니다.");
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="pb-8 pt-6 text-center text-2xl font-semibold">정말로 삭제하시겠습니까?</p>
      <div className="flex gap-4">
        <button
          onClick={() => deleteProjectMutation(projectId).then(onClose)}
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
};

export default DeleteConfirmationModal;
