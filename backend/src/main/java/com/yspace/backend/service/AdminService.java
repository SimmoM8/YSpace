package com.yspace.backend.service;

import com.yspace.backend.dto.admin.AdminBookingResponseDto;
import com.yspace.backend.dto.admin.AdminBookingRowResponseDto;
import com.yspace.backend.dto.admin.AdminSpaceportResponseDto;
import com.yspace.backend.dto.admin.AdminUserResponseDto;
import com.yspace.backend.model.Booking;
import com.yspace.backend.model.BookingRow;
import com.yspace.backend.model.Role;
import com.yspace.backend.model.Spaceport;
import com.yspace.backend.model.User;
import com.yspace.backend.repository.BookingRepository;
import com.yspace.backend.repository.SpaceportRepository;
import com.yspace.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final SpaceportRepository spaceportRepository;

    @Transactional(readOnly = true)
    public List<AdminBookingResponseDto> getBookings(String search) {
        return bookingRepository.findAll()
                .stream()
                .filter(booking -> matchesBookingSearch(booking, search))
                .sorted(
                        Comparator.comparing(
                                Booking::getCreatedAt,
                                Comparator.nullsLast(Comparator.naturalOrder())
                        ).reversed()
                )
                .map(this::toBookingDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponseDto> getUsers(String search) {
        return userRepository.findAll()
                .stream()
                .filter(user -> user.getRole() == Role.SPACE_TOURIST)
                .filter(user -> matchesUserSearch(user, search))
                .map(this::toUserDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminSpaceportResponseDto> getSpaceports() {
        return spaceportRepository.findAll()
                .stream()
                .map(this::toSpaceportDto)
                .toList();
    }

    private AdminBookingResponseDto toBookingDto(Booking booking) {
        List<AdminBookingRowResponseDto> rows = booking.getBookingRows()
                .stream()
                .map(this::toBookingRowDto)
                .toList();

        return new AdminBookingResponseDto(
                booking.getId(),
                getFullName(booking.getUser()),
                booking.getUser().getEmail(),
                booking.getStatus().name(),
                booking.getTotalPrice(),
                getFirstDepartureTime(booking),
                booking.getCreatedAt(),
                rows
        );
    }

    private AdminBookingRowResponseDto toBookingRowDto(
            BookingRow bookingRow
    ) {
        var flight = bookingRow.getFlight();

        return new AdminBookingRowResponseDto(
                bookingRow.getId(),
                flight.getId(),
                flight.getCode(),
                flight.getRoute().getName(),
                flight.getRoute().getOriginSpaceport().getCode(),
                flight.getRoute().getDestinationSpaceport().getCode()
        );
    }

    private AdminUserResponseDto toUserDto(User user) {
        long openBookings = user.getBookings()
                .stream()
                .filter(
                        booking ->
                                booking.getStatus()
                                        == Booking.BookingStatus.OPEN
                )
                .count();

        return new AdminUserResponseDto(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().name(),
                user.getBookings().size(),
                openBookings,
                user.getCreatedAt()
        );
    }

    private AdminSpaceportResponseDto toSpaceportDto(
            Spaceport spaceport
    ) {
        return new AdminSpaceportResponseDto(
                spaceport.getId(),
                spaceport.getName(),
                spaceport.getCode(),
                spaceport.getType() != null
                        ? spaceport.getType().name()
                        : null,
                spaceport.getDescription(),
                spaceport.getImageUrl()
        );
    }

    private java.time.LocalDateTime getFirstDepartureTime(
            Booking booking
    ) {
        return booking.getBookingRows()
                .stream()
                .map(BookingRow::getFlight)
                .map(flight -> flight.getDepartureTime())
                .filter(java.util.Objects::nonNull)
                .min(java.time.LocalDateTime::compareTo)
                .orElse(null);
    }

    private boolean matchesBookingSearch(
            Booking booking,
            String search
    ) {
        if (search == null || search.isBlank()) {
            return true;
        }

        String keyword = search.trim()
                .toLowerCase(Locale.ROOT);

        if (
                String.valueOf(booking.getId()).contains(keyword)
                        || contains(booking.getStatus().name(), keyword)
                        || contains(booking.getUser().getFirstName(), keyword)
                        || contains(booking.getUser().getLastName(), keyword)
                        || contains(booking.getUser().getEmail(), keyword)
        ) {
            return true;
        }

        return booking.getBookingRows()
                .stream()
                .anyMatch(row ->
                        contains(row.getFlight().getCode(), keyword)
                                || contains(
                                row.getFlight()
                                        .getRoute()
                                        .getName(),
                                keyword
                        )
                                || contains(
                                row.getFlight()
                                        .getRoute()
                                        .getOriginSpaceport()
                                        .getCode(),
                                keyword
                        )
                                || contains(
                                row.getFlight()
                                        .getRoute()
                                        .getDestinationSpaceport()
                                        .getCode(),
                                keyword
                        )
                );
    }

    private boolean matchesUserSearch(
            User user,
            String search
    ) {
        if (search == null || search.isBlank()) {
            return true;
        }

        String keyword = search.trim()
                .toLowerCase(Locale.ROOT);

        return contains(user.getFirstName(), keyword)
                || contains(user.getLastName(), keyword)
                || contains(user.getEmail(), keyword);
    }

    private boolean contains(
            String value,
            String keyword
    ) {
        return value != null
                && value.toLowerCase(Locale.ROOT)
                .contains(keyword);
    }

    private String getFullName(User user) {
        return user.getFirstName() + " " + user.getLastName();
    }
}
