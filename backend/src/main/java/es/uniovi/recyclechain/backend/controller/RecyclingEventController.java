package es.uniovi.recyclechain.backend.controller;

import es.uniovi.recyclechain.backend.dto.RecyclingEventRequest;
import es.uniovi.recyclechain.backend.dto.RecyclingEventResponse;
import es.uniovi.recyclechain.backend.model.RecyclingEvent;
import es.uniovi.recyclechain.backend.model.Station;
import es.uniovi.recyclechain.backend.model.User;
import es.uniovi.recyclechain.backend.security.CustomUserDetails;
import es.uniovi.recyclechain.backend.service.QRValidationService;
import es.uniovi.recyclechain.backend.service.RecyclingEventService;
import es.uniovi.recyclechain.backend.service.StationService;
import es.uniovi.recyclechain.backend.validator.RecyclingEventValidator;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Recycling Event Controller
 *
 * Handles all REST endpoints related to recycling events, including:
 * - Recording new recycling events (with QR fraud prevention)
 * - Retrieving user recycling history
 * - Displaying user statistics and achievements
 *
 * The /record endpoint validates the scanned QR payload via HMAC-SHA256
 * before processing the recycling event, satisfying FR-06, FR-21, FR-22.
 *
 * Base URL: /api/recycling
 */
@RestController
@RequestMapping("/api/recycling")
public class RecyclingEventController {

    @Autowired
    private RecyclingEventService recyclingEventService;

    @Autowired
    private StationService stationService;

    @Autowired
    private RecyclingEventValidator recyclingEventValidator;

    @Autowired
    private QRValidationService qrValidationService;

    /**
     * Get recycling history for the authenticated user.
     */
    @GetMapping("/history")
    public ResponseEntity<List<RecyclingEventResponse>> getHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User user = userDetails.getUser();
        List<RecyclingEvent> events = recyclingEventService.getRecyclingEventsByUser(user);

        List<RecyclingEventResponse> response = events.stream()
                .map(event -> new RecyclingEventResponse(
                        event.getId(),
                        event.getUser().getId(),
                        event.getUser().getName(),
                        event.getStation().getId(),
                        event.getStation().getName(),
                        event.getWeight(),
                        event.getMaterialType(),
                        event.getTokensEarned(),
                        event.getTransactionHash(),
                        event.getCreatedAt()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Record a new recycling event.
     *
     * Validation order:
     *   1. Bean validation (@Valid) on request fields
     *   2. Custom validator (RecyclingEventValidator)
     *   3. Station existence and active status
     *   4. QR payload HMAC-SHA256 validation + single-use check (FR-06, FR-21, FR-22)
     *   5. Gamification engine + persistence
     */
    @PostMapping("/record")
    public ResponseEntity<?> recordEvent(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody RecyclingEventRequest request,
            BindingResult result
    ) {
        recyclingEventValidator.validate(request, result);

        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(result.getAllErrors());
        }

        User user = userDetails.getUser();
        Station station = stationService.getStation(request.getStationId());

        if (station == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Station not found"));
        }

        if (!Boolean.TRUE.equals(station.getIsActive())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Station is not active"));
        }

        // QR validation: HMAC-SHA256 + time window + single-use (FR-06, FR-21, FR-22)
        boolean qrValid = qrValidationService.validateAndConsume(
                request.getQrPayload(), station
        );

        if (!qrValid) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(Map.of("error", "Invalid or expired QR code"));
        }

        RecyclingEvent event = recyclingEventService.addRecyclingEvent(
                user,
                station,
                request.getWeight(),
                request.getMaterialType(),
                request.getTransactionHash()
        );

        RecyclingEventResponse response = new RecyclingEventResponse(
                event.getId(),
                event.getUser().getId(),
                event.getUser().getName(),
                event.getStation().getId(),
                event.getStation().getName(),
                event.getWeight(),
                event.getMaterialType(),
                event.getTokensEarned(),
                event.getTransactionHash(),
                event.getCreatedAt()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Get comprehensive statistics for the authenticated user.
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        RecyclingEventService.UserStats stats = recyclingEventService.getUserStats(user.getId());

        return ResponseEntity.ok(new Object() {
            public final int totalEvents = stats.totalEvents();
            public final Double totalKg = stats.totalWeight();
            public final Double totalTokensEarned = stats.totalTokens();
            public final Double eventMultiplier = stats.currentEventBonus();
            public final Double weightMultiplier = stats.currentWeightBonus();
            public final String eventTier = recyclingEventService.getEventTier(stats.totalEvents());
            public final String weightTier = recyclingEventService.getWeightTier(stats.totalWeight());
        });
    }
}