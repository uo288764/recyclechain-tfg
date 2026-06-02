package es.uniovi.recyclechain.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

/**
 * DTO for creating a ContainerBatch.
 * unitCount determines how many individual Container records are generated,
 * each with a unique UUID for printing as a QR code.
 */
@Data
public class ContainerBatchRequest {

    @NotBlank
    private String brand;

    /**
     * Material type key: plastic, metal, glass, paper, organic.
     * Must match a key recognised by the gamification engine.
     */
    @NotBlank
    private String materialType;

    /**
     * Estimated weight per individual container unit, in kilograms.
     * Used by the gamification engine — prevents manual weight fraud.
     */
    @NotNull
    @Positive
    private Double unitWeightKg;

    /**
     * ID of the campaign this batch belongs to.
     * Must reference an existing campaign in DRAFT or ACTIVE state.
     */
    @NotNull
    private Long campaignId;

    /**
     * Number of individual Container records to generate.
     * Each will have a unique UUID encoded as a printed QR code.
     */
    @NotNull
    @Positive
    private Integer unitCount;
}