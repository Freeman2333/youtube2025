import { Copy, CopyCheckIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      className="h-8 w-8 p-1"
      onClick={handleCopy}
    >
      {copied ? (
        <CopyCheckIcon className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
};

export default CopyButton;
