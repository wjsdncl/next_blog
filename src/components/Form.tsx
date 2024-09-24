// Form.tsx
import { ReactNode, useState } from "react";
import { FormProvider, useForm, useFormContext, SubmitHandler, Path, FieldValues } from "react-hook-form";
import { EyeClose, EyeOpen } from "@/Icons/Eyes";

// Form 컴포넌트
interface FormProps<T extends FieldValues> {
  onSubmit: SubmitHandler<T>;
  children: ReactNode;
}

function Form<T extends FieldValues>({ onSubmit, children }: FormProps<T>) {
  const methods = useForm<T>({ mode: "onChange", criteriaMode: "all", shouldFocusError: true });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>{children}</form>
    </FormProvider>
  );
}

// Error 컴포넌트
type ErrorProps<T extends FieldValues> = {
  name: Path<T>;
};

function Error<T extends FieldValues>({ name }: ErrorProps<T>) {
  const {
    formState: { errors },
  } = useFormContext<T>();

  const errorMessage = errors[name]?.message as string | undefined;

  return errorMessage ? <p className="pl-3 text-error">{errorMessage}</p> : null;
}

// Input 컴포넌트
type InputProps<T extends FieldValues> = {
  label: Path<T>;
  type?: string;
  placeholder?: string;
  autoComplete?: React.InputHTMLAttributes<HTMLInputElement>["autoComplete"];
  validation?: object;
};

function Input<T extends FieldValues>({
  label,
  type = "text",
  placeholder,
  autoComplete,
  validation = {},
}: InputProps<T>) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { register } = useFormContext<T>();

  return (
    <div className="relative size-full min-h-8">
      <input
        type={type === "password" ? (isPasswordVisible ? "text" : "password") : type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="size-full rounded-md border-2 border-background-tertiary bg-background-secondary px-3 py-2 pr-10 text-text-primary outline-none focus:border-brand-secondary dark:focus:border-brand_dark-primary"
        {...register(label, { ...validation })}
      />
      {type === "password" && (
        <button
          className="absolute right-3 top-1/2 size-5 -translate-y-1/2"
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          type="button"
        >
          {isPasswordVisible ? (
            <EyeOpen width={"100%"} height={"100%"} color="var(--text-primary)" />
          ) : (
            <EyeClose width={"100%"} height={"100%"} color="var(--text-primary)" />
          )}
        </button>
      )}
    </div>
  );
}

// Textarea 컴포넌트
type TextareaProps<T extends FieldValues> = {
  label: Path<T>;
  validation?: object;
};

function Textarea<T extends FieldValues>({ label, validation = {} }: TextareaProps<T>) {
  const { register } = useFormContext<T>();

  return (
    <textarea
      className="size-full max-h-[200px] min-h-8 resize-none rounded-md border-2 border-background-tertiary bg-background-secondary px-3 py-2 outline-none focus:border-brand-secondary dark:focus:border-brand_dark-primary"
      {...register(label, { ...validation })}
    />
  );
}

// Button Type Submit 컴포넌트
function Submit({ text = "입력", disabled }: { text?: string; disabled?: boolean }) {
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

Form.Error = Error;
Form.Input = Input;
Form.Textarea = Textarea;
Form.Submit = Submit;

export default Form;
