"use client";

import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useEffect, useState, useMemo } from "react";
import { revalidatePortfolios } from "@/services/actions/revalidate.action";
import { getPortfolioList, PORTFOLIO_KEYS, reorderPortfolios } from "@/services/portfolio.api";
import type { PortfolioListItem } from "@/types/portfolioType";
import { formatDate } from "@/utils/formatDate";
import toast from "@/utils/toast";
import PortfolioCard from "./PortfolioCard";
import SortablePortfolioItem from "./SortablePortfolioItem";

interface CategoryGroup {
  name: string;
  portfolios: PortfolioListItem[];
}

function groupByCategory(portfolios: PortfolioListItem[]): { groups: CategoryGroup[]; ungrouped: PortfolioListItem[] } {
  const categoryMap = new Map<string, PortfolioListItem[]>();
  const noCategory: PortfolioListItem[] = [];

  for (const p of portfolios) {
    const catName = p.category?.name;
    if (!catName) {
      noCategory.push(p);
      continue;
    }
    const list = categoryMap.get(catName) || [];
    list.push(p);
    categoryMap.set(catName, list);
  }

  const groups: CategoryGroup[] = [];
  const ungrouped: PortfolioListItem[] = [...noCategory];

  for (const [name, items] of categoryMap) {
    if (items.length >= 1) {
      groups.push({ name, portfolios: items });
    } else {
      ungrouped.push(...items);
    }
  }

  return { groups, ungrouped };
}

function buildDate(p: PortfolioListItem) {
  return `${p.start_date ? formatDate(p.start_date) : ""} ~ ${p.end_date ? formatDate(p.end_date) : "진행중"}`;
}

const SkeletonItem = () => (
  <div className="flex flex-col overflow-hidden rounded-xl bg-gray-100 shadow-sm">
    <div className="h-44 w-full animate-pulse bg-gray-200 desktop:h-48" />
    <div className="flex flex-col gap-3 p-5">
      <div className="flex animate-pulse items-center gap-2">
        <div className="h-5 w-12 rounded-full bg-gray-200" />
        <div className="h-5 w-40 rounded-md bg-gray-200" />
      </div>
      <div className="h-8 w-2/3 animate-pulse rounded-md bg-gray-200" />
      <div className="animate-pulse space-y-2">
        <div className="h-4 w-full rounded-md bg-gray-200" />
        <div className="h-4 w-5/6 rounded-md bg-gray-200" />
      </div>
      <div className="flex animate-pulse gap-2">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="h-6 w-16 rounded-full bg-gray-200" />
        ))}
      </div>
      <div className="flex animate-pulse justify-end pt-1">
        <div className="h-9 w-28 rounded-lg bg-gray-200" />
      </div>
    </div>
  </div>
);

