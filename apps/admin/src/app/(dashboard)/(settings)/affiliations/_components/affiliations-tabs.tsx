"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@moonit/ui/components/tabs";
import { BodiesTab, type DummyBody } from "./bodies-tab";
import { type DummyEvent, EventsTab } from "./events-tab";
import { type DummyFee, FeesTab } from "./fees-tab";
import { type DummyRegistration, RegistrationsTab } from "./registrations-tab";

export interface LookupBranch {
  id: string;
  name: string;
}

export interface LookupCourse {
  id: string;
  code: string;
  title: string;
}

export interface LookupStudent {
  id: string;
  studentCode: string;
  fullName: string;
}

export const BRANCHES: LookupBranch[] = [
  { id: "b1", name: "Dhaka Main" },
  { id: "b2", name: "Chittagong" },
  { id: "b3", name: "Sylhet" },
  { id: "b4", name: "Rajshahi" },
];

export const COURSES: LookupCourse[] = [
  { id: "c1", code: "WEB-101", title: "Web Design & Development" },
  { id: "c2", code: "ELEC-201", title: "Electrical Works" },
  { id: "c3", code: "IELTS-A", title: "IELTS Preparation" },
  { id: "c4", code: "GRA-110", title: "Graphic Design" },
];

export const STUDENTS: LookupStudent[] = [
  { id: "s1", studentCode: "MIT-2026-00142", fullName: "Rafiul Islam" },
  { id: "s2", studentCode: "MIT-2026-00187", fullName: "Nusrat Jahan" },
  { id: "s3", studentCode: "MIT-2025-00093", fullName: "Tanvir Ahmed" },
];

const BODIES: DummyBody[] = [
  {
    id: "ab1",
    code: "BTEB",
    name: "Bangladesh Technical Education Board",
    website: "https://bteb.gov.bd",
    isActive: true,
  },
  {
    id: "ab2",
    code: "NSDA",
    name: "National Skills Development Authority",
    website: "https://nsda.gov.bd",
    isActive: true,
  },
  { id: "ab3", code: "TTC", name: "Technical Training Council", website: null, isActive: false },
];

const FEES: DummyFee[] = [
  {
    id: "f1",
    courseId: "c1",
    branchId: null,
    registrationFee: "1500.00",
    currency: "BDT",
    validFrom: "2026-01-01",
    validTo: "2026-12-31",
    isActive: true,
  },
  {
    id: "f2",
    courseId: "c2",
    branchId: "b1",
    registrationFee: "2000.00",
    currency: "BDT",
    validFrom: "2026-01-01",
    validTo: null,
    isActive: true,
  },
  {
    id: "f3",
    courseId: "c3",
    branchId: "b2",
    registrationFee: "3500.00",
    currency: "BDT",
    validFrom: "2025-06-01",
    validTo: "2025-12-31",
    isActive: false,
  },
];

const EVENTS: DummyEvent[] = [
  {
    id: "e1",
    affiliationBodyId: "ab1",
    courseId: "c1",
    title: "BTEB Web Design — June 2026",
    examDate: "2026-06-15",
    registrationOpensAt: "2026-04-01",
    registrationClosesAt: "2026-05-15",
    resultPublishedAt: null,
  },
  {
    id: "e2",
    affiliationBodyId: "ab1",
    courseId: "c2",
    title: "BTEB Electrical Works — March 2026",
    examDate: "2026-03-20",
    registrationOpensAt: "2026-01-05",
    registrationClosesAt: "2026-02-20",
    resultPublishedAt: "2026-04-10",
  },
  {
    id: "e3",
    affiliationBodyId: "ab2",
    courseId: "c4",
    title: "NSDA Graphic Design — August 2026",
    examDate: "2026-08-10",
    registrationOpensAt: "2026-06-01",
    registrationClosesAt: "2026-07-20",
    resultPublishedAt: null,
  },
];

const REGISTRATIONS: DummyRegistration[] = [
  {
    id: "r1",
    studentId: "s1",
    examEventId: "e2",
    branchId: "b1",
    status: "passed",
    boardRollNumber: "112233",
    boardRegistrationNumber: "REG-0098",
    resultGrade: "A",
    resultMarks: "82.50",
    registeredAt: "2026-02-10",
  },
  {
    id: "r2",
    studentId: "s2",
    examEventId: "e1",
    branchId: "b1",
    status: "registered",
    boardRollNumber: null,
    boardRegistrationNumber: null,
    resultGrade: null,
    resultMarks: null,
    registeredAt: "2026-04-20",
  },
  {
    id: "r3",
    studentId: "s3",
    examEventId: "e1",
    branchId: "b2",
    status: "pending_payment",
    boardRollNumber: null,
    boardRegistrationNumber: null,
    resultGrade: null,
    resultMarks: null,
    registeredAt: null,
  },
];

export function AffiliationsTabs() {
  return (
    <Tabs defaultValue="bodies">
      <TabsList className="w-full sm:w-fit">
        <TabsTrigger value="bodies">Affiliation Bodies</TabsTrigger>
        <TabsTrigger value="fees">Exam Fees</TabsTrigger>
        <TabsTrigger value="events">Exam Events</TabsTrigger>
        <TabsTrigger value="registrations">Registrations</TabsTrigger>
      </TabsList>

      <TabsContent value="bodies" className="mt-6">
        <BodiesTab bodies={BODIES} />
      </TabsContent>

      <TabsContent value="fees" className="mt-6">
        <FeesTab fees={FEES} courses={COURSES} branches={BRANCHES} />
      </TabsContent>

      <TabsContent value="events" className="mt-6">
        <EventsTab events={EVENTS} bodies={BODIES} courses={COURSES} />
      </TabsContent>

      <TabsContent value="registrations" className="mt-6">
        <RegistrationsTab
          registrations={REGISTRATIONS}
          events={EVENTS}
          students={STUDENTS}
          branches={BRANCHES}
        />
      </TabsContent>
    </Tabs>
  );
}
