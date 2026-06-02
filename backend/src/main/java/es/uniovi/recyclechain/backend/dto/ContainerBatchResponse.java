package es.uniovi.recyclechain.backend.dto;

import es.uniovi.recyclechain.backend.model.ContainerBatch;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ContainerBatchResponse {

    private Long id;
    private String brand;
    private String materialType;
    private Double unitWeightKg;
    private Long campaignId;
    private String campaignName;
    private Integer unitCount;
    private LocalDateTime createdAt;

    public static ContainerBatchResponse from(ContainerBatch b) {
        ContainerBatchResponse dto = new ContainerBatchResponse();
        dto.setId(b.getId());
        dto.setBrand(b.getBrand());
        dto.setMaterialType(b.getMaterialType());
        dto.setUnitWeightKg(b.getUnitWeightKg());
        dto.setCampaignId(b.getCampaign().getId());
        dto.setCampaignName(b.getCampaign().getName());
        dto.setUnitCount(b.getUnitCount());
        dto.setCreatedAt(b.getCreatedAt());
        return dto;
    }
}