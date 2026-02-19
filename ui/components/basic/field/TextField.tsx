"use client";

import { InputHTMLAttributes } from "react";
import { FieldValues, Path,RegisterOptions, useFormContext } from "react-hook-form";
import { tv } from "tailwind-variants";

import Input from "../input/Input";

const textField = tv({
  base: "space-y-2",
});

type TextFieldProps<T extends FieldValues = FieldValues> = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "name"
> & {
  name: Path<T>;
  label: string;
  rules?: RegisterOptions<T>;
};

function TextField<T extends FieldValues = FieldValues>({
  name,
  label,
  rules,
  id,
  className,
  ...props
}: TextFieldProps<T>) {
  const { register, formState: { errors } } = useFormContext<T>();
  const error = errors[name];

  return (
    <div className={textField({ className })}>
      <label htmlFor={id ?? name} className="text-sm font-medium block">
        {label}
      </label>
      <Input id={id ?? name} {...props} {...register(name, rules as RegisterOptions<T, Path<T>>)} />
      {error && <p className="text-xs text-red-500">{error.message as string}</p>}
    </div>
  );
}

export default TextField;
