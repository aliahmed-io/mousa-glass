import { useEffect } from "react";

export function SeoJsonLd({ id, data }: { id: string; data: Record<string, unknown> | null }) {
  useEffect(() => {
    const existing = document.getElementById(id);
    if (!data) {
      existing?.remove();
      return;
    }
    const script = existing instanceof HTMLScriptElement ? existing : document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.text = JSON.stringify(data).replace(/</g, "\\u003c");
    if (!existing) document.head.appendChild(script);
    return () => script.remove();
  }, [data, id]);

  return null;
}