export default function PortfolioList({ isOwner }: { isOwner: boolean }) {
  const loadMoreRef = useRef(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editOrder, setEditOrder] = useState<PortfolioListItem[]>([]);
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: PORTFOLIO_KEYS.all(),
    queryFn: ({ pageParam = 1 }) => getPortfolioList({ page: pageParam }),
    getNextPageParam: (lastPage) => (!lastPage.isLast ? lastPage.nextPage : undefined),
    initialPageParam: 1,
  });

  const allPortfolios = useMemo(() => data?.pages.flatMap((page) => page.portfolios) ?? [], [data]);

  const { groups, ungrouped } = useMemo(() => groupByCategory(allPortfolios), [allPortfolios]);

  const reorderMutation = useMutation({
    mutationFn: reorderPortfolios,
    onSuccess: async () => {
      toast.success("순서가 변경되었습니다.");
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEYS.all() });
      await revalidatePortfolios();
      setIsEditMode(false);
    },
    onError: () => {
      toast.error("순서 변경에 실패했습니다.");
    },
  });

  const handleEditModeEnter = () => {
    setEditOrder([...allPortfolios]);
    setIsEditMode(true);
  };

  const handleEditModeCancel = () => {
    setIsEditMode(false);
    setEditOrder([]);
  };

  const handleSave = () => {
    const items = editOrder.map((p, index) => ({ id: p.id, order: index }));
    reorderMutation.mutate(items);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setEditOrder((prev) => {
      const oldIndex = prev.findIndex((p) => p.id === active.id);
      const newIndex = prev.findIndex((p) => p.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isEditMode) {
    return (
      <div className="mx-auto w-full px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">순서 편집</h2>
          <div className="flex gap-2">
            <button
              onClick={handleEditModeCancel}
              disabled={reorderMutation.isPending}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-200 disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={reorderMutation.isPending}
              className="w-16 rounded-lg bg-brand-primary py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-brand_dark-secondary disabled:opacity-50"
            >
              {reorderMutation.isPending ? "저장 중" : "저장"}
            </button>
          </div>
        </div>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={editOrder.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className="grid gap-2 desktop:grid-cols-2">
              {editOrder.map((portfolio) => (
                <SortablePortfolioItem
                  key={portfolio.id}
                  id={portfolio.id}
                  title={portfolio.title}
                  date={buildDate(portfolio)}
                  category={portfolio.category?.name}
                  techStacks={portfolio.techStacks.map((t) => t.name)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    );
  }

  return (
    <>
      {isOwner && allPortfolios.length > 1 && (
        <div className="mx-auto mb-4 flex w-full justify-end px-6">
          <button
            onClick={handleEditModeEnter}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-200"
          >
            순서 편집
          </button>
        </div>
      )}

      <div className="mx-auto w-full px-6">
        {data ? (
          <>
            {groups.map((group) => (
              <section key={group.name} className="mb-8">
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="shrink-0 text-sm font-semibold uppercase tracking-wider text-gray-500">
                    {group.name}
                  </h2>
                  <div className="h-px flex-1 bg-gray-300" />
                  <span className="shrink-0 text-xs text-gray-500">{group.portfolios.length}개 프로젝트</span>
                </div>
                <div className="grid gap-5 desktop:grid-cols-2">
                  {group.portfolios.map((portfolio) => (
                    <PortfolioCard
                      key={portfolio.id}
                      id={portfolio.id}
                      slug={portfolio.slug}
                      title={portfolio.title}
                      date={buildDate(portfolio)}
                      excerpt={portfolio.excerpt || ""}
                      summary={portfolio.summary}
                      techStacks={portfolio.techStacks.map((tech) => tech.name)}
                      category={portfolio.category?.name}
                      images={portfolio.images}
                      links={portfolio.links}
                      status={portfolio.status}
                      isOwner={isOwner}
                    />
                  ))}
                </div>
              </section>
            ))}

            {ungrouped.length > 0 && (
              <section className={groups.length > 0 ? "mt-8" : ""}>
                {groups.length > 0 && (
                  <div className="mb-4 flex items-center gap-3">
                    <h2 className="shrink-0 text-sm font-semibold uppercase tracking-wider text-gray-500">기타</h2>
                    <div className="h-px flex-1 bg-gray-300" />
                    <span className="shrink-0 text-xs text-gray-500">{ungrouped.length}개 프로젝트</span>
                  </div>
                )}
                <div className="grid gap-5 desktop:grid-cols-2">
                  {ungrouped.map((portfolio) => (
                    <PortfolioCard
                      key={portfolio.id}
                      id={portfolio.id}
                      slug={portfolio.slug}
                      title={portfolio.title}
                      date={buildDate(portfolio)}
                      excerpt={portfolio.excerpt || ""}
                      summary={portfolio.summary}
                      techStacks={portfolio.techStacks.map((tech) => tech.name)}
                      category={portfolio.category?.name}
                      images={portfolio.images}
                      links={portfolio.links}
                      status={portfolio.status}
                      isOwner={isOwner}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="grid gap-5 desktop:grid-cols-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonItem key={`skeleton-${index}`} />
            ))}
          </div>
        )}
      </div>

      <div ref={loadMoreRef} className="flex justify-center py-6">
        {isFetchingNextPage && (
          <div className="grid w-full gap-5 px-6 desktop:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <SkeletonItem key={`skeleton-loading-${index}`} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
