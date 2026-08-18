package com.yspace.backend.mapper;

import com.yspace.backend.dto.FlightSearchResponseDto;
import com.yspace.backend.model.Flight;
import org.springframework.stereotype.Component;

@Component
public class FlightMapper {

    public FlightSearchResponseDto toSearchDto(Flight flight){
       return new com.yspace.backend.dto.FlightSearchResponseDto(
               flight.getCode(),
               flight.getRoute().getName(),
               flight.getSpacecraft().getName(),
               flight.getBasePrice(),
               flight.getDepartureTime(),
               flight.getArrivalTime()


       );
    }

}

