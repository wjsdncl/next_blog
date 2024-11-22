// Form.tsx
import { ReactNode, useState } from "react";
import {
  FormProvider,
  useForm,
  useFormContext,
  SubmitHandler,
  Path,
  FieldValues,
  Controller,
  DefaultValues,
} from "react-hook-form";
import { default as Tag } from "@/components/TagInput";
import { EyeClose, EyeOpen } from "@/Icons/Eyes";
import cn from "@/utils/cn";

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
}

interface SelectProps<T extends FieldValues> {
  label: Path<T>;
  options: string[];
}

interface CheckboxProps<T extends FieldValues> {
  label: Path<T>;
  isChecked?: boolean;
}

interface SubmitProps {
  text?: string;
  disabled?: boolean;
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

    // `dirtyFields`로 수정된 데이터만 추출
    const modifiedData = Object.keys(dirtyFields).reduce((acc, key) => {
      if (dirtyFields[key as keyof T]) {
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
            className="size-full rounded-md border-2 border-background-tertiary bg-background-secondary px-3 py-2 pr-10 text-text-primary outline-none focus:border-brand-secondary dark:focus:border-brand_dark-primary"
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
            "size-full resize-none rounded-md border-2 border-background-tertiary bg-background-secondary px-3 py-2 outline-none focus:border-brand-secondary scrollbar:w-2 scrollbar:rounded-full scrollbar:bg-gray-200 scrollbar-thumb:rounded-full scrollbar-thumb:bg-gray-300 dark:focus:border-brand_dark-primary"
          )}
          onChange={(e) => handleResize(e, field.onChange)}
        />
      )}
    />
  );
}

function TagInput<T extends FieldValues>({ label, style = "default", validation = {} }: TagInputProps<T>) {
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
            addTag={(tag: string) => field.onChange([...(value || []), tag])}
            removeTag={(tag: string) => field.onChange((value || []).filter((t: string) => t !== tag))}
            style={style}
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
          className="size-full rounded-md border-2 border-background-tertiary bg-background-secondary px-3 py-2 outline-none focus:border-brand-secondary dark:focus:border-brand_dark-primary"
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

function Checkbox<T extends FieldValues>({ label, isChecked }: CheckboxProps<T>) {
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
            checked={field.value ?? isChecked}
            onChange={(e) => field.onChange(e.target.checked)}
          />
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
      className="size-full rounded-md bg-brand-tertiary px-3 py-2 text-lg font-semibold text-white hover:bg-brand-secondary active:bg-brand-primary disabled:bg-gray-200 disabled:hover:bg-gray-200 dark:bg-brand_dark-primary dark:hover:bg-brand_dark-secondary dark:active:bg-brand_dark-tertiary"
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

export default Form;
