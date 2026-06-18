package es.uniovi.recyclechain.backend.controller;

import es.uniovi.recyclechain.backend.dto.CampaignResponse;
import es.uniovi.recyclechain.backend.service.CampaignService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Campaign Controller
 *
 * Exposes public endpoints for campaign data accessible to all authenticated
 * users and one unauthenticated endpoint for the active campaign.
 *
 * Admin campaign management endpoints (CRUD, activate, close) live in
 * AdminController to keep ROLE_ADMIN operations in a single place.
 *
 * Base URL: /api/campaigns
 */
@RestController
@RequestMapping("/api/campaigns")
public class CampaignController {

    @Autowired
    private CampaignService campaignService;

    /**
     * Returns the currently active campaign.
     * Public endpoint — no authentication required.
     * Used by CampaignPage to display rules and parameters to all users.
     * Returns 404 if no campaign is currently active.
     */
    @GetMapping("/active")
    public ResponseEntity<CampaignResponse> getActiveCampaign() {
        return campaignService.getActiveCampaign()
                .map(campaign -> ResponseEntity.ok(CampaignResponse.from(campaign)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}