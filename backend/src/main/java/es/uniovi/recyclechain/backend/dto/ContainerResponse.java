package es.uniovi.recyclechain.backend.dto;

import es.uniovi.recyclechain.backend.model.Container;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO for Container responses.
 * Exposes the UUID (for QR display), status, batch metadata, and timestamps.
 * The UUID is the value encoded in the printed QR code.
 */
@Data
public class ContainerResponse {

    private Long id;
    private String uuid;
    private String status;

    // Batch metadata — resolved from ContainerBatch so the frontend
    // can display brand, material and weight without a separate call
    private Long batchId;
    private String brand;
    private String materialType;
    private Double unitWeightKg;
    private Long campaignId;
    private String campaignName;

    private LocalDateTime scannedAt;
    private LocalDateTime depositedAt;
    private LocalDateTime createdAt;

    public static ContainerResponse from(Container c) {
        ContainerResponse dto = new ContainerResponse();
        dto.setId(c.getId());
        dto.setUuid(c.getUuid());
        dto.setStatus(c.getStatus().name());
        dto.setBatchId(c.getBatch().getId());
        dto.setBrand(c.getBatch().getBrand());
        dto.setMaterialType(c.getBatch().getMaterialType());
        dto.setUnitWeightKg(c.getBatch().getUnitWeightKg());
        dto.setCampaignId(c.getBatch().getCampaign().getId());
        dto.setCampaignName(c.getBatch().getCampaign().getName());
        dto.setScannedAt(c.getScannedAt());
        dto.setDepositedAt(c.getDepositedAt());
        dto.setCreatedAt(c.getCreatedAt());
        return dto;
    }
}