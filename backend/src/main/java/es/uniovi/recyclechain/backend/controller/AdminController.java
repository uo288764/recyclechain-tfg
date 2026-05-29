package es.uniovi.recyclechain.backend.controller;

import es.uniovi.recyclechain.backend.dto.StationRequest;
import es.uniovi.recyclechain.backend.dto.StationResponse;
import es.uniovi.recyclechain.backend.model.Station;
import es.uniovi.recyclechain.backend.repository.RecyclingEventRepository;
import es.uniovi.recyclechain.backend.repository.StationRepository;
import es.uniovi.recyclechain.backend.service.QRValidationService;
import es.uniovi.recyclechain.backend.service.StationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Admin Controller
 *
 * Exposes administration endpoints restricted to ROLE_ADMIN.
 * Handles station management, global analytics, and QR code generation.
 *
 * Base URL: /api/admin
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private StationService stationService;

    @Autowired
    private RecyclingEventRepository recyclingEventRepository;

    @Autowired
    private StationRepository stationRepository;

    @Autowired
    private QRValidationService qrValidationService;

    /**
     * Returns global system statistics for the admin dashboard (FR-19).
     */
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

    /**
     * Returns all stations (active and inactive) for admin management.
     */
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

    /**
     * Creates a new recycling station.
     * The station secretKey is generated automatically in Station.onCreate().
     */
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

    /**
     * Generates the current QR payload for a given station.
     *
     * The payload is valid for the current time window (configurable via
     * qr.window.seconds in application.properties, default 5 minutes).
     * Once scanned and used by a user, it cannot be reused (FR-21).
     *
     * This endpoint is intended for physical display at the station
     * (e.g. printed QR, screen at the station entrance).
     * The payload itself is not a secret — its security relies on the
     * HMAC-SHA256 signature that only the backend can verify.
     *
     * @param id the station database ID
     * @return JSON with the QR payload string
     */
    @GetMapping("/stations/{id}/qr")
    public ResponseEntity<Map<String, String>> getStationQR(@PathVariable Long id) {
        Station station = stationService.getStation(id);

        if (station == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        if (!Boolean.TRUE.equals(station.getIsActive())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Station is not active"));
        }

        String payload = qrValidationService.generateQRPayload(station);
        return ResponseEntity.ok(Map.of("qrPayload", payload));
    }
}