"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Form from "@/components/Form";
import { type FilePreview } from "@/components/Form";
import { uploadImage } from "@/services/post.api";
import { createProject, getProject, PROJECT_TAG, updateProject } from "@/services/Project.api";
import { revalidateProjects } from "@/services/server.action";
import { getUser, USER_TAG } from "@/services/user.api";
import { type Project, type ProjectRequest } from "@/types/PortfolioType";
import cookies from "@/utils/cookies";
import toast from "@/utils/Toast";

// 타입 정의
interface ProjectFormData extends Omit<Project, "images"> {
  images?: FilePreview[];
}

type ServerProjectData = Omit<ProjectRequest, "images"> & {
  images?: string[];
};

export default function ProjectForm({ id }: { id?: number }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const accessToken = cookies.get("accessToken");
  const [isUploading, setIsUploading] = useState(false);
  const [generateSummary, setGenerateSummary] = useState(true); // AI 요약 생성 여부 상태

  // 사용자 정보 조회
  const { data: user } = useQuery({
    queryKey: USER_TAG,
    queryFn: getUser,
    enabled: !!accessToken,
    retry: 0,
  });

  // 프로젝트 정보 조회 (수정 모드일 경우)
  const { data: project } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: PROJECT_TAG.DETAIL(id as number),
    queryFn: () => getProject(id as number),
    enabled: !!id,
    retry: 0,
  });

  // 이미지 업로드 처리 함수
  const uploadImages = async (previews: FilePreview[]): Promise<string[]> => {
    if (!previews || previews.length === 0) return [];

    try {
      // 이미 업로드된 이미지와 새 이미지 분리
      const alreadyUploadedUrls: string[] = [];
      const newFilesToUpload: FilePreview[] = [];

      previews.forEach((preview) => {
        if (preview.isUploaded && preview.previewUrl) {
          alreadyUploadedUrls.push(preview.previewUrl);
        } else {
          newFilesToUpload.push(preview);
        }
      });

      // 새 파일 업로드 처리
      let newUploadedUrls: string[] = [];
      if (newFilesToUpload.length > 0) {
        const uploadPromises = newFilesToUpload.map((preview) => uploadImage(preview.file));
        newUploadedUrls = await Promise.all(uploadPromises);

        // 메모리 정리
        newFilesToUpload.forEach((preview) => {
          URL.revokeObjectURL(preview.previewUrl);
        });
      }

      return [...alreadyUploadedUrls, ...newUploadedUrls];
    } catch (error) {
      throw new Error("이미지 업로드 중 오류가 발생했습니다.");
    }
  };

  // 프로젝트 생성 뮤테이션
  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: async () => {
      await revalidateProjects();
      queryClient.invalidateQueries({ queryKey: PROJECT_TAG.ALL() });
      router.push("/portfolio");
    },
  });

  // 프로젝트 수정 뮤테이션
  const updateProjectMutation = useMutation({
    mutationFn: async (data: { id: number; projectData: ProjectRequest; generateSummary: boolean }) =>
      updateProject({ id: data.id, projectData: data.projectData, generateSummary: data.generateSummary }),
    onSuccess: async () => {
      await revalidateProjects();
      queryClient.invalidateQueries({ queryKey: PROJECT_TAG.ALL() });
      router.push("/portfolio");
    },
  });

  // 폼 제출 핸들러
  const onSubmit = async (formData: ProjectFormData) => {
    if (createProjectMutation.isPending || updateProjectMutation.isPending || isUploading) {
      return;
    }

    // 서버로 전송할 데이터 준비
    const serverData: ServerProjectData = {
      ...formData,
      images: undefined,
    };

    // 이미지 처리 로직
    if (
      id &&
      project?.images &&
      (!formData.images || (Array.isArray(formData.images) && formData.images.length === 0))
    ) {
      // 수정 모드에서 이미지 변경이 없으면 기존 이미지 유지
      serverData.images = project.images;
    } else if (formData.images && formData.images.length > 0) {
      const newImages = formData.images.filter((img) => !img.isUploaded);

      if (newImages.length > 0) {
        // 새 이미지가 있으면 업로드 실행
        setIsUploading(true);
        toast.info(`${newImages.length}개 이미지 업로드 중...`);

        try {
          const imageUrls = await uploadImages(formData.images);
          serverData.images = imageUrls;
          setIsUploading(false);
        } catch (error) {
          setIsUploading(false);
          toast.error("이미지 업로드에 실패했습니다.");
          return;
        }
      } else {
        // 기존 이미지만 있는 경우
        const existingUrls = formData.images.filter((img) => img.isUploaded).map((img) => img.previewUrl);
        serverData.images = existingUrls;
      }
    } else {
      // 이미지가 없거나 모두 삭제된 경우
      serverData.images = [];
    }

    // 프로젝트 생성 또는 수정 요청 전송
    toast.promise(
      id
        ? updateProjectMutation.mutateAsync({
            id: Number(id),
            projectData: serverData as ProjectRequest,
            generateSummary,
          })
        : createProjectMutation.mutateAsync({
            projectData: serverData as ProjectRequest,
            userId: user?.id as string,
            generateSummary,
          }),
      {
        loading: "포트폴리오 작성 중...",
        success: "포트폴리오 작성 완료",
        error: "포트폴리오 작성 실패",
      }
    );
  };

  // 기존 데이터 있을 때 폼 초기값 설정
  const defaultValues = project
    ? {
        ...project,
        images: project.images
          ? project.images.map((url) => ({
              file: new File([], "placeholder", { type: "image/jpeg" }),
              previewUrl: url,
              isUploaded: true,
            }))
          : undefined,
      }
    : undefined;

  return (
    <Form onSubmit={onSubmit} defaultValues={defaultValues}>
      <div className="flex gap-4">
        <div className="flex grow flex-col gap-2">
          <label className="text-lg font-medium" htmlFor="title">
            프로젝트 이름
          </label>
          <div className="h-10">
            <Form.Input
              label="title"
              placeholder="프로젝트 이름을 입력해주세요."
              validation={{ required: "프로젝트 이름을 입력해주세요." }}
            />
          </div>
          <Form.Error name="title" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-lg font-medium" htmlFor="isPersonal">
            개인
          </label>
          <div className="h-10">
            <Form.Checkbox label="isPersonal" />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="relative flex flex-col gap-2">
            <label className="text-lg font-medium" htmlFor="startDate">
              프로젝트 시작일
            </label>
            <div className="h-10">
              <Form.Input
                type="date"
                label="startDate"
                validation={{
                  required: "프로젝트 시작일을 입력해주세요.",
                  validate: {
                    notFuture: (value: string) => {
                      const today = new Date().toISOString().split("T")[0];
                      return value <= today || "오늘 이후의 날짜를 입력할 수 없습니다.";
                    },
                  },
                }}
              />
            </div>
            <div className="absolute -bottom-8 left-0 text-nowrap">
              <Form.Error name="startDate" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-lg font-medium" htmlFor="endDate">
              프로젝트 종료일
            </label>
            <div className="h-10">
              <Form.Input type="date" label="endDate" />
            </div>
          </div>
        </div>
      </div>

      <div className="pb-4" />

      <div className="flex flex-col gap-2">
        <label className="text-lg font-medium" htmlFor="description">
          프로젝트 설명
        </label>
        <Form.Textarea
          label="description"
          placeholder="프로젝트 설명을 입력해주세요."
          rows={2}
          validation={{ required: "프로젝트 설명을 입력해주세요." }}
        />
        <Form.Error name="description" />
      </div>

      <div className="pt-4" />

      <div className="flex flex-col gap-2">
        <label className="text-lg font-medium" htmlFor="images">
          프로젝트 이미지
        </label>
        <Form.FileInput label="images" multiple={true} accept="image/*" />
        <p className="text-sm text-gray-500">
          * 프로젝트의 주요 이미지를 선택해주세요. 이미지는 포트폴리오 작성 시 함께 업로드됩니다. (최대 10개)
        </p>
      </div>

      <div className="pt-4" />

      <div className="flex flex-col gap-2">
        <label className="text-lg font-medium" htmlFor="content">
          프로젝트 내용
        </label>
        <div className="w-full">
          <Form.Textarea
            label="content"
            placeholder="프로젝트 내용을 입력해주세요. (Markdown 형식으로 작성해주세요.)"
            rows={16}
            validation={{
              required: "프로젝트 내용을 입력해주세요.",
              maxLength: { value: 5000, message: "최대 5000자까지 입력할 수 있습니다." },
            }}
          />
        </div>
        <Form.Error name="content" />

        {/* AI 요약 생성 옵션 */}
        <div className="mt-2 flex items-center gap-2">
          <label className="inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={generateSummary}
              onChange={() => setGenerateSummary(!generateSummary)}
            />
            <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none rtl:peer-checked:after:-translate-x-full" />
            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">AI 요약 생성</span>
          </label>
          <div className="text-xs text-gray-500">(내용 기반으로 자동 요약을 생성합니다)</div>
        </div>
      </div>

      <div className="pt-4" />

      <div className="flex flex-col gap-2">
        <label className="text-lg font-medium" htmlFor="techStack">
          기술 스택
        </label>
        <Form.TagInput label="techStack" style="outline" />
      </div>

      <div className="pt-4" />

      <div className="flex gap-5">
        <div className="flex grow flex-col gap-2">
          <label className="text-lg font-medium" htmlFor="githubLink">
            Github 링크
          </label>
          <div className="h-10">
            <Form.Input
              label="githubLink"
              placeholder="Github 링크를 입력해주세요."
              validation={{
                pattern: {
                  value: /^(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/[\w.-]+$/,
                  message: "올바른 깃허브 주소를 입력해주세요.",
                },
              }}
            />
          </div>
          <Form.Error name="githubLink" />
        </div>

        <div className="flex grow flex-col gap-2">
          <label className="text-lg font-medium" htmlFor="projectLink">
            프로젝트 링크
          </label>
          <div className="h-10">
            <Form.Input
              label="projectLink"
              placeholder="프로젝트 링크를 입력해주세요."
              validation={{
                pattern: {
                  value: /^(https?:\/\/)?(www\.)?[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(?::\d{1,5})?(?:\/[\w\.-]*)*\/?$/,
                  message: "올바른 주소를 입력해주세요.",
                },
              }}
            />
          </div>
          <Form.Error name="projectLink" />
        </div>
      </div>

      <div className="pt-4" />

      <div className="mx-96 flex items-center justify-end">
        <Form.Submit text={isUploading ? "이미지 업로드 중..." : "포트폴리오 작성하기"} disabled={isUploading} />
      </div>
    </Form>
  );
}
