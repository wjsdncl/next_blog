/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
// Form.tsx
import Image from "next/image";
import { type ReactNode, useState, useRef, useEffect } from "react";
import {
  FormProvider,
  useForm,
  useFormContext,
  type SubmitHandler,
  type Path,
  type FieldValues,
  Controller,
  type DefaultValues,
} from "react-hook-form";
import { default as Tag } from "@/components/ui/TagInput";
import EyeClose from "@/Icons/EyeClose.svg";
import EyeOpen from "@/Icons/EyeOpen.svg";
import cn from "@/utils/cn";

// 파일 미리보기 인터페이스 정의
export interface FilePreview {
  file: File;
  previewUrl: string;
  isUploaded?: boolean; // 이미 업로드된 이미지인지 여부
}

// Types
interface FormProps<T extends FieldValues> {
  onSubmit: SubmitHandler<T>;
  children: ReactNode;
  defaultValues?: DefaultValues<T>;
}

interface ErrorProps<T extends FieldValues> {
  name: Path<T>;
}

interface InputProps<T extends FieldValues> {
  label: Path<T>;
  type?: string;
  placeholder?: string;
  autoComplete?: React.InputHTMLAttributes<HTMLInputElement>["autoComplete"];
  validation?: object;
}

interface TextareaProps<T extends FieldValues> {
  label: Path<T>;
  placeholder?: string;
  rows?: number;
  validation?: object;
}

interface TagInputProps<T extends FieldValues> {
  label: Path<T>;
  style?: "default" | "outline";
  validation?: object;
  suggestions?: string[];
}

interface SelectProps<T extends FieldValues> {
  label: Path<T>;
  options: string[];
}

interface CheckboxProps<T extends FieldValues> {
  label: Path<T>;
}

interface SubmitProps {
  text?: string;
  disabled?: boolean;
}

// FileInputProps에서 onUpload 제거
interface FileInputProps<T extends FieldValues> {
  label: Path<T>;
  accept?: string;
  multiple?: boolean;
  validation?: object;
}

// Components
function Form<T extends FieldValues>({ onSubmit, children, defaultValues }: FormProps<T>) {
  const methods = useForm<T>({
    mode: "onChange",
    criteriaMode: "all",
    shouldFocusError: true,
    defaultValues,
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
      e.preventDefault();
    }
  };

  const modifiedOnSubmit: SubmitHandler<T> = (data) => {
    const dirtyFields = methods.formState.dirtyFields as Partial<Record<keyof T, boolean>>;
    const modifiedData = Object.entries(dirtyFields).reduce((acc, [key, isDirty]) => {
      if (isDirty) {
        acc[key as keyof T] = data[key as keyof T];
      }
      return acc;
    }, {} as Partial<T>);
    onSubmit(modifiedData as T); // 수정된 데이터만 전달
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(modifiedOnSubmit)} onKeyDown={handleKeyDown}>
        {children}
      </form>
    </FormProvider>
  );
}

function Error<T extends FieldValues>({ name }: ErrorProps<T>) {
  const {
    formState: { errors },
  } = useFormContext<T>();

  if (!errors[name]?.message) return null;

  return <p className="pl-3 text-error">{errors[name]?.message as string}</p>;
}

function Input<T extends FieldValues>({
  label,
  type = "text",
  placeholder,
  autoComplete,
  validation = {},
}: InputProps<T>) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { control } = useFormContext<T>();

  const inputType = type === "password" ? (isPasswordVisible ? "text" : "password") : type;

  const togglePasswordVisibility = () => setIsPasswordVisible((prev) => !prev);

  const renderPasswordToggle = () => {
    if (type !== "password") return null;

    return (
      <button
        className="absolute right-3 top-1/2 size-5 -translate-y-1/2"
        onClick={togglePasswordVisibility}
        type="button"
      >
        {isPasswordVisible ? (
          <EyeOpen width="100%" height="100%" color="var(--text-primary)" />
        ) : (
          <EyeClose width="100%" height="100%" color="var(--text-primary)" />
        )}
      </button>
    );
  };

  return (
    <div className="relative size-full min-h-8">
      <Controller
        name={label}
        control={control}
        rules={validation}
        render={({ field }) => (
          <input
            {...field}
            id={label}
            value={
              type === "date" && field.value ? new Date(field.value).toISOString().split("T")[0] : field.value || ""
            }
            type={inputType}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className="size-full rounded-md border-2 border-background-tertiary bg-background-secondary px-3 py-2 pr-10 text-text-primary outline-none focus:border-brand_dark-primary"
          />
        )}
      />
      {renderPasswordToggle()}
    </div>
  );
}

function Textarea<T extends FieldValues>({ label, placeholder, rows = 2, validation = {} }: TextareaProps<T>) {
  const { control } = useFormContext<T>();

  const handleResize = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  ) => {
    onChange(e);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <Controller
      name={label}
      control={control}
      rules={validation}
      render={({ field }) => (
        <textarea
          {...field}
          id={label}
          value={field.value || ""}
          rows={rows}
          placeholder={placeholder}
          style={{ maxHeight: `${rows * 2}rem` }}
          className={cn(
            "size-full resize-none rounded-md border-2 border-background-tertiary bg-background-secondary px-3 py-2 outline-none focus:border-brand_dark-primary scrollbar:w-2 scrollbar:rounded-full scrollbar:bg-gray-200 scrollbar-thumb:rounded-full scrollbar-thumb:bg-gray-300"
          )}
          onChange={(e) => handleResize(e, field.onChange)}
        />
      )}
    />
  );
}

