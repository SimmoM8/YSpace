package com.yspace.backend.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import java.math.BigDecimal;

public class BookingRow {

    private Long id;

    @ManyToOne
    @JoinColumn(nullable = false, name = "booking_id")
    private Booking booking;

    @ManyToOne
    @JoinColumn(name = "flight_id", nullable = false)
    private Flight flight;

    @ManyToOne
    @JoinColumn(name = "seat_number_id", nullable = false)
    private SeatNumber seatNumber;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
}
