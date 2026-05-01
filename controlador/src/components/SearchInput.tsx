import styles from "@/styles/admin.module.css";

type SearchInputProps = {
  name?: string;
  defaultValue?: string;
  placeholder?: string;
};

export function SearchInput({ name = "busca", defaultValue, placeholder = "Buscar" }: SearchInputProps) {
  return (
    <input
      className={styles.input}
      defaultValue={defaultValue}
      name={name}
      placeholder={placeholder}
      type="search"
    />
  );
}
