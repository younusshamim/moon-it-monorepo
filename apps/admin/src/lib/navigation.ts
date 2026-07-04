// Sidebar navigation model. Feature modules register their entry here as they land; the shell renders
// whatever this exports, so navigation stays declarative and in one place.
import {
  CalendarDays,
  CreditCard,
  GraduationCap,
  History,
  LayoutDashboard,
  type LucideIcon,
  Settings,
  Users,
} from "lucide-react";

export interface NavItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  children?: NavItem[];
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
    label: "Admissions",
    items: [
      { title: "New Admission", href: "/new-admission", icon: Users },
      { title: "Leads", href: "/leads", icon: Users },
    ],
  },
  {
    label: "Students",
    items: [
      {
        title: "Students",
        href: "/students",
        icon: Users,
      },
    ],
  },
  {
    label: "Academics",
    items: [
      {
        title: "Courses",
        href: "/courses",
        icon: GraduationCap,
      },
      {
        title: "Batches",
        href: "/batches",
        icon: CalendarDays,
      },
      { title: "Schedule", href: "/schedule", icon: CalendarDays },
      { title: "Attendance", href: "/attendance", icon: Users },
      {
        title: "Exams & Certificates",
        icon: GraduationCap,
        children: [
          { title: "Exams & Grades", href: "/exams", icon: GraduationCap },
          { title: "Govt Exam Registration", href: "/govt-exams", icon: GraduationCap },
          { title: "Certificates", href: "/certificates", icon: GraduationCap },
        ],
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        title: "Invoices",
        href: "/invoices",
        icon: CreditCard,
      },
      { title: "Payments", href: "/payments", icon: CreditCard },
      { title: "Discounts", href: "/discounts", icon: CreditCard },
    ],
  },
  {
    label: "People",
    items: [
      { title: "Staff", href: "/staff", icon: Users },
      { title: "Instructors", href: "/instructors", icon: Users },
    ],
  },
  {
    label: "Settings",
    items: [
      { title: "Branches", href: "/branches", icon: Settings },
      { title: "Rooms", href: "/rooms", icon: Settings },
      { title: "Departments", href: "/departments", icon: Settings },
      { title: "Users & Roles", href: "/users", icon: Users },
      { title: "Affiliation Bodies", href: "/affiliations", icon: Settings },
      { title: "Audit Log", href: "/audit", icon: History },
    ],
  },
];
