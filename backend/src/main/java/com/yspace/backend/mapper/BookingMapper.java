package com.yspace.backend.mapper;

import com.yspace.backend.dto.BookingResponseDto;
import com.yspace.backend.model.Booking;
import com.yspace.backend.model.BookingRow;
import org.springframework.stereotype.Component;

@Component
public class BookingMapper {

    public BookingResponseDto toDto(Booking booking) {

        BookingRow bookingRow = booking.getBookingRows().getFirst();

        return new BookingResponseDto(
                booking.getId(),
                booking.getStatus().name(),

                bookingRow.getFlight().getId(),
                bookingRow.getFlight().getCode(),

                bookingRow.getFlight()
                        .getRoute()
                        .getOriginSpaceport()
                        .getName(),

                bookingRow.getFlight()
                        .getRoute()
                        .getOriginSpaceport()
                        .getCode(),

                bookingRow.getFlight()
                        .getRoute()
                        .getDestinationSpaceport()
                        .getName(),

                bookingRow.getFlight()
                        .getRoute()
                        .getDestinationSpaceport()
                        .getCode(),

                bookingRow.getFlight().getDepartureTime(),
                bookingRow.getFlight().getArrivalTime(),

                booking.getTotalPrice()
        );
    }
}
