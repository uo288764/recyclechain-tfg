package es.uniovi.recyclechain.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a batch of identical physical containers associated with a campaign.
 *
 * A ContainerBatch is created by an administrator or sponsor company and defines
 * the material type and estimated unit weight for all containers in the batch.
 * Individual Container records are generated from this batch, each with a unique
 * UUID encoded as a printed QR code.
 *
 * The association to a Campaign is mandatory — a batch without a campaign has no
 * operational meaning, as tokens cannot be issued without an active campaign context.
 * This enables per-campaign, per-container traceability for Extended Producer
 * Responsibility (EPR) compliance reporting.
 */
@Entity
@Table(name = "container_batch")
public class ContainerBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String brand;

    /**
     * Material type key recognised by the gamification engine:
     * plastic, metal, glass, paper, organic.
     */
    @Column(name = "material_type", nullable = false)
    private String materialType;

    /**
     * Estimated weight per individual container unit, in kilograms.
     * Used by the gamification engine to calculate RCYC tokens without
     * requiring manual weight input from the user, preventing fraud.
     */
    @Column(name = "unit_weight_kg", nullable = false)
    private Double unitWeightKg;

    /**
     * The campaign this batch belongs to.
     * Mandatory — a batch cannot exist without a campaign.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;

    /**
     * Total number of individual Container units generated from this batch.
     */
    @Column(name = "unit_count", nullable = false)
    private Integer unitCount;

    @OneToMany(mappedBy = "batch", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Container> containers = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public ContainerBatch() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getMaterialType() { return materialType; }
    public void setMaterialType(String materialType) { this.materialType = materialType; }

    public Double getUnitWeightKg() { return unitWeightKg; }
    public void setUnitWeightKg(Double unitWeightKg) { this.unitWeightKg = unitWeightKg; }

    public Campaign getCampaign() { return campaign; }
    public void setCampaign(Campaign campaign) { this.campaign = campaign; }

    public Integer getUnitCount() { return unitCount; }
    public void setUnitCount(Integer unitCount) { this.unitCount = unitCount; }

    public List<Container> getContainers() { return containers; }
    public void setContainers(List<Container> containers) { this.containers = containers; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}