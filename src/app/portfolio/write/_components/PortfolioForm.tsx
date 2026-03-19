"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Form, { type FilePreview } from "@/components/ui/Form";
import { revalidatePortfolios } from "@/services/actions/revalidate.action";
import {
  createPortfolio,
  getPortfolio,
  getTechStackList,
  PORTFOLIO_KEYS,
  updatePortfolio,
  resolveTechStackIds,
} from "@/services/portfolio.api";
import { getCategoryList, resolveCategoryId, uploadImage } from "@/services/post.api";
import { type PublishStatus } from "@/types/blogType";
import { type PortfolioRequest } from "@/types/portfolioType";
import toast from "@/utils/toast";
import PortfolioLinksEditor from "./PortfolioLinksEditor";

export default function PortfolioForm({ slug, id }: { slug?: string; id?: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const statusRef = useRef<PublishStatus>("PUBLISHED");
  const [links, setLinks] = useState<Array<{ type: string; url: string }>>([]);
  const [categoryName, setCategoryName] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  const { data: techStackList } = useQuery({
    queryKey: ["tech-stacks"],
    queryFn: getTechStackList,
  });

  const { data: categoryList } = useQuery({
    queryKey: ["categories-list"],
    queryFn: getCategoryList,
  });

  const techStackSuggestions = techStackList?.map((t) => t.name) || [];

  const filteredCategories =
    categoryList?.filter((cat) => cat.name.toLowerCase().includes(categoryName.toLowerCase())) || [];

  const isNewCategory =
    categoryName.trim() !== "" && !categoryList?.some((cat) => cat.name.toLowerCase() === categoryName.toLowerCase());

  const { data: portfolio } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: PORTFOLIO_KEYS.detail(slug as string),
    queryFn: () => getPortfolio(slug as string),
    enabled: !!slug,
    retry: 0,
  });

  // 포트폴리오 로드 후 카테고리명 설정
  if (portfolio?.category?.name && !categoryName) {
    setCategoryName(portfolio.category.name);
  }

  // 카테고리 드롭다운 외부 클릭 닫기
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  const createPortfolioMutation = useMutation({
    mutationFn: createPortfolio,
    onSuccess: async () => {
      await revalidatePortfolios();
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.all() });
      router.push("/portfolio");
    },
  });

  const updatePortfolioMutation = useMutation({
    mutationFn: async (data: { id: string; portfolioData: PortfolioRequest }) =>
      updatePortfolio({ id: data.id, portfolioData: data.portfolioData }),
    onSuccess: async () => {
      await revalidatePortfolios();
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.all() });
      router.push("/portfolio");
    },
  });

  const onSubmit = async (formData: Record<string, string | string[] | FilePreview[]>) => {
    if (createPortfolioMutation.isPending || updatePortfolioMutation.isPending) {
      return;
    }

    const techStackNames = Array.isArray(formData.techStack) ? (formData.techStack as string[]) : [];
    const tech_stack_ids = await resolveTechStackIds(techStackNames);

    const portfolioData: PortfolioRequest = {
      title: formData.title as string,
      content: formData.content as string,
      excerpt: formData.excerpt as string,
      start_date: formData.startDate ? new Date(formData.startDate as string).toISOString() : undefined,
      end_date: formData.endDate ? new Date(formData.endDate as string).toISOString() : undefined,
      status: statusRef.current,
      tech_stack_ids,
      links: links.filter((l) => l.url.trim() !== ""),
    };

    if (categoryName.trim()) {
      portfolioData.category_id = await resolveCategoryId(categoryName.trim());
    }

    // 이미지 처리
    const filePreviews = (formData.images as FilePreview[]) || [];
    if (filePreviews.length > 0) {
      const imageResults: Array<{ url: string; order: number }> = [];
      for (let i = 0; i < filePreviews.length; i++) {
        const preview = filePreviews[i];
        if (preview.isUploaded) {
          imageResults.push({ url: preview.previewUrl, order: i });
        } else {
          const url = await uploadImage(preview.file);
          imageResults.push({ url, order: i });
        }
      }
      portfolioData.images = imageResults;
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

  const initialLinks = portfolio?.links?.length
    ? portfolio.links.map((l) => ({ type: l.type, url: l.url }))
    : undefined;

  const initialImages: FilePreview[] | undefined = portfolio?.images?.length
    ? portfolio.images.map((img) => ({
        file: new File([], ""),
        previewUrl: img.url,
        isUploaded: true,
      }))
    : undefined;

  const defaultValues = portfolio
    ? {
        title: portfolio.title,
        excerpt: portfolio.excerpt || "",
        content: portfolio.content,
        startDate: portfolio.start_date || "",
        endDate: portfolio.end_date || "",
        techStack: portfolio.techStacks?.map((tech) => tech.name) || [],
        images: initialImages || [],
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
        <label className="text-lg font-medium" htmlFor="portfolio-category">
          카테고리
        </label>
        <div className="relative" ref={categoryRef}>
          <input
            id="portfolio-category"
            className="h-10 w-full rounded-md border-2 border-background-tertiary bg-background-secondary px-3 text-sm text-text-primary outline-none placeholder:text-gray-450 focus:border-brand_dark-primary"
            placeholder="카테고리를 선택하거나 입력하세요"
            value={categoryName}
            onChange={(e) => {
              setCategoryName(e.target.value);
              setIsCategoryOpen(true);
            }}
            onFocus={() => setIsCategoryOpen(true)}
            autoComplete="off"
          />
          {isCategoryOpen && (filteredCategories.length > 0 || isNewCategory) && (
            <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border-2 border-background-tertiary bg-background-secondary shadow-lg">
              {filteredCategories.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-gray-200"
                    onClick={() => {
                      setCategoryName(cat.name);
                      setIsCategoryOpen(false);
                    }}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
              {isNewCategory && (
                <li className="px-3 py-2 text-sm text-brand-tertiary">
                  &quot;{categoryName.trim()}&quot; — 새 카테고리로 생성됩니다
                </li>
              )}
            </ul>
          )}
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
        <span className="text-lg font-medium">이미지</span>
        <Form.FileInput label="images" />
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
        <Form.TagInput label="techStack" style="outline" suggestions={techStackSuggestions} />
      </div>

      <div className="pt-4" />

      <div className="flex flex-col gap-2">
        <span className="text-lg font-medium">링크</span>
        <PortfolioLinksEditor initialLinks={initialLinks} onChange={setLinks} />
      </div>

      <div className="pt-4" />

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          className="rounded-md bg-gray-600 px-3 py-2 text-lg font-semibold text-white hover:bg-gray-700 active:bg-gray-800"
          onClick={() => {
            statusRef.current = "DRAFT";
          }}
        >
          임시저장
        </button>
        <button
          type="submit"
          className="rounded-md bg-brand_dark-primary px-3 py-2 text-lg font-semibold text-white hover:bg-brand_dark-secondary active:bg-brand_dark-tertiary"
          onClick={() => {
            statusRef.current = "PUBLISHED";
          }}
        >
          발행하기
        </button>
      </div>
    </Form>
  );
}
