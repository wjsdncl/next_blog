// Form.tsx
import { ReactNode, useState } from "react";
import { FormProvider, useForm, useFormContext, SubmitHandler, Path, FieldValues, Controller } from "react-hook-form";
import { default as Tag } from "@/components/TagInput";
import { EyeClose, EyeOpen } from "@/Icons/Eyes";

// Types
interface FormProps<T extends FieldValues> {
  onSubmit: SubmitHandler<T>;
  children: ReactNode;
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
}

interface SubmitProps {
  text?: string;
  disabled?: boolean;
}

// Components
function Form<T extends FieldValues>({ onSubmit, children }: FormProps<T>) {
  const methods = useForm<T>({
    mode: "onChange",
    criteriaMode: "all",
    shouldFocusError: true,
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
      e.preventDefault();
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} onKeyDown={handleKeyDown}>
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
            value={field.value || ""}
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
          className="size-full h-auto max-h-[200px] resize-none rounded-md border-2 border-background-tertiary bg-background-secondary px-3 py-2 outline-none focus:border-brand-secondary scrollbar:w-2 scrollbar:rounded-full scrollbar:bg-gray-200 scrollbar-thumb:rounded-full scrollbar-thumb:bg-gray-300 dark:focus:border-brand_dark-primary"
          onChange={(e) => handleResize(e, field.onChange)}
        />
      )}
    />
  );
}

function TagInput<T extends FieldValues>({ label, style = "default" }: TagInputProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={label}
      control={control}
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
Form.Submit = Submit;

export default Form;
