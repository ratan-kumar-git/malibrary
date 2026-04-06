import { SeatMap } from "@/components/seat-map/SeatMap";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seat Map | MA Library",
  description: "View available seats and book your study spot at MA Library",
};

export default function SeatMapPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Seat Map
          </h1>
          <p className="text-gray-600 text-lg">
            Choose your preferred seat from our interactive seat map
          </p>
        </div>

        <SeatMap />
      </div>
    </div>
  );
}
