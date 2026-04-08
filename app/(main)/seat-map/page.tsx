import SeatMap from "@/components/seat-map/SeatMap";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seat Map | MA Library",
  description: "View available seats and book your study spot at MA Library",
};

export default function SeatMapPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto mt-24">
        <SeatMap />
      
      </div>
    </div>
  );
}
