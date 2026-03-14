import type { ComponentChildren, ComponentChild } from 'preact';
import { X } from 'lucide-preact';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ComponentChildren;
  footer?: ComponentChild;
}

export function Modal({ title, onClose, children, footer }: ModalProps) {
  return (
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div class="bg-[#313338] rounded-lg w-full max-w-md mx-4 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div class="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 class="text-[#f2f3f5] text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            class="text-[#949ba4] hover:text-[#dbdee1] transition-colors p-1 rounded"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div class="px-6 pb-4 flex-1 overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div class="px-6 py-4 bg-[#2b2d31] rounded-b-lg border-t border-[#1e1f22]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable form field
interface FormFieldProps {
  label: string;
  hint?: string;
  required?: boolean;
  children: ComponentChildren;
}

export function FormField({ label, hint, required, children }: FormFieldProps) {
  return (
    <div class="mb-4">
      <label class="block text-[#b5bac1] text-xs font-bold uppercase tracking-wide mb-1.5">
        {label}
        {required && <span class="text-[#f23f42] ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p class="text-[#949ba4] text-xs mt-1">{hint}</p>}
    </div>
  );
}

interface InputProps {
  value: string;
  onInput: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  class?: string;
}

export function Input({
  value,
  onInput,
  placeholder,
  type = 'text',
  disabled,
  class: cls,
}: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onInput={(e) => onInput((e.target as HTMLInputElement).value)}
      placeholder={placeholder}
      disabled={disabled}
      class={`w-full bg-[#1e1f22] border border-[#1e1f22] text-[#dbdee1] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#5865f2] placeholder-[#4e5058] disabled:opacity-50 ${cls ?? ''}`}
    />
  );
}

interface TextareaProps {
  value: string;
  onInput: (v: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  maxLength?: number;
  class?: string;
}

export function Textarea({
  value,
  onInput,
  placeholder,
  rows = 4,
  disabled,
  maxLength,
  class: cls,
}: TextareaProps) {
  return (
    <textarea
      value={value}
      onInput={(e) => onInput((e.target as HTMLTextAreaElement).value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      maxLength={maxLength}
      class={`w-full bg-[#1e1f22] border border-[#1e1f22] text-[#dbdee1] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#5865f2] placeholder-[#4e5058] resize-y disabled:opacity-50 ${cls ?? ''}`}
    />
  );
}

interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'danger' | 'ghost';
  children: ComponentChildren;
  type?: 'button' | 'submit';
  class?: string;
}

export function Button({
  onClick,
  disabled,
  variant = 'primary',
  children,
  type = 'button',
  class: cls,
}: ButtonProps) {
  const base =
    'px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-[#5865f2] hover:bg-[#4752c4] active:bg-[#3c45a5] text-white',
    danger: 'bg-[#da373c] hover:bg-[#a12d31] active:bg-[#8d2326] text-white',
    ghost:
      'bg-transparent hover:bg-[#404249] text-[#dbdee1] border border-transparent hover:border-[#404249]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      class={`${base} ${variants[variant]} ${cls ?? ''}`}
    >
      {children}
    </button>
  );
}

// Alert / notification banner
interface AlertProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onDismiss?: () => void;
}

export function Alert({ type, message, onDismiss }: AlertProps) {
  const styles = {
    success: 'bg-[#23a559]/20 border-[#23a559] text-[#23a559]',
    error: 'bg-[#da373c]/20 border-[#da373c] text-[#f23f42]',
    info: 'bg-[#5865f2]/20 border-[#5865f2] text-[#5865f2]',
    warning: 'bg-[#f0b232]/20 border-[#f0b232] text-[#f0b232]',
  };

  return (
    <div
      class={`flex items-start gap-3 p-3 rounded border text-sm ${styles[type]}`}
    >
      <span class="flex-1 wrap-break-word">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          class="opacity-70 hover:opacity-100 shrink-0"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
