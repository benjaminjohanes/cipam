import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Link, Quote } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const formatActions = [
    { icon: Bold, action: () => insertFormatting("**", "**"), title: "Gras" },
    { icon: Italic, action: () => insertFormatting("*", "*"), title: "Italique" },
    { icon: Heading1, action: () => insertFormatting("\n# ", "\n"), title: "Titre 1" },
    { icon: Heading2, action: () => insertFormatting("\n## ", "\n"), title: "Titre 2" },
    { icon: List, action: () => insertFormatting("\n- "), title: "Liste" },
    { icon: ListOrdered, action: () => insertFormatting("\n1. "), title: "Liste numérotée" },
    { icon: Quote, action: () => insertFormatting("\n> ", "\n"), title: "Citation" },
    { icon: Link, action: () => insertFormatting("[", "](url)"), title: "Lien" },
  ];

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 bg-muted/50 border-b">
        {formatActions.map(({ icon: Icon, action, title }) => (
          <Button
            key={title}
            type="button"
            variant="ghost"
            size="sm"
            onClick={action}
            title={title}
            className="h-8 w-8 p-0"
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[300px] border-0 rounded-none focus-visible:ring-0 resize-y"
      />
      <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/30 border-t">
        Supporte le formatage Markdown
      </div>
    </div>
  );
};
