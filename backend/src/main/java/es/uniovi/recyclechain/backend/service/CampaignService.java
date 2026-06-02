package es.uniovi.recyclechain.backend.service;

import es.uniovi.recyclechain.backend.model.Campaign;
import es.uniovi.recyclechain.backend.repository.CampaignRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Campaign Service
 *
 * Manages the lifecycle of recycling campaigns.
 * Enforces the state machine: DRAFT → ACTIVE → CLOSED.
 *
 * Key invariant: only one campaign may be in ACTIVE state at any time.
 * Once ACTIVE, no parameters may be modified — this mirrors the immutability
 * guarantees of the blockchain layer and ensures users can verify the rules
 * under which they are participating
 */
@Service
public class CampaignService {

    @Autowired
    private CampaignRepository campaignRepository;

    public List<Campaign> getAllCampaigns() {
        return campaignRepository.findAll();
    }

    public Optional<Campaign> getActiveCampaign() {
        return campaignRepository.findByStatus(Campaign.Status.ACTIVE);
    }

    public Campaign getCampaign(Long id) {
        return campaignRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Campaign not found: " + id));
    }

    /**
     * Creates a new campaign in DRAFT state.
     * All parameters are editable until the campaign is activated.
     */
    public Campaign createCampaign(Campaign campaign) {
        campaign.setStatus(Campaign.Status.DRAFT);
        return campaignRepository.save(campaign);
    }

    /**
     * Updates a campaign that is still in DRAFT state.
     * Throws 409 if the campaign is ACTIVE or CLOSED — parameters are immutable
     * once the campaign has been activated.
     */
    public Campaign updateCampaign(Long id, Campaign updated) {
        Campaign existing = getCampaign(id);

        if (existing.getStatus() != Campaign.Status.DRAFT) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Campaign parameters are immutable once the campaign is active or closed");
        }

        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setStartDate(updated.getStartDate());
        existing.setEndDate(updated.getEndDate());
        existing.setPrizePoolEth(updated.getPrizePoolEth());

        existing.setMultiplierPlastic(updated.getMultiplierPlastic());
        existing.setMultiplierMetal(updated.getMultiplierMetal());
        existing.setMultiplierGlass(updated.getMultiplierGlass());
        existing.setMultiplierPaper(updated.getMultiplierPaper());
        existing.setMultiplierOrganic(updated.getMultiplierOrganic());

        existing.setMilestoneEventsTier1(updated.getMilestoneEventsTier1());
        existing.setMilestoneEventsTier2(updated.getMilestoneEventsTier2());
        existing.setMilestoneEventsTier3(updated.getMilestoneEventsTier3());
        existing.setMilestoneEventsTier4(updated.getMilestoneEventsTier4());
        existing.setMilestoneEventsBonusTier1(updated.getMilestoneEventsBonusTier1());
        existing.setMilestoneEventsBonusTier2(updated.getMilestoneEventsBonusTier2());
        existing.setMilestoneEventsBonusTier3(updated.getMilestoneEventsBonusTier3());
        existing.setMilestoneEventsBonusTier4(updated.getMilestoneEventsBonusTier4());

        existing.setMilestoneWeightTier1(updated.getMilestoneWeightTier1());
        existing.setMilestoneWeightTier2(updated.getMilestoneWeightTier2());
        existing.setMilestoneWeightTier3(updated.getMilestoneWeightTier3());
        existing.setMilestoneWeightTier4(updated.getMilestoneWeightTier4());
        existing.setMilestoneWeightBonusTier1(updated.getMilestoneWeightBonusTier1());
        existing.setMilestoneWeightBonusTier2(updated.getMilestoneWeightBonusTier2());
        existing.setMilestoneWeightBonusTier3(updated.getMilestoneWeightBonusTier3());
        existing.setMilestoneWeightBonusTier4(updated.getMilestoneWeightBonusTier4());

        return campaignRepository.save(existing);
    }

    /**
     * Transitions a campaign from DRAFT to ACTIVE.
     *
     * Preconditions:
     *   - Campaign must be in DRAFT state
     *   - No other campaign may currently be ACTIVE
     *
     * Once activated, parameters are immutable. The activatedAt timestamp
     * serves as the canonical start of the campaign for audit purposes.
     */
    public Campaign activateCampaign(Long id) {
        Campaign campaign = getCampaign(id);

        if (campaign.getStatus() != Campaign.Status.DRAFT) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Only DRAFT campaigns can be activated");
        }

        if (campaignRepository.existsByStatus(Campaign.Status.ACTIVE)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Another campaign is already active");
        }

        campaign.setStatus(Campaign.Status.ACTIVE);
        campaign.setActivatedAt(LocalDateTime.now());
        return campaignRepository.save(campaign);
    }

    /**
     * Transitions a campaign from ACTIVE to CLOSED.
     *
     * Records the closure timestamp. The VRF lottery request and winner
     * resolution are handled in Sprint 8.5 as part of the contract layer.
     */
    public Campaign closeCampaign(Long id) {
        Campaign campaign = getCampaign(id);

        if (campaign.getStatus() != Campaign.Status.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Only ACTIVE campaigns can be closed");
        }

        campaign.setStatus(Campaign.Status.CLOSED);
        campaign.setClosedAt(LocalDateTime.now());
        return campaignRepository.save(campaign);
    }
}