function TagInput<T extends FieldValues>({ label, style = "default", validation = {}, suggestions }: TagInputProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={label}
      control={control}
      rules={validation}
      render={({ field }) => {
        const value = field.value as string[];
        return (
          <Tag
            tags={value || []}
            addTag={(tag: string) => !(value || []).includes(tag) && field.onChange([...(value || []), tag])}
            removeTag={(tag: string) => field.onChange((value || []).filter((t: string) => t !== tag))}
            addTags={(newTags: string[]) => {
              const uniqueTags = [...new Set([...(value || []), ...newTags])];
              field.onChange(uniqueTags);
            }}
            style={style}
            suggestions={suggestions}
          />
        );
      }}
    />
  );
}

function Select<T extends FieldValues>({ label, options }: SelectProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={label}
      control={control}
      render={({ field }) => (
        <select
          {...field}
          id={label}
          className="size-full rounded-md border-2 border-background-tertiary bg-background-secondary px-3 py-2 outline-none focus:border-brand_dark-primary"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
    />
  );
}

function Checkbox<T extends FieldValues>({ label }: CheckboxProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={label}
      control={control}
      render={({ field }) => (
        <div className="flex size-full min-h-8 items-center justify-center">
          <input
            type="checkbox"
            className="size-5"
            {...field}
            id={label}
            checked={field.value}
            onChange={(e) => field.onChange(e.target.checked)}
          />
        </div>
      )}
    />
  );
}

function FileInput<T extends FieldValues>({
  label,
  accept = "image/*",
  multiple = true,
  validation = {},
}: FileInputProps<T>) {
  const { control } = useFormContext<T>();
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 미리보기 생성 함수
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: FilePreview[]) => void,
    currentValue: FilePreview[] = []
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      // 파일 미리보기 URL 생성 (실제 업로드는 하지 않음)
      const newPreviews = files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        isUploaded: false,
      }));

      // 기존 미리보기와 새 미리보기 병합
      onChange([...(currentValue || []), ...newPreviews]);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("파일 미리보기 생성 실패:", error);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 미리보기 제거 함수
  const removePreview = (index: number, onChange: (value: FilePreview[]) => void, currentValue: FilePreview[] = []) => {
    const newPreviews = [...currentValue];

    // placeholder 파일이 아닌 경우만 URL 해제 (실제 파일을 가진 경우)
    if (!newPreviews[index].isUploaded) {
      URL.revokeObjectURL(newPreviews[index].previewUrl);
    }

    // 해당 미리보기 제거
    newPreviews.splice(index, 1);
    onChange(newPreviews);
  };

  // 컴포넌트 언마운트 시 미리보기 URL 정리
  const { getValues } = useFormContext<T>();
  useEffect(() => {
    return () => {
      // 안전하게 값 가져오기
      try {
        const values = getValues(label) as FilePreview[] | undefined;

        if (values && Array.isArray(values)) {
          values.forEach((preview) => {
            // 이미 업로드된 이미지가 아닐 경우만 URL 해제
            if (preview?.previewUrl && !preview.isUploaded) {
              URL.revokeObjectURL(preview.previewUrl);
            }
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("미리보기 정리 중 오류:", error);
      }
    };
  }, [getValues, label]);

  return (
    <Controller
      name={label}
      control={control}
      rules={validation}
      render={({ field }) => (
        <div className="w-full">
          <div className="mb-3 flex items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="rounded-md bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              {isProcessing ? "처리 중..." : "이미지 선택"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={(e) => handleFileChange(e, field.onChange, field.value)}
              className="hidden"
            />
          </div>

          {field.value && field.value.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {field.value.map((preview: FilePreview, index: number) => (
                <div key={index} className="relative">
                  <div className="group relative aspect-[3/2] w-full overflow-hidden rounded-md bg-background-tertiary">
                    {preview.isUploaded && (
                      <div className="absolute left-1 top-1 z-10 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-medium text-white">
                        저장됨
                      </div>
                    )}
                    <Image
                      src={preview.previewUrl}
                      alt={`업로드할 이미지 ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePreview(index, field.onChange, field.value)}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    />
  );
}

function Submit({ text = "입력", disabled }: SubmitProps) {
  const {
    formState: { isValid },
  } = useFormContext();

  return (
    <button
      type="submit"
      className="size-full rounded-md bg-brand_dark-primary px-3 py-2 text-lg font-semibold text-white hover:bg-brand_dark-secondary active:bg-brand_dark-tertiary disabled:bg-gray-200 disabled:hover:bg-gray-200"
      disabled={!isValid || disabled}
    >
      {text}
    </button>
  );
}

// Compound Components
Form.Error = Error;
Form.Input = Input;
Form.Textarea = Textarea;
Form.TagInput = TagInput;
Form.Select = Select;
Form.Checkbox = Checkbox;
Form.Submit = Submit;
Form.FileInput = FileInput;

export default Form;
