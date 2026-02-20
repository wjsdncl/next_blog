import Image from "next/image";
import { useState } from "react";
import removeMarkdown from "remove-markdown";
import CloseBold from "@/Icons/CloseBold.svg";
import ImageIcon from "@/Icons/Image.svg";
import { uploadImage } from "@/services/post.api";

interface PreviewModalProps {
  title: string;
  content: string;
  initialCoverImg: string;
  onComplete: (coverImage: string) => void;
}

export default function PreviewModal({ title, content, initialCoverImg, onComplete }: PreviewModalProps) {
  const [coverImage, setCoverImg] = useState(initialCoverImg);

  const handleImageSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      try {
        const imageUrl = await uploadImage(file);
        setCoverImg(imageUrl);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Image upload failed:", error);
      }
    }
  };

  return (
    <div>
      <p className="text-center text-2xl font-bold">미리보기</p>
      <div className="pt-4" />

      <label htmlFor="file" className="block w-full cursor-default rounded-lg bg-gray-200 p-4 text-center">
        {coverImage ? (
          <div className="relative flex h-40 w-full items-center justify-center">
            <Image src={coverImage} alt="coverImage" className="object-cover" fill sizes="300" />
            <button className="absolute -right-2 -top-2 rounded-full bg-gray-400 p-1" onClick={() => setCoverImg("")}>
              <CloseBold width={16} height={16} />
            </button>
          </div>
        ) : (
          <div className="py-4">
            <div className="flex size-full justify-center">
              <ImageIcon color="var(--color-gray-400)" />
            </div>
            <div className="pt-2" />
            <p className="text-xl font-medium text-text-primary opacity-60">썸네일 업로드</p>
          </div>
        )}
      </label>

      <input id="file" type="file" accept="image/*" className="w-full" hidden onChange={handleImageSelection} />

      <div className="pt-4" />
      <p className="text-3xl font-bold">{title}</p>
      <div className="pt-4" />
      <p className="line-clamp-4 text-lg">{removeMarkdown(content.slice(0, 150))}</p>
      <div className="pt-4" />

      <button
        className="float-right w-max text-nowrap rounded-lg bg-brand-primary px-4 py-2 text-lg font-bold text-white"
        onClick={() => onComplete(coverImage)}
      >
        게시글 작성 완료
      </button>
    </div>
  );
}
