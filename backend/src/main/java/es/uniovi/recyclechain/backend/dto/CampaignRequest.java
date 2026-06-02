package es.uniovi.recyclechain.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/**
 * DTO for creating or updating a Campaign (DRAFT state only).
 * Default values match application.properties so the admin form
 * comes pre-filled with standard parameters.
 */
@Data
public class CampaignRequest {

    @NotBlank
    private String name;

    private String description;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    private Double prizePoolEth;

    // Material multipliers — defaults match application.properties
    private Double multiplierPlastic    = 1.2;
    private Double multiplierMetal      = 1.5;
    private Double multiplierGlass      = 0.8;
    private Double multiplierPaper      = 0.6;
    private Double multiplierOrganic    = 0.5;

    // Event milestone thresholds
    private Integer milestoneEventsTier1 = 5;
    private Integer milestoneEventsTier2 = 12;
    private Integer milestoneEventsTier3 = 25;
    private Integer milestoneEventsTier4 = 50;

    // Event milestone bonuses
    private Double milestoneEventsBonusTier1 = 1.1;
    private Double milestoneEventsBonusTier2 = 1.2;
    private Double milestoneEventsBonusTier3 = 1.35;
    private Double milestoneEventsBonusTier4 = 1.5;

    // Weight milestone thresholds (kg)
    private Double milestoneWeightTier1 = 5.0;
    private Double milestoneWeightTier2 = 15.0;
    private Double milestoneWeightTier3 = 35.0;
    private Double milestoneWeightTier4 = 75.0;

    // Weight milestone bonuses
    private Double milestoneWeightBonusTier1 = 1.05;
    private Double milestoneWeightBonusTier2 = 1.1;
    private Double milestoneWeightBonusTier3 = 1.15;
    private Double milestoneWeightBonusTier4 = 1.25;
}