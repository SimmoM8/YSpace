package com.yspace.backend.mapper;

import com.yspace.backend.dto.FlightSearchResponseDto;
import com.yspace.backend.model.Flight;
import org.springframework.stereotype.Component;

@Component
public class FlightMapper {

    public FlightSearchResponseDto toSearchDto(Flight flight) {
        return new FlightSearchResponseDto(
                flight.getId(),
                flight.getCode(),
                flight.getRoute().getName(),

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
}
