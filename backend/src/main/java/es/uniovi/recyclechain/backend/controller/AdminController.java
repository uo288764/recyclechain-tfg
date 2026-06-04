package es.uniovi.recyclechain.backend.controller;

import es.uniovi.recyclechain.backend.dto.*;
import es.uniovi.recyclechain.backend.model.Campaign;
import es.uniovi.recyclechain.backend.model.ContainerBatch;
import es.uniovi.recyclechain.backend.model.Station;
import es.uniovi.recyclechain.backend.repository.RecyclingEventRepository;
import es.uniovi.recyclechain.backend.repository.StationRepository;
import es.uniovi.recyclechain.backend.service.CampaignService;
import es.uniovi.recyclechain.backend.service.ContainerService;
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
 * Handles station management, campaign lifecycle, container batch
 * creation, global analytics, and QR code generation.
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

    @Autowired
    private CampaignService campaignService;

    @Autowired
    private ContainerService containerService;

    // -------------------------------------------------------------------------
    // Stats
    // -------------------------------------------------------------------------

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

    // -------------------------------------------------------------------------
    // Station management
    // -------------------------------------------------------------------------

    @GetMapping("/stations")
    public ResponseEntity<List<StationResponse>> getAllStations() {
        List<StationResponse> response = stationService.getStations().stream()
                .map(s -> new StationResponse(
                        s.getId(), s.getName(), s.getAddress(),
                        s.getLatitude(), s.getLongitude(),
                        s.getWalletAddress(), s.getIsActive(), s.getCreatedAt()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/stations")
    public ResponseEntity<StationResponse> createStation(
            @Valid @RequestBody StationRequest request) {
        Station station = new Station(
                request.getName(), request.getAddress(),
                request.getLatitude(), request.getLongitude());
        station.setWalletAddress(request.getWalletAddress());
        stationService.addStation(station);

        return ResponseEntity.ok(new StationResponse(
                station.getId(), station.getName(), station.getAddress(),
                station.getLatitude(), station.getLongitude(),
                station.getWalletAddress(), station.getIsActive(), station.getCreatedAt()));
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

        return ResponseEntity.ok(Map.of("qrPayload",
                qrValidationService.generateQRPayload(station)));
    }

    // -------------------------------------------------------------------------
    // Campaign management
    // -------------------------------------------------------------------------

    /**
     * Returns all campaigns in all states (DRAFT, ACTIVE, CLOSED).
     */
    @GetMapping("/campaigns")
    public ResponseEntity<List<CampaignResponse>> getAllCampaigns() {
        List<CampaignResponse> response = campaignService.getAllCampaigns().stream()
                .map(CampaignResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Returns a single campaign by ID.
     */
    @GetMapping("/campaigns/{id}")
    public ResponseEntity<CampaignResponse> getCampaign(@PathVariable Long id) {
        return ResponseEntity.ok(CampaignResponse.from(campaignService.getCampaign(id)));
    }

    /**
     * Creates a new campaign in DRAFT state.
     * The form is pre-filled with defaults from application.properties on the frontend.
     */
    @PostMapping("/campaigns")
    public ResponseEntity<CampaignResponse> createCampaign(
            @Valid @RequestBody CampaignRequest request) {
        Campaign campaign = mapRequestToEntity(request, new Campaign());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CampaignResponse.from(campaignService.createCampaign(campaign)));
    }

    /**
     * Updates a campaign. Only allowed in DRAFT state — returns 409 otherwise.
     */
    @PutMapping("/campaigns/{id}")
    public ResponseEntity<CampaignResponse> updateCampaign(
            @PathVariable Long id,
            @Valid @RequestBody CampaignRequest request) {
        Campaign updated = mapRequestToEntity(request, new Campaign());
        return ResponseEntity.ok(
                CampaignResponse.from(campaignService.updateCampaign(id, updated)));
    }

    /**
     * Transitions a campaign from DRAFT to ACTIVE.
     * Returns 409 if another campaign is already active or if the campaign
     * is not in DRAFT state.
     */
    @PutMapping("/campaigns/{id}/activate")
    public ResponseEntity<CampaignResponse> activateCampaign(@PathVariable Long id) {
        return ResponseEntity.ok(
                CampaignResponse.from(campaignService.activateCampaign(id)));
    }

    /**
     * Transitions a campaign from ACTIVE to CLOSED.
     * VRF lottery execution is handled in Sprint 8.5.
     */
    @PutMapping("/campaigns/{id}/close")
    public ResponseEntity<CampaignResponse> closeCampaign(@PathVariable Long id) {
        return ResponseEntity.ok(
                CampaignResponse.from(campaignService.closeCampaign(id)));
    }

    // -------------------------------------------------------------------------
    // Container batch management
    // -------------------------------------------------------------------------

    /**
     * Returns all batches for a given campaign.
     */
    @GetMapping("/campaigns/{campaignId}/batches")
    public ResponseEntity<List<ContainerBatchResponse>> getBatchesByCampaign(
            @PathVariable Long campaignId) {
        List<ContainerBatchResponse> response =
                containerService.getBatchesByCampaign(campaignId).stream()
                        .map(ContainerBatchResponse::from)
                        .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Creates a ContainerBatch and generates N Container records,
     * each with a unique UUID for printing as a QR code.
     * The associated campaign must be in DRAFT or ACTIVE state.
     */
    @PostMapping("/batches")
    public ResponseEntity<ContainerBatchResponse> createBatch(
            @Valid @RequestBody ContainerBatchRequest request) {
        ContainerBatch batch = new ContainerBatch();
        batch.setBrand(request.getBrand());
        batch.setMaterialType(request.getMaterialType());
        batch.setUnitWeightKg(request.getUnitWeightKg());
        batch.setUnitCount(request.getUnitCount());

        Campaign campaignRef = new Campaign();
        campaignRef.setId(request.getCampaignId());
        batch.setCampaign(campaignRef);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ContainerBatchResponse.from(containerService.createBatch(batch)));
    }

    /**
     * Returns all UUIDs for a batch — used by the admin to generate printable QR codes.
     */
    @GetMapping("/batches/{batchId}/uuids")
    public ResponseEntity<List<String>> getBatchUuids(@PathVariable Long batchId) {
        ContainerBatch batch = containerService.getBatch(batchId);
        List<String> uuids = batch.getContainers().stream()
                .map(c -> c.getUuid())
                .collect(Collectors.toList());
        return ResponseEntity.ok(uuids);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private Campaign mapRequestToEntity(CampaignRequest request, Campaign campaign) {
        campaign.setName(request.getName());
        campaign.setDescription(request.getDescription());
        campaign.setStartDate(request.getStartDate());
        campaign.setEndDate(request.getEndDate());
        campaign.setPrizePoolEth(request.getPrizePoolEth());

        campaign.setMultiplierPlastic(request.getMultiplierPlastic());
        campaign.setMultiplierMetal(request.getMultiplierMetal());
        campaign.setMultiplierGlass(request.getMultiplierGlass());
        campaign.setMultiplierPaper(request.getMultiplierPaper());
        campaign.setMultiplierOrganic(request.getMultiplierOrganic());

        campaign.setMilestoneEventsTier1(request.getMilestoneEventsTier1());
        campaign.setMilestoneEventsTier2(request.getMilestoneEventsTier2());
        campaign.setMilestoneEventsTier3(request.getMilestoneEventsTier3());
        campaign.setMilestoneEventsTier4(request.getMilestoneEventsTier4());
        campaign.setMilestoneEventsBonusTier1(request.getMilestoneEventsBonusTier1());
        campaign.setMilestoneEventsBonusTier2(request.getMilestoneEventsBonusTier2());
        campaign.setMilestoneEventsBonusTier3(request.getMilestoneEventsBonusTier3());
        campaign.setMilestoneEventsBonusTier4(request.getMilestoneEventsBonusTier4());

        campaign.setMilestoneWeightTier1(request.getMilestoneWeightTier1());
        campaign.setMilestoneWeightTier2(request.getMilestoneWeightTier2());
        campaign.setMilestoneWeightTier3(request.getMilestoneWeightTier3());
        campaign.setMilestoneWeightTier4(request.getMilestoneWeightTier4());
        campaign.setMilestoneWeightBonusTier1(request.getMilestoneWeightBonusTier1());
        campaign.setMilestoneWeightBonusTier2(request.getMilestoneWeightBonusTier2());
        campaign.setMilestoneWeightBonusTier3(request.getMilestoneWeightBonusTier3());
        campaign.setMilestoneWeightBonusTier4(request.getMilestoneWeightBonusTier4());

        return campaign;
    }
}