package com.yspace.backend.model;

public class SeatNumber {
    private Long id;
    private Spacecraft spacecraft;
    private String number;
    private SeatClass seatClass;
    protected enum SeatClass {
        ECONOMY,
        BUSINESS,
        FIRST,
    }
    private String description;
}
