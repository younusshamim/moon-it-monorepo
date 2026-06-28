// Sidebar navigation model. Feature modules register their entry here as they land; the shell renders
// whatever this exports, so navigation stays declarative and in one place.
import {
  CalendarDays,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  type LucideIcon,
  Settings,
  Users,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

// The (dashboard) route group is pathless, so its pages live at the root (INFRASTRUCTURE.md §2):
// `/` is the dashboard home, `(dashboard)/students` resolves to `/students`, etc.
export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    label: "Manage",
    items: [
      { title: "Students", href: "/students", icon: Users },
      { title: "Courses", href: "/courses", icon: GraduationCap },
      { title: "Batches", href: "/batches", icon: CalendarDays },
      { title: "Payments", href: "/payments", icon: CreditCard },
    ],
  },
  {
    label: "System",
    items: [{ title: "Settings", href: "/settings", icon: Settings }],
  },
];
