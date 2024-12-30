"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/shallow";
import Form from "@/components/Form";
import { createProject, getProject, updateProject } from "@/services/Project.api";
import { getUser } from "@/services/user.api";
import useUserStore from "@/stores/UserStore";
import { type User } from "@/types/AuthType";
import { type Project, type ProjectRequest } from "@/types/PortfolioType";
import toast from "@/utils/Toast";

export default function ProjectForm({ id }: { id?: number }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isLoggedIn } = useUserStore(useShallow((state) => ({ isLoggedIn: state.isLoggedIn })));

  // 사용자 정보 조회
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    enabled: isLoggedIn,
    retry: 0,
    initialData: () => queryClient.getQueryData<User>(["user"]),
  });

  const { data: project } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProject(id as number),
    enabled: !!id,
    retry: 0,
    initialData: () => queryClient.getQueryData<Project>(["project", id]),
  });

  // 프로젝트 생성 뮤테이션
  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectList"] });
      router.push("/portfolio");
    },
  });

  // 프로젝트 수정 뮤테이션
  const updateProjectMutation = useMutation({
    mutationFn: async (data: { id: number; projectData: ProjectRequest }) =>
      updateProject({ id: data.id, projectData: data.projectData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectList"] });
      router.push("/portfolio");
    },
  });

  // 폼 제출 핸들러
  const onSubmit = (data: Project) => {
    if (createProjectMutation.isPending || updateProjectMutation.isPending) return;

    toast.promise(
      id
        ? updateProjectMutation.mutateAsync({ id: Number(id), projectData: data })
        : createProjectMutation.mutateAsync({
            projectData: data,
            userId: user?.id as string,
          }),
      {
        loading: "포트폴리오 작성 중...",
        success: "포트폴리오 작성 완료",
        error: "포트폴리오 작성 실패",
      }
    );
  };

  const defaultValues = project;

  return (
    <Form onSubmit={onSubmit} defaultValues={defaultValues}>
      {/* 프로젝트 기본 정보 */}
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

      {/* 프로젝트 설명 */}
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

      {/* 프로젝트 내용 */}
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
      </div>

      <div className="pt-4" />

      {/* 기술 스택 */}
      <div className="flex flex-col gap-2">
        <label className="text-lg font-medium" htmlFor="techStack">
          기술 스택
        </label>
        <Form.TagInput label="techStack" style="outline" />
      </div>

      <div className="pt-4" />

      {/* 프로젝트 링크 */}
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

      {/* 제출 버튼 */}
      <div className="mx-96 flex items-center justify-end">
        <Form.Submit text="포트폴리오 작성하기" />
      </div>
    </Form>
  );
}
