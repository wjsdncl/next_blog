/* eslint-disable no-console */
import instance from "./instance";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export const getTagList = async (): Promise<Tag[]> => {
  try {
    const res = await instance.GET<{ success: boolean; data: Tag[] }>("/tags");
    return res.data;
  } catch (error) {
    console.error("태그 목록 조회 실패:", error);
    return [];
  }
};

export const createTag = async (name: string): Promise<Tag> => {
  const res = await instance.POST<{ success: boolean; data: Tag }>("/tags", { name });
  return res.data;
};

export const resolveTagIds = async (tagNames: string[]): Promise<string[]> => {
  if (tagNames.length === 0) return [];

  const existingTags = await getTagList();
  const ids: string[] = [];

  for (const name of tagNames) {
    const existing = existingTags.find((t) => t.name === name);
    if (existing) {
      ids.push(existing.id);
    } else {
      try {
        const created = await createTag(name);
        ids.push(created.id);
      } catch (error) {
        console.error(`태그 생성 실패 (${name}):`, error);
      }
    }
  }

  return ids;
};
