package es.uniovi.recyclechain.backend.controller;

import es.uniovi.recyclechain.backend.dto.StationRequest;
import es.uniovi.recyclechain.backend.dto.StationResponse;
import es.uniovi.recyclechain.backend.model.Station;
import es.uniovi.recyclechain.backend.repository.RecyclingEventRepository;
import es.uniovi.recyclechain.backend.repository.StationRepository;
import es.uniovi.recyclechain.backend.service.StationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private StationService stationService;

    @Autowired
    private RecyclingEventRepository recyclingEventRepository;

    @Autowired
    private StationRepository stationRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getGlobalStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEvents",    recyclingEventRepository.countAllEvents());
        stats.put("totalWeightKg",  recyclingEventRepository.sumAllWeight());
        stats.put("totalTokens",    recyclingEventRepository.sumAllTokens());
        stats.put("activeUsers",    recyclingEventRepository.countActiveUsers());
        stats.put("totalStations",  stationRepository.count());
        stats.put("activeStations", stationRepository.countByIsActiveTrue());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stations")
    public ResponseEntity<List<StationResponse>> getAllStations() {
        List<Station> stations = stationService.getStations();

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

    @PostMapping("/stations")
    public ResponseEntity<StationResponse> createStation(@Valid @RequestBody StationRequest request) {
        Station station = new Station(
            request.getName(),
            request.getAddress(),
            request.getLatitude(),
            request.getLongitude()
        );
        station.setWalletAddress(request.getWalletAddress());

        stationService.addStation(station);

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

    @PutMapping("/stations/{id}/activate")
    public ResponseEntity<Void> activateStation(@PathVariable Long id) {
        stationService.activateStation(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/stations/{id}/deactivate")
    public ResponseEntity<Void> deactivateStation(@PathVariable Long id) {
        stationService.deactivateStation(id);
        return ResponseEntity.noContent().build();
    }
}