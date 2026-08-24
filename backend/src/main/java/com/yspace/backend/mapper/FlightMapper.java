package com.yspace.backend.mapper;

import com.yspace.backend.dto.flight.FlightDetailsResponseDto;
import com.yspace.backend.dto.flight.FlightSearchResponseDto;
import com.yspace.backend.model.Flight;
import org.springframework.stereotype.Component;

@Component
public class FlightMapper {


    public FlightSearchResponseDto toSearchDto(Flight flight) {
        return new FlightSearchResponseDto(
                flight.getId(),
                flight.getCode(),

                flight.getRoute().getOriginSpaceport().getName(),
                flight.getRoute().getOriginSpaceport().getCode(),

                flight.getRoute().getDestinationSpaceport().getName(),
                flight.getRoute().getDestinationSpaceport().getCode(),

                flight.getSpacecraft().getName(),

                flight.getBasePrice(),
                flight.getDepartureTime(),
                flight.getArrivalTime()
        );
    }

    public FlightDetailsResponseDto toDetailsDto(Flight flight) {
        return new FlightDetailsResponseDto(
                flight.getId(),
                flight.getCode(),

                flight.getStatus().name(),
                flight.getDelayed(),

                flight.getRoute().getName(),
                flight.getRoute().getDescription(),
                flight.getRoute().getDistance(),

                flight.getRoute().getOriginSpaceport().getName(),
                flight.getRoute().getOriginSpaceport().getCode(),
                flight.getRoute().getOriginSpaceport().getType().name(),
                flight.getRoute().getOriginSpaceport().getDescription(),

                flight.getRoute().getDestinationSpaceport().getName(),
                flight.getRoute().getDestinationSpaceport().getCode(),
                flight.getRoute().getDestinationSpaceport().getType().name(),
                flight.getRoute().getDestinationSpaceport().getDescription(),

                flight.getSpacecraft().getName(),
                flight.getSpacecraft().getModel().getName(),
                flight.getSpacecraft().getModel().getManufacturer(),

                flight.getBasePrice(),
                flight.getDepartureTime(),
                flight.getArrivalTime()
        );
    }
}
