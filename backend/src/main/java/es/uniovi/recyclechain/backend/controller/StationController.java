package es.uniovi.recyclechain.backend.controller;

import es.uniovi.recyclechain.backend.dto.StationResponse;
import es.uniovi.recyclechain.backend.model.Station;
import es.uniovi.recyclechain.backend.service.StationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stations")
public class StationController {

    @Autowired
    private StationService stationService;

    @GetMapping("/active")
    public ResponseEntity<List<StationResponse>> getActiveStations() {
        List<Station> stations = stationService.getActiveStations();
        
        List<StationResponse> response = stations.stream()
            .map(station -> new StationResponse(
                station.getId(),
                station.getName(),
                station.getAddress(),
                station.getLatitude(),
                station.getLongitude(),
                station.getWalletAddress(),
                station.getIsActive(),
                station.getCreatedAt()
            ))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StationResponse> getStation(@PathVariable Long id) {
        Station station = stationService.getStation(id);
        
        if (station == null) {
            return ResponseEntity.notFound().build();
        }

        StationResponse response = new StationResponse(
            station.getId(),
            station.getName(),
            station.getAddress(),
            station.getLatitude(),
            station.getLongitude(),
            station.getWalletAddress(),
            station.getIsActive(),
            station.getCreatedAt()
        );
        
        return ResponseEntity.ok(response);
    }
}