package com.yspace.backend.service;

import com.yspace.backend.dto.admin.AdminBookingResponseDto;
import com.yspace.backend.dto.admin.AdminBookingRowResponseDto;
import com.yspace.backend.dto.admin.AdminSpaceportResponseDto;
import com.yspace.backend.dto.admin.AdminUserResponseDto;
import com.yspace.backend.dto.booking.UpdateAdminBookingRequestDto;
import com.yspace.backend.dto.spaceport.CreateSpaceportRequestDto;
import com.yspace.backend.dto.spaceport.UpdateSpaceportRequestDto;
import com.yspace.backend.dto.user.UpdateAdminUserRequestDto;
import com.yspace.backend.exceptions.BookingNotFoundException;
import com.yspace.backend.exceptions.SpaceportNotFoundException;
import com.yspace.backend.exceptions.UserNotFoundException;
import com.yspace.backend.model.Booking;
import com.yspace.backend.model.BookingRow;
import com.yspace.backend.model.Spaceport;
import com.yspace.backend.model.User;
import com.yspace.backend.repository.BookingRepository;
import com.yspace.backend.repository.SpaceportRepository;
import com.yspace.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final SpaceportRepository spaceportRepository;

    /* ============================================================
       BOOKINGS
    ============================================================ */

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
    public AdminBookingResponseDto getBookingById(Integer id) {
        return toBookingDto(getBooking(id));
    }

    @Transactional
    public AdminBookingResponseDto updateBooking(
            Integer id,
            UpdateAdminBookingRequestDto request
    ) {
        Booking booking = getBooking(id);
        Booking.BookingStatus currentStatus = booking.getStatus();
        Booking.BookingStatus newStatus = request.getStatus();

        validateAdminBookingStatusChange(currentStatus, newStatus);

        booking.setStatus(newStatus);

        return toBookingDto(bookingRepository.save(booking));
    }

    /* ============================================================
       USERS
    ============================================================ */

    @Transactional(readOnly = true)
    public List<AdminUserResponseDto> getUsers(String search) {
        return userRepository.findAll()
                .stream()
                .filter(user -> matchesUserSearch(user, search))
                .map(this::toUserDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminUserResponseDto getUserById(Integer id) {
        return toUserDto(getUser(id));
    }

    @Transactional
    public AdminUserResponseDto updateUser(
            Integer id,
            UpdateAdminUserRequestDto request
    ) {
        User user = getUser(id);
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw new IllegalArgumentException(
                    "A user with this email already exists"
            );
        }

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(email);
        user.setRole(request.getRole());

        return toUserDto(userRepository.save(user));
    }

    /* ============================================================
       SPACEPORTS
    ============================================================ */

    @Transactional(readOnly = true)
    public List<AdminSpaceportResponseDto> getSpaceports() {
        return spaceportRepository.findAll()
                .stream()
                .map(this::toSpaceportDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminSpaceportResponseDto getSpaceportById(Integer id) {
        return toSpaceportDto(getSpaceport(id));
    }

    @Transactional
    public AdminSpaceportResponseDto createSpaceport(
            CreateSpaceportRequestDto request
    ) {
        String code = normaliseSpaceportCode(request.getCode());

        if (spaceportRepository.existsByCodeIgnoreCase(code)) {
            throw new IllegalArgumentException(
                    "A spaceport with this code already exists"
            );
        }

        Spaceport spaceport = Spaceport.builder()
                .name(request.getName().trim())
                .code(code)
                .type(request.getType())
                .description(trimToNull(request.getDescription()))
                .imageUrl(trimToNull(request.getImageUrl()))
                .build();

        return toSpaceportDto(spaceportRepository.save(spaceport));
    }

    @Transactional
    public AdminSpaceportResponseDto updateSpaceport(
            Integer id,
            UpdateSpaceportRequestDto request
    ) {
        Spaceport spaceport = getSpaceport(id);
        String code = normaliseSpaceportCode(request.getCode());

        if (spaceportRepository.existsByCodeIgnoreCaseAndIdNot(code, id)) {
            throw new IllegalArgumentException(
                    "A spaceport with this code already exists"
            );
        }

        spaceport.setName(request.getName().trim());
        spaceport.setCode(code);
        spaceport.setType(request.getType());
        spaceport.setDescription(trimToNull(request.getDescription()));
        spaceport.setImageUrl(trimToNull(request.getImageUrl()));

        return toSpaceportDto(spaceportRepository.save(spaceport));
    }

    /* ============================================================
       MAPPING
    ============================================================ */

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

    private AdminBookingRowResponseDto toBookingRowDto(BookingRow bookingRow) {
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
                .filter(booking -> booking.getStatus() == Booking.BookingStatus.OPEN)
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

    private AdminSpaceportResponseDto toSpaceportDto(Spaceport spaceport) {
        return new AdminSpaceportResponseDto(
                spaceport.getId(),
                spaceport.getName(),
                spaceport.getCode(),
                spaceport.getType() != null ? spaceport.getType().name() : null,
                spaceport.getDescription(),
                spaceport.getImageUrl()
        );
    }

    /* ============================================================
       LOOKUPS / VALIDATION
    ============================================================ */

    private Booking getBooking(Integer id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException(id));
    }

    private User getUser(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    private Spaceport getSpaceport(Integer id) {
        return spaceportRepository.findById(id)
                .orElseThrow(() -> new SpaceportNotFoundException(id));
    }

    private void validateAdminBookingStatusChange(
            Booking.BookingStatus currentStatus,
            Booking.BookingStatus newStatus
    ) {
        if (currentStatus == newStatus) {
            return;
        }

        if (currentStatus != Booking.BookingStatus.OPEN) {
            throw new IllegalArgumentException(
                    "Closed or cancelled bookings cannot be reopened or changed"
            );
        }

        if (
                newStatus != Booking.BookingStatus.CLOSED &&
                newStatus != Booking.BookingStatus.CANCELLED
        ) {
            throw new IllegalArgumentException(
                    "Open bookings can only be closed or cancelled"
            );
        }
    }

    private LocalDateTime getFirstDepartureTime(Booking booking) {
        return booking.getBookingRows()
                .stream()
                .map(BookingRow::getFlight)
                .map(flight -> flight.getDepartureTime())
                .filter(Objects::nonNull)
                .min(LocalDateTime::compareTo)
                .orElse(null);
    }

    private String normaliseSpaceportCode(String code) {
        return code.trim().toUpperCase(Locale.ROOT);
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    /* ============================================================
       SEARCH
    ============================================================ */

    private boolean matchesBookingSearch(Booking booking, String search) {
        if (search == null || search.isBlank()) {
            return true;
        }

        String keyword = search.trim().toLowerCase(Locale.ROOT);

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
                                || contains(row.getFlight().getRoute().getName(), keyword)
                                || contains(row.getFlight().getRoute().getOriginSpaceport().getCode(), keyword)
                                || contains(row.getFlight().getRoute().getDestinationSpaceport().getCode(), keyword)
                );
    }

    private boolean matchesUserSearch(User user, String search) {
        if (search == null || search.isBlank()) {
            return true;
        }

        String keyword = search.trim().toLowerCase(Locale.ROOT);

        return contains(user.getFirstName(), keyword)
                || contains(user.getLastName(), keyword)
                || contains(user.getEmail(), keyword);
    }

    private boolean contains(String value, String keyword) {
        return value != null
                && value.toLowerCase(Locale.ROOT).contains(keyword);
    }

    private String getFullName(User user) {
        return user.getFirstName() + " " + user.getLastName();
    }
}
