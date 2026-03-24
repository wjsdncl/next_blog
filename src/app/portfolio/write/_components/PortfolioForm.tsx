"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import components from "@/components/content/MarkdownComponents";
import Form, { type FilePreview } from "@/components/ui/Form";
import { revalidatePortfolios } from "@/services/actions/revalidate.action";
import textSummarizer from "@/services/actions/summarize.action";
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

type FormValues = {
  title: string;
  startDate: string;
  endDate: string;
  techStack: string[];
  images: FilePreview[];
  excerpt: string;
  content: string;
};

export default function PortfolioForm({ slug, id }: { slug?: string; id?: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const statusRef = useRef<PublishStatus>("PUBLISHED");
  const [links, setLinks] = useState<Array<{ type: string; url: string }>>([]);
  const [isSummaryEnabled, setIsSummaryEnabled] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  const methods = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      title: "",
      startDate: "",
      endDate: "",
      techStack: [],
      images: [],
      excerpt: "",
      content: "",
    },
  });

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = methods;

  const title = watch("title");
  const content = watch("content");

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

  // 수정 모드: portfolio 데이터 로드 후 폼에 채우기
  useEffect(() => {
    if (!portfolio) return;
    const initialImages: FilePreview[] = portfolio.images?.length
      ? portfolio.images.map((img) => ({
          file: new File([], ""),
          previewUrl: img.url,
          isUploaded: true,
        }))
      : [];
    setValue("title", portfolio.title);
    setValue("excerpt", portfolio.excerpt || "");
    setValue("content", portfolio.content);
    setValue("startDate", portfolio.start_date || "");
    setValue("endDate", portfolio.end_date || "");
    setValue("techStack", portfolio.techStacks?.map((t) => t.name) || []);
    setValue("images", initialImages);
  }, [portfolio, setValue]);

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

  const onSubmit = async (formData: FormValues) => {
    if (createPortfolioMutation.isPending || updatePortfolioMutation.isPending) return;

    const tech_stack_ids = await resolveTechStackIds(formData.techStack);

    const portfolioData: PortfolioRequest = {
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt,
      start_date: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
      end_date: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      status: statusRef.current,
      tech_stack_ids,
      links: links.filter((l) => l.url.trim() !== ""),
    };

    if (categoryName.trim()) {
      portfolioData.category_id = await resolveCategoryId(categoryName.trim());
    }

    if (formData.images.length > 0) {
      const imageResults: Array<{ url: string; order: number }> = [];
      for (let i = 0; i < formData.images.length; i++) {
        const preview = formData.images[i];
        if (preview.isUploaded) {
          imageResults.push({ url: preview.previewUrl, order: i });
        } else {
          const url = await uploadImage(preview.file);
          imageResults.push({ url, order: i });
        }
      }
      portfolioData.images = imageResults;
    }

    if (statusRef.current === "PUBLISHED" && isSummaryEnabled) {
      const summary = await textSummarizer(formData.content);
      if (summary) {
        portfolioData.summary = summary;
      }
    }

    toast.promise(
      id
        ? updatePortfolioMutation.mutateAsync({ id, portfolioData })
        : createPortfolioMutation.mutateAsync(portfolioData),
      {
        loading: "포트폴리오 작성 중...",
        success: "포트폴리오 작성 완료",
        error: "포트폴리오 작성 실패",
      }
    );
  };

  const handleImageUpload = async (file: File, tempText: string) => {
    setValue("content", `${watch("content")}${tempText}`);
    try {
      const imageUrl = await uploadImage(file);
      setValue("content", `${watch("content").replace(tempText, `\n![image](${imageUrl})`)}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Image upload failed:", error);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file, "\n![Uploading image...]()");
    }
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          handleImageUpload(file, "\n![Uploading image...]()");
        }
        break;
      }
    }
  };

  // 수정 모드에서 setValue 후 textarea 높이 자동 조정
  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.style.height = "auto";
    editorRef.current.style.height = `${editorRef.current.scrollHeight}px`;
  }, [content]);

  // 우측 패널 wheel → 좌측 패널로 전달 (우측은 직접 스크롤 불가)
  useEffect(() => {
    const panel = rightPanelRef.current;
    if (!panel) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      if (leftPanelRef.current) leftPanelRef.current.scrollTop += e.deltaY;
    };
    panel.addEventListener("wheel", handler, { passive: false });
    return () => panel.removeEventListener("wheel", handler);
  }, []);

  // 좌측 패널 스크롤 → 우측 프리뷰 2단계 동기화
  // Phase 1: 폼 필드 구간 (content textarea 도달 전) → 우측 상단 고정
  // Phase 2: content textarea 구간 → 비율 계산 후 우측 동기화
  const handleLeftPanelScroll = useCallback(() => {
    if (!leftPanelRef.current || !rightPanelRef.current || !editorRef.current) return;
    const left = leftPanelRef.current;
    const right = rightPanelRef.current;
    const editor = editorRef.current;

    // editor가 좌측 패널 스크롤 좌표 기준으로 어디에 있는지 (고정값)
    const leftRect = left.getBoundingClientRect();
    const editorRect = editor.getBoundingClientRect();
    const editorScrollOffset = left.scrollTop + (editorRect.top - leftRect.top);

    if (left.scrollTop < editorScrollOffset) {
      // Phase 1: 아직 본문 영역 미도달 → 우측 최상단 고정
      right.scrollTop = 0;
      return;
    }

    // Phase 2: 본문 구간 진입 → 비율 동기화
    const extraScroll = left.scrollTop - editorScrollOffset;
    const leftMaxExtra = left.scrollHeight - left.clientHeight - editorScrollOffset;
    const rightMaxScroll = right.scrollHeight - right.clientHeight;

    if (leftMaxExtra <= 0 || rightMaxScroll <= 0) return;
    right.scrollTop = Math.min(1, extraScroll / leftMaxExtra) * rightMaxScroll;
  }, []);

  const initialLinks = portfolio?.links?.length
    ? portfolio.links.map((l) => ({ type: l.type, url: l.url }))
    : undefined;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit, (fieldErrors) => {
          const firstError = Object.values(fieldErrors)[0];
          if (firstError?.message) toast.error(firstError.message as string);
        })}
        className="flex h-dvh w-full flex-col"
      >
        <div className="flex min-h-0 flex-1">
          {/* 좌측 패널 */}
          <div className="flex max-w-[50%] basis-1/2 flex-col bg-background-primary">
            <div
              ref={leftPanelRef}
              onScroll={handleLeftPanelScroll}
              className="flex-1 overflow-y-auto scrollbar:w-1.5 scrollbar:rounded-full scrollbar:bg-transparent scrollbar-thumb:rounded-full scrollbar-thumb:bg-gray-600"
            >
              <div className="flex flex-col gap-5 p-[48px_40px_24px]">
                {/* 제목 */}
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: "프로젝트 이름을 입력해주세요." }}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      className={`min-h-[45px] w-full resize-none overflow-hidden text-4xl font-bold outline-none ${errors.title ? "placeholder:text-error" : ""}`}
                      placeholder="프로젝트 이름을 입력하세요 *"
                      rows={1}
                      onChange={(e) => {
                        field.onChange(e);
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                    />
                  )}
                />

                {/* 날짜 + 카테고리 — 한 행에 배치 */}
                <div className="grid grid-cols-3 items-start gap-4">
                  {/* 시작일 */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium" htmlFor="startDate">
                      시작일
                    </label>
                    <div className="h-10">
                      <Form.Input
                        type="date"
                        label="startDate"
                        validation={{
                          required: "시작일을 입력해주세요.",
                          validate: {
                            notFuture: (value: string) => {
                              const today = new Date().toISOString().split("T")[0];
                              return value <= today || "오늘 이후 날짜는 입력할 수 없습니다.";
                            },
                          },
                        }}
                      />
                    </div>
                    <Form.Error name="startDate" />
                  </div>

                  {/* 종료일 */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium" htmlFor="endDate">
                      종료일
                    </label>
                    <div className="h-10">
                      <Form.Input type="date" label="endDate" />
                    </div>
                  </div>

                  {/* 카테고리 */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium" htmlFor="portfolio-category">
                      카테고리
                    </label>
                    <div className="relative" ref={categoryRef}>
                      <input
                        id="portfolio-category"
                        className="h-10 w-full rounded-md border-2 border-background-tertiary bg-background-secondary px-3 text-sm text-text-primary outline-none placeholder:text-gray-450 focus:border-brand_dark-primary"
                        placeholder="카테고리 입력"
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
                              &quot;{categoryName.trim()}&quot; — 새로 생성됩니다
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {/* 프로젝트 설명 */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" htmlFor="excerpt">
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

                {/* 기술 스택 */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" htmlFor="techStack">
                    기술 스택
                  </label>
                  <Form.TagInput label="techStack" style="outline" suggestions={techStackSuggestions} />
                </div>

                {/* 이미지 — full width, 가로 스크롤 */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">이미지</span>
                  <Form.FileInput label="images" />
                </div>

                {/* 링크 */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">링크</span>
                  <PortfolioLinksEditor initialLinks={initialLinks} onChange={setLinks} />
                </div>

                <hr className="w-full rounded-full border-[3px] border-brand_dark-secondary" />

                {/* content */}
                <Controller
                  name="content"
                  control={control}
                  rules={{
                    required: "프로젝트 내용을 입력해주세요.",
                    maxLength: { value: 5000, message: "최대 5000자까지 입력할 수 있습니다." },
                  }}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      ref={editorRef}
                      value={content}
                      onDrop={handleDrop}
                      onPaste={handlePaste}
                      onChange={(e) => {
                        field.onChange(e);
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      className={`min-h-64 w-full resize-none text-lg outline-none ${errors.content ? "placeholder:text-error" : ""}`}
                      placeholder="프로젝트 내용을 입력해주세요. (Markdown 형식으로 작성해주세요.) *"
                    />
                  )}
                />
              </div>
            </div>

            {/* 하단 바 */}
            <div className="flex w-full items-center justify-between bg-gray-200 px-4 py-3">
              <button
                type="button"
                onClick={() => router.push("/portfolio")}
                className="w-max text-nowrap rounded-lg px-2 text-lg font-bold text-text-primary"
              >
                나가기
              </button>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-text-primary">AI 요약</span>
                  <button
                    type="button"
                    onClick={() => setIsSummaryEnabled((prev) => !prev)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isSummaryEnabled ? "bg-brand-primary" : "bg-gray-300"
                    }`}
                  >
                    <span className="sr-only">AI 요약 생성 토글</span>
                    <span
                      className={`inline-block size-[20px] rounded-full bg-white transition-transform ${
                        isSummaryEnabled ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
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
            </div>
          </div>

          {/* 우측 패널 - wheel 이벤트는 좌측으로 전달, scrollTop만 프로그래밍으로 제어 */}
          <div ref={rightPanelRef} className="max-w-[50%] basis-1/2 overflow-y-hidden bg-gray-100">
            <div className="flex flex-col gap-4 p-[64px_40px_40px]">
              <h1 className="min-h-[58px] text-5xl font-bold">{title}</h1>
              <div className="prose text-lg prose-headings:text-text-primary prose-strong:text-text-primary prose-ul:text-text-primary prose-li:p-0">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
