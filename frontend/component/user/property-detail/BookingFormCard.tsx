// component/user/property-detail/BookingFormCard.tsx
"use client";

import { Card } from "@/component/ui/card";
import { Button } from "@/component/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/component/ui/popover";
import { Calendar } from "@/component/ui/calendar";
import { Loader2, CalendarDays, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { useUser } from "@/lib/hooks/useUser";
import { createViewingRequest } from '@/lib/utils/api'; // Import the API function directly

interface BookingFormCardProps {
  propertyId: string;
}

export function BookingFormCard({ propertyId }: BookingFormCardProps) {
  const { isAuthenticated, isLoading: isLoadingAuth } = useUser();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("10:00"); // Default time
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleBookingRequest = async () => {
    if (!isAuthenticated) {
      setBookingMessage({ type: 'error', text: 'Please log in to book a viewing request.' });
      return;
    }
    if (!selectedDate || !selectedTime) {
      setBookingMessage({ type: 'error', text: 'Please select both a date and a time.' });
      return;
    }

    setIsBookingLoading(true);
    setBookingMessage(null);

    try {
      const dateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      dateTime.setHours(hours, minutes, 0, 0);
      const requested_time_iso = dateTime.toISOString();

      const propIdAsNumber = parseInt(propertyId, 10);
      if (isNaN(propIdAsNumber)) {
        throw new Error("Property ID is invalid for booking.");
      }

      await createViewingRequest(propIdAsNumber, requested_time_iso);
      setBookingMessage({ type: 'success', text: 'Viewing request sent successfully! The owner will contact you.' });
      setSelectedDate(undefined);
      setSelectedTime("10:00");
    } catch (err: any) {
      console.error("Booking failed:", err);
      setBookingMessage({ type: 'error', text: err.message || 'Failed to send viewing request. Please try again.' });
    } finally {
      setIsBookingLoading(false);
    }
  };

  return (
    <Card className="p-6 shadow-md border-green-200 bg-green-50">
      <h3 className="text-xl font-bold text-green-800 mb-4">Book a Viewing</h3>
      {isLoadingAuth ? (
        <div className="flex flex-col items-center justify-center py-4">
          <Loader2 className="h-6 w-6 text-green-600 animate-spin mb-2" />
          <p className="text-gray-600 text-sm">Checking authentication...</p>
        </div>
      ) : !isAuthenticated ? (
        <div className="text-center py-4">
          <p className="text-gray-700 mb-4">Please log in to request a viewing for this property.</p>
          <Link href="/login" passHref>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold">
              Log In
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="viewing-date" className="block text-sm font-medium text-gray-700 mb-2">
              Select Date:
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" /> {/* Use CalendarDays for the icon */}
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  disabled={(date) => date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 3))}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label htmlFor="viewing-time" className="block text-sm font-medium text-gray-700 mb-2">
              Select Time:
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="time"
                id="viewing-time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                min="09:00"
                max="17:00"
                step="1800"
              />
            </div>
          </div>

          {bookingMessage && (
            <p className={`text-sm text-center ${bookingMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
              {bookingMessage.text}
            </p>
          )}

          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
            onClick={handleBookingRequest}
            disabled={isBookingLoading || !selectedDate || !selectedTime}
          >
            {isBookingLoading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <CalendarDays className="h-5 w-5 mr-2" />
            )}
            {isBookingLoading ? 'Sending Request...' : 'Request Viewing'}
          </Button>
        </div>
      )}
    </Card>
  );
}