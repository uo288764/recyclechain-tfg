package es.uniovi.recyclechain.backend.controller;

import es.uniovi.recyclechain.backend.dto.ContainerResponse;
import es.uniovi.recyclechain.backend.model.Container;
import es.uniovi.recyclechain.backend.model.User;
import es.uniovi.recyclechain.backend.security.CustomUserDetails;
import es.uniovi.recyclechain.backend.service.ContainerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Container Controller
 *
 * Handles the dual QR scan flow for individual container traceability.
 *
 * Step 1 — POST /api/containers/scan:
 *   User scans the UUID QR printed on the physical container at home.
 *   Container transitions UNSCANNED → SCANNED and is linked to the user.
 *
 * Step 2 — POST /api/recycling/record (with containerId):
 *   User scans the station QR to confirm physical deposit.
 *   Container transitions SCANNED → DEPOSITED and tokens are issued.
 *   This step is handled by RecyclingEventController to keep token
 *   issuance logic in a single place.
 *
 * Base URL: /api/containers
 */
@RestController
@RequestMapping("/api/containers")
public class ContainerController {

    @Autowired
    private ContainerService containerService;

    /**
     * Step 1 of the dual QR flow.
     * Scans a container UUID and links it to the authenticated user's account.
     * The container appears in the user's pending containers list after this call.
     *
     * Returns 404 if the UUID is unknown.
     * Returns 409 if the container has already been scanned or deposited.
     */
    @PostMapping("/scan")
    public ResponseEntity<?> scanContainer(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> body) {

        String uuid = body.get("uuid");
        if (uuid == null || uuid.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "uuid is required"));
        }

        User user = userDetails.getUser();
        Container container = containerService.scanContainer(uuid, user);
        return ResponseEntity.ok(ContainerResponse.from(container));
    }

    /**
     * Returns all containers in SCANNED state for the authenticated user.
     * These are containers registered by the user but not yet physically deposited.
     * Displayed on the MyContainersPage as the pending deposit list.
     */
    @GetMapping("/pending")
    public ResponseEntity<List<ContainerResponse>> getPendingContainers(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        List<ContainerResponse> response = containerService
                .getPendingContainers(user.getId())
                .stream()
                .map(ContainerResponse::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}