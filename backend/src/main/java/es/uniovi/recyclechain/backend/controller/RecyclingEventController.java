package es.uniovi.recyclechain.backend.controller;

import es.uniovi.recyclechain.backend.dto.RecyclingEventRequest;
import es.uniovi.recyclechain.backend.dto.RecyclingEventResponse;
import es.uniovi.recyclechain.backend.model.RecyclingEvent;
import es.uniovi.recyclechain.backend.model.Station;
import es.uniovi.recyclechain.backend.model.User;
import es.uniovi.recyclechain.backend.security.CustomUserDetails;
import es.uniovi.recyclechain.backend.service.RecyclingEventService;
import es.uniovi.recyclechain.backend.service.StationService;
import es.uniovi.recyclechain.backend.validator.RecyclingEventValidator;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Recycling Event Controller
 *
 * Handles all REST endpoints related to recycling events, including:
 * - Recording new recycling events
 * - Retrieving user recycling history
 * - Displaying user statistics and achievements
 *
 * All endpoints require authentication (JWT token).
 * Only users with ROLE_USER or ROLE_ADMIN can access these endpoints.
 *
 * Base URL: /api/recycling
 *
 * @author Carlos
 * @version 1.0
 * @since Sprint 3
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

    /**
     * Get recycling history for the authenticated user
     * Returns all recycling events ordered by date (newest first)
     *
     * @param userDetails Authenticated user details
     * @return List of recycling events with full details
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
     * Record a new recycling event
     * Validates the event, calculates tokens with bonuses, and saves to database
     *
     * @param userDetails Authenticated user details
     * @param request Recycling event details (station, weight, material type)
     * @param result Validation result
     * @return Created recycling event with calculated tokens
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

        // Service calculates tokens with all bonuses applied
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
     * Get comprehensive statistics for the authenticated user
     * Includes:
     * - Total events, weight, and tokens
     * - Current multipliers (event and weight bonuses)
     * - Achievement tiers (internationalized)
     *
     * @param userDetails Authenticated user details
     * @return User statistics with achievements
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