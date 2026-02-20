"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Form from "@/components/Form";
import { uploadImage } from "@/services/post.api";
import { createPortfolio, getPortfolio, PORTFOLIO_KEYS, updatePortfolio } from "@/services/portfolio.api";
import { revalidatePortfolios } from "@/services/server.action";
import { getUser, USER_KEYS } from "@/services/user.api";
import { type PortfolioRequest } from "@/types/portfolioType";
import cookies from "@/utils/cookies";
import toast from "@/utils/Toast";

export default function ProjectForm({ id }: { id?: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const accessToken = cookies.get("accessToken");

  // 사용자 정보 조회
  const { data: user } = useQuery({
    queryKey: [...USER_KEYS],
    queryFn: getUser,
    enabled: !!accessToken,
    retry: 0,
  });

  // 포트폴리오 정보 조회 (수정 모드일 경우)
  const { data: portfolio } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: PORTFOLIO_KEYS.detail(id as string),
    queryFn: () => getPortfolio(id as string),
    enabled: !!id,
    retry: 0,
  });

  // 포트폴리오 생성 뮤테이션
  const createPortfolioMutation = useMutation({
    mutationFn: createPortfolio,
    onSuccess: async () => {
      await revalidatePortfolios();
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.all() });
      router.push("/portfolio");
    },
  });

  // 포트폴리오 수정 뮤테이션
  const updatePortfolioMutation = useMutation({
    mutationFn: async (data: { id: string; portfolioData: PortfolioRequest }) =>
      updatePortfolio({ id: data.id, portfolioData: data.portfolioData }),
    onSuccess: async () => {
      await revalidatePortfolios();
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.all() });
      router.push("/portfolio");
    },
  });

  // 폼 제출 핸들러
  const onSubmit = async (formData: Record<string, string | string[]>) => {
    if (createPortfolioMutation.isPending || updatePortfolioMutation.isPending) {
      return;
    }

    const portfolioData: PortfolioRequest = {
      title: formData.title as string,
      content: formData.content as string,
      excerpt: formData.excerpt as string,
      start_date: formData.startDate as string,
      end_date: (formData.endDate as string) || undefined,
      techStacks: Array.isArray(formData.techStack) ? formData.techStack : [],
      links: [],
    };

    // GitHub/프로젝트 링크 처리
    if (formData.githubLink) {
      portfolioData.links = portfolioData.links || [];
      portfolioData.links.push({ type: "github", url: formData.githubLink as string });
    }
    if (formData.projectLink) {
      portfolioData.links = portfolioData.links || [];
      portfolioData.links.push({ type: "live", url: formData.projectLink as string });
    }

    // 커버 이미지 처리
    if (formData.coverImageFile) {
      try {
        const imageUrl = await uploadImage(formData.coverImageFile as unknown as File);
        portfolioData.cover_image = imageUrl;
      } catch (error) {
        toast.error("이미지 업로드에 실패했습니다.");
        return;
      }
    }

    toast.promise(
      id
        ? updatePortfolioMutation.mutateAsync({
            id,
            portfolioData,
          })
        : createPortfolioMutation.mutateAsync(portfolioData),
      {
        loading: "포트폴리오 작성 중...",
        success: "포트폴리오 작성 완료",
        error: "포트폴리오 작성 실패",
      }
    );
  };

  // 기존 데이터 있을 때 폼 초기값 설정
  const defaultValues = portfolio
    ? {
        title: portfolio.title,
        excerpt: portfolio.excerpt || "",
        content: portfolio.content,
        startDate: portfolio.start_date || "",
        endDate: portfolio.end_date || "",
        techStack: portfolio.techStacks?.map((tech) => tech.name) || [],
        githubLink: portfolio.links?.find((l) => l.type === "github")?.url || "",
        projectLink: portfolio.links?.find((l) => l.type === "live")?.url || "",
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
        <label className="text-lg font-medium" htmlFor="excerpt">
          프로젝트 설명
        </label>
        <Form.Textarea
          label="excerpt"
          placeholder="프로젝트 설명을 입력해주세요."
          rows={2}
          validation={{ required: "프로젝트 설명을 입력해주세요." }}
        />
        <Form.Error name="excerpt" />
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
        <Form.Submit text="포트폴리오 작성하기" />
      </div>
    </Form>
  );
}
