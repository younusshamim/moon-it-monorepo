import type { Metadata } from "next";
import { RoomsTable } from "./_components/rooms-table";

export const metadata: Metadata = { title: "Rooms" };

export default function RoomsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Rooms</h1>
        <p className="text-muted-foreground">
          Manage rooms and labs across branches, including capacity and equipment.
        </p>
      </div>
      <RoomsTable />
    </div>
  );
}
