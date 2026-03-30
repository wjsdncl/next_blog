import toast from "@/utils/toast";

export async function copyCurrentUrl() {
  try {
    await navigator.clipboard.writeText(decodeURIComponent(window.location.href));
    toast.success("링크가 클립보드에 복사되었습니다.");
  } catch {
    toast.error("링크 복사에 실패했습니다.");
  }
}
