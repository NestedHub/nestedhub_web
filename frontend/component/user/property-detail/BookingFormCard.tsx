// component/user/property-detail/BookingFormCard.tsx
"use client";

import { Card } from "@/component/ui/card";
import { Button } from "@/component/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/component/ui/popover";
import { Calendar } from "@/component/ui/calendar";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea component
import { Loader2, CalendarDays, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useUser } from "@/lib/hooks/useUser";
import { useCreateViewingRequest, useUserViewingRequests } from '@/lib/hooks/useViewingRequests';
import { ViewingRequestResponse } from "@/lib/api/viewingrequest";

interface BookingFormCardProps {
  propertyId: string;
  propertyStatus: string; // Add propertyStatus prop
}

export function BookingFormCard({ propertyId, propertyStatus }: BookingFormCardProps) {
  const { isAuthenticated, isLoading: isLoadingAuth } = useUser();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("10:00");
  const [message, setMessage] = useState<string>(""); // ADDED: State for the message

  const propIdAsNumber = parseInt(propertyId, 10);

  const { mutate: createRequest, loading: isBookingLoading, error: bookingError } = useCreateViewingRequest();
  const { data: userRequests, loading: loadingUserRequests, error: userRequestsError, refetch: refetchUserRequests } = useUserViewingRequests();

  const [bookingMessage, setBookingMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const activeRequestForThisProperty = useMemo<ViewingRequestResponse | undefined>(() => {
    if (userRequests && !loadingUserRequests) {
      return userRequests.find(
        (request) =>
          request.property_id === propIdAsNumber &&
          (request.status === 'pending' || request.status === 'accepted')
      );
    }
    return undefined;
  }, [userRequests, loadingUserRequests, propIdAsNumber]);

  const hasActiveRequest = !!activeRequestForThisProperty;

  useEffect(() => {
    if (!hasActiveRequest) {
      setBookingMessage(null);
    }
  }, [selectedDate, selectedTime, message, hasActiveRequest]); // ADDED `message` to dependencies

  useEffect(() => {
    if (userRequestsError) {
      setBookingMessage({ type: 'error', text: 'Failed to load your existing viewing requests.' });
    }
  }, [userRequestsError]);


  const handleBookingRequest = async () => {
    if (!isAuthenticated) {
      setBookingMessage({ type: 'error', text: 'Please log in to book a viewing request.' });
      return;
    }
    if (propertyStatus !== 'available') {
      setBookingMessage({ type: 'error', text: 'This property is currently not available for viewing requests.' });
      return;
    }
    if (!selectedDate || !selectedTime) {
      setBookingMessage({ type: 'error', text: 'Please select both a date and a time.' });
      return;
    }
    if (hasActiveRequest) {
      setBookingMessage({ type: 'error', text: 'You already have an active viewing request for this property.' });
      return;
    }
    if (isNaN(propIdAsNumber)) {
      setBookingMessage({ type: 'error', text: 'Property ID is invalid for booking.' });
      return;
    }

    setBookingMessage(null);

    try {
      const dateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      dateTime.setHours(hours, minutes, 0, 0);
      const requested_time_iso = dateTime.toISOString();

      await createRequest({
        property_id: propIdAsNumber,
        requested_time: requested_time_iso,
        message: message.trim() === "" ? undefined : message.trim() // ADDED: Include message, make it undefined if empty
      });

      setBookingMessage({ type: 'success', text: 'Your viewing request has been sent successfully! The property owner will contact you soon.' });
      setSelectedDate(undefined);
      setSelectedTime("10:00");
      setMessage(""); // Reset message field
      refetchUserRequests();
    } catch (err: any) {
      console.error("Booking failed:", err);
      setBookingMessage({ type: 'error', text: bookingError?.message || 'Failed to send viewing request. Please try again.' });
    }
  };

  const overallLoading = isLoadingAuth || loadingUserRequests;

  return (
    <Card className="p-6 shadow-md border-green-200 bg-green-50">
      <h3 className="text-xl font-bold text-green-800 mb-4">Book a Viewing</h3>

      {overallLoading ? (
        <div className="flex flex-col items-center justify-center py-4 text-gray-600">
          <Loader2 className="h-6 w-6 text-green-600 animate-spin mb-2" />
          <p className="text-sm">Getting ready to book...</p>
        </div>
      ) : !isAuthenticated ? (
        <div className="text-center py-4">
          <p className="text-gray-700 mb-4">
            To request a viewing, please **log in** to your account.
          </p>
          <Link href="/login" passHref>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold">
              Log In
            </Button>
          </Link>
        </div>
      ) : propertyStatus !== 'available' ? ( // New condition to check property status
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-start space-x-3">
          <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Property Not Available for Viewing</p>
            <p className="text-sm">
              This property is currently **{propertyStatus}** and cannot be booked for a viewing.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {hasActiveRequest ? (
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md flex items-start space-x-3">
              <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">You've already requested a viewing!</p>
                <p className="text-sm">
                  Your request for this property is currently {' '}
                  <span className="font-semibold text-blue-800">
                    {activeRequestForThisProperty?.status === 'pending' ? 'pending approval' : 'accepted'}
                  </span>
                  {' '}
                  for {' '}
                  <span className="font-semibold">
                    {activeRequestForThisProperty?.requested_time ? format(new Date(activeRequestForThisProperty.requested_time), "MMM dd, yyyy 'at' hh:mm a") : 'an unconfirmed time'}.
                  </span>
                </p>
                {activeRequestForThisProperty?.message && ( // Display message if it exists
                  <p className="text-sm mt-2 text-gray-600 italic">
                    Your message: "{activeRequestForThisProperty.message}"
                  </p>
                )}
                <p className="text-sm mt-2">
                  Please wait for the owner's response or check your {' '}
                  <Link href="/user/viewing-requests" className="font-semibold underline text-blue-600 hover:text-blue-800">
                    My Viewings
                  </Link>
                  {' '} page for updates.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="viewing-date" className="block text-sm font-medium text-gray-700 mb-2">
                  Select a Date:
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white hover:bg-gray-50",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Choose a date</span>}
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
                  Select a Time:
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="time"
                    id="viewing-time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    min="09:00"
                    max="17:00"
                    step="1800" // 30-minute intervals
                  />
                </div>
              </div>

              {/* ADDED: Textarea for the message */}
              <div>
                <label htmlFor="viewing-message" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message (Optional):
                </label>
                <Textarea
                  id="viewing-message"
                  placeholder="e.g., 'I am very interested in this property and would like to move in by next month.'"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {bookingMessage && (
                <div className={`text-sm text-center p-2 rounded-md ${bookingMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {bookingMessage.text}
                </div>
              )}

              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 shadow-md hover:shadow-lg transition duration-200"
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
            </>
          )}
        </div>
      )}
    </Card>
  );
}