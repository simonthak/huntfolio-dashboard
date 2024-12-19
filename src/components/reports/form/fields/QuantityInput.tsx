import { Input } from "@/components/ui/input";

interface QuantityInputProps {
  value: string;
  onChange: (value: string) => void;
}

const QuantityInput = ({ value, onChange }: QuantityInputProps) => {
  return (
    <Input
      type="number"
      min="1"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Antal"
      className="no-spinner"
    />
  );
};

export default QuantityInput;