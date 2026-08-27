package com.yspace.backend.mapper;

import com.yspace.backend.dto.booking.BookingDetailsResponseDto;
import com.yspace.backend.dto.booking.BookingRowDetailsResponseDto;
import com.yspace.backend.dto.booking.BookingRowSummaryResponseDto;
import com.yspace.backend.dto.booking.BookingSummaryResponseDto;
import com.yspace.backend.dto.booking.AdminBookingSummaryResponseDto;
import com.yspace.backend.model.Booking;
import com.yspace.backend.model.BookingRow;
import com.yspace.backend.model.Flight;
import org.springframework.stereotype.Component;

@Component
public class BookingMapper {

    public BookingSummaryResponseDto toSummaryDto(Booking booking) {

        BookingRow firstRow = booking.getBookingRows().getFirst();
        Flight flight = firstRow.getFlight();

        return new BookingSummaryResponseDto(
                booking.getId(),
                booking.getStatus().name(),

                flight.getRoute().getName(),

                flight.getDepartureTime(),

                booking.getTotalPrice(),

                booking.getCreatedAt()
        );
    }

    public AdminBookingSummaryResponseDto toAdminSummaryDto(Booking booking) {

        BookingRow firstRow = booking.getBookingRows().getFirst();
        Flight flight = firstRow.getFlight();

        return new AdminBookingSummaryResponseDto(
                booking.getId(),
                booking.getStatus().name(),

                booking.getUser().getEmail(),
                booking.getUser().getFirstName(),
                booking.getUser().getLastName(),

                flight.getRoute().getName(),

                flight.getDepartureTime(),

                booking.getTotalPrice(),

                booking.getCreatedAt()
        );
    }

    public BookingDetailsResponseDto toDetailsDto(Booking booking) {
        return new BookingDetailsResponseDto(
                booking.getId(),
                booking.getStatus().name(),

                booking.getTotalPrice(),

                booking.getCreatedAt(),
                booking.getUpdatedAt(),

                booking.getBookingRows()
                        .stream()
                        .map(this::toRowSummaryDto)
                        .toList()
        );
    }

    public BookingRowSummaryResponseDto toRowSummaryDto(
            BookingRow bookingRow
    ) {
        Flight flight = bookingRow.getFlight();

        return new BookingRowSummaryResponseDto(
                bookingRow.getId(),

                flight.getId(),
                flight.getCode(),

                flight.getRoute().getName(),

                flight.getRoute()
                        .getOriginSpaceport()
                        .getName(),

                flight.getRoute()
                        .getOriginSpaceport()
                        .getCode(),

                flight.getRoute()
                        .getDestinationSpaceport()
                        .getName(),

                flight.getRoute()
                        .getDestinationSpaceport()
                        .getCode(),

                flight.getDepartureTime(),
                flight.getArrivalTime(),

                bookingRow.getPrice()
        );
    }

    public BookingRowDetailsResponseDto toRowDetailsDto(
            BookingRow bookingRow
    ) {
        Flight flight = bookingRow.getFlight();

        return new BookingRowDetailsResponseDto(
                bookingRow.getId(),
                bookingRow.getPrice(),

                flight.getId(),
                flight.getCode(),
                flight.getStatus().name(),
                flight.getDelayed(),

                flight.getRoute().getName(),
                flight.getRoute().getDescription(),
                flight.getRoute().getDistance(),

                flight.getRoute()
                        .getOriginSpaceport()
                        .getName(),

                flight.getRoute()
                        .getOriginSpaceport()
                        .getCode(),

                flight.getRoute()
                        .getOriginSpaceport()
                        .getType()
                        .name(),

                flight.getRoute()
                        .getOriginSpaceport()
                        .getDescription(),

                flight.getRoute()
                        .getDestinationSpaceport()
                        .getName(),

                flight.getRoute()
                        .getDestinationSpaceport()
                        .getCode(),

                flight.getRoute()
                        .getDestinationSpaceport()
                        .getType()
                        .name(),

                flight.getRoute()
                        .getDestinationSpaceport()
                        .getDescription(),

                flight.getSpacecraft().getName(),
                flight.getSpacecraft().getModel().getName(),
                flight.getSpacecraft().getModel().getManufacturer(),

                flight.getDepartureTime(),
                flight.getArrivalTime()
        );
    }
}
