package es.uniovi.recyclechain.backend.dto;

import es.uniovi.recyclechain.backend.model.Campaign;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for Campaign responses.
 * Exposes all campaign parameters so users and admins can verify
 * the rules under which recycling events are being rewarded.
 * The parameterHash field (Sprint 8.5) will allow on-chain verification.
 */
@Data
public class CampaignResponse {

    private Long id;
    private String name;
    private String description;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;

    // Material multipliers
    private Double multiplierPlastic;
    private Double multiplierMetal;
    private Double multiplierGlass;
    private Double multiplierPaper;
    private Double multiplierOrganic;

    // Event milestone thresholds and bonuses
    private Integer milestoneEventsTier1;
    private Integer milestoneEventsTier2;
    private Integer milestoneEventsTier3;
    private Integer milestoneEventsTier4;
    private Double milestoneEventsBonusTier1;
    private Double milestoneEventsBonusTier2;
    private Double milestoneEventsBonusTier3;
    private Double milestoneEventsBonusTier4;

    // Weight milestone thresholds and bonuses
    private Double milestoneWeightTier1;
    private Double milestoneWeightTier2;
    private Double milestoneWeightTier3;
    private Double milestoneWeightTier4;
    private Double milestoneWeightBonusTier1;
    private Double milestoneWeightBonusTier2;
    private Double milestoneWeightBonusTier3;
    private Double milestoneWeightBonusTier4;

    // Lottery fields
    private Double prizePoolEth;
    private String parameterHash;
    private String winnerAddress;

    // Audit timestamps
    private LocalDateTime createdAt;
    private LocalDateTime activatedAt;
    private LocalDateTime closedAt;

    public static CampaignResponse from(Campaign c) {
        CampaignResponse dto = new CampaignResponse();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setDescription(c.getDescription());
        dto.setStatus(c.getStatus().name());
        dto.setStartDate(c.getStartDate());
        dto.setEndDate(c.getEndDate());

        dto.setMultiplierPlastic(c.getMultiplierPlastic());
        dto.setMultiplierMetal(c.getMultiplierMetal());
        dto.setMultiplierGlass(c.getMultiplierGlass());
        dto.setMultiplierPaper(c.getMultiplierPaper());
        dto.setMultiplierOrganic(c.getMultiplierOrganic());

        dto.setMilestoneEventsTier1(c.getMilestoneEventsTier1());
        dto.setMilestoneEventsTier2(c.getMilestoneEventsTier2());
        dto.setMilestoneEventsTier3(c.getMilestoneEventsTier3());
        dto.setMilestoneEventsTier4(c.getMilestoneEventsTier4());
        dto.setMilestoneEventsBonusTier1(c.getMilestoneEventsBonusTier1());
        dto.setMilestoneEventsBonusTier2(c.getMilestoneEventsBonusTier2());
        dto.setMilestoneEventsBonusTier3(c.getMilestoneEventsBonusTier3());
        dto.setMilestoneEventsBonusTier4(c.getMilestoneEventsBonusTier4());

        dto.setMilestoneWeightTier1(c.getMilestoneWeightTier1());
        dto.setMilestoneWeightTier2(c.getMilestoneWeightTier2());
        dto.setMilestoneWeightTier3(c.getMilestoneWeightTier3());
        dto.setMilestoneWeightTier4(c.getMilestoneWeightTier4());
        dto.setMilestoneWeightBonusTier1(c.getMilestoneWeightBonusTier1());
        dto.setMilestoneWeightBonusTier2(c.getMilestoneWeightBonusTier2());
        dto.setMilestoneWeightBonusTier3(c.getMilestoneWeightBonusTier3());
        dto.setMilestoneWeightBonusTier4(c.getMilestoneWeightBonusTier4());

        dto.setPrizePoolEth(c.getPrizePoolEth());
        dto.setParameterHash(c.getParameterHash());
        dto.setWinnerAddress(c.getWinnerAddress());

        dto.setCreatedAt(c.getCreatedAt());
        dto.setActivatedAt(c.getActivatedAt());
        dto.setClosedAt(c.getClosedAt());
        return dto;
    }
}