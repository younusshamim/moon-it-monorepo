import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2 font-semibold", collapsed && "justify-center")}
    >
      {!collapsed ? (
        <Image src="/logo/moon-logo.png" alt="Moon IT" width={100} height={40} />
      ) : (
        <Image src="/logo/moon-icon.png" alt="Moon IT" width={25} height={25} />
      )}
    </Link>
  );
}
