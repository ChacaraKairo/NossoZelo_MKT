import styles from "@/styles/admin.module.css";

type FilterSelectProps = {
  name: string;
  defaultValue?: string;
  label: string;
  options: { label: string; value: string }[];
};

export function FilterSelect({ name, defaultValue, label, options }: FilterSelectProps) {
  return (
    <select className={styles.select} defaultValue={defaultValue ?? ""} name={name} aria-label={label}>
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
