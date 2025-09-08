
export type EmailsInputProps = {
    label: string;
    values: string[];
    onChange: (next: string[]) => void;
    placeholder?: string;
    autoFocus?: boolean;
    hidden?: boolean;
    setHidden?: (v: boolean) => void;
